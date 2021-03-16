<template>
  <div>
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input
          @keyup.enter.native="handleFilter"
          size="mini"
          style="width: 200px;"
          class="filter-item"
          :placeholder="'名稱'"
          v-model="listQuery.key"
        ></el-input>
        <el-button
          class="filter-item"
          size="mini"
          v-waves
          icon="el-icon-search"
          @click="handleFilter"
        >搜索</el-button>
        <permission-btn moduleName="openJobs" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container">
      <div class="bg-white">
        <el-table
          ref="mainTable"
          :key="tableKey"
          :data="list"
          v-loading="listLoading"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @row-click="rowClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" align="center" width="55"></el-table-column>
          <el-table-column align="center" prop="jobName" label="任務名稱" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" min-width="80px" prop="runCount" label="執行次數"></el-table-column>
          <el-table-column align="center" prop="lastRunTime" label="最後一次執行" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="jobCall" label="任務地址" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="cron" label="CRON表達式" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" width="100" label="運行狀態">
            <template slot-scope="scope">
              <span :class="scope.row.status|statusFilter">{{scope.row.status|filterStatus}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="remark" label="備註" show-overflow-tooltip></el-table-column>

          <el-table-column
            align="center"
            :label="'操作'"
            width="80"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                :type="`${scope.row.status === 0 ? 'success' : 'danger'}`"
                @click="handleModifyStatus(scope.row)"
              >{{scope.row.status === 0 ? '啟用' : '停止'}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="handleCurrentChange"
        />
      </div>

      <el-dialog
        v-el-drag-dialog
        class="dialog-mini"
        width="600px"
        :title="textMap[dialogStatus]"
        :visible.sync="dialogFormVisible"
      >
        <el-form
          :rules="rules"
          ref="dataForm"
          :model="temp"
          label-position="right"
          label-width="130px"
        >
          <el-form-item v-if="temp.id" size="small" :label="'ID'" prop="id">
            <el-input :disabled="true" v-model="temp.id"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'任務名稱'" prop="jobName">
            <el-input v-model="temp.jobName"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'CRON表達式'" prop="cron">
            <cron-input v-model="temp.cron"></cron-input>
          </el-form-item>
          <el-form-item size="small" :label="'任務執行方式'" prop="jobType">
            <el-select
              class="filter-item"
              v-model="temp.jobType"
              placeholder="選擇執行方式"
              @change="temp.jobCall = ''"
            >
              <el-option
                v-for="item in  jogTypes"
                :key="item.key"
                :label="item.name"
                :value="item.key"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item size="small" :label="'任務地址'" prop="jobCall">
            <el-input v-if="temp.jobType !== 0" v-model="temp.jobCall"></el-input>
            <el-select v-else class="filter-item" v-model="temp.jobCall" placeholder="選擇執行方式">
              <el-option v-for="item in  jobCallList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item size="small" :label="'任務參數，JSON格式'" prop="jobCallParams">
            <el-input v-model="temp.jobCallParams"></el-input>
          </el-form-item>
          <el-form-item size="small" :label="'備註'" prop="remark">
            <el-input v-model="temp.remark"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="mini" v-if="dialogStatus=='create'" type="primary" @click="createData">確認</el-button>
          <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import * as openJobs from "@/api/openjobs";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import CronInput from "@/components/cron/cron-input";
export default {
  name: "openJob",
  components: {
    Sticky,
    permissionBtn,
    Pagination,
    CronInput,
  },
  directives: {
    waves,
    elDragDialog,
  },
  data() {
    return {
      multipleSelection: [], // 列表checkbox選中的值
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        // 查詢條件
        page: 1,
        limit: 20,
        key: undefined,
        appId: undefined,
      },
      // 0：本地任務；1：外部接口任務
      jogTypes: [
        {
          key: 0,
          name: "本地任務",
        },
        {
          key: 1,
          name: "外部接口任務",
        },
      ],
      statusOptions: [
        {
          key: 0,
          display_name: "停止",
        },
        {
          key: 1,
          display_name: "正在運行",
        },
        {
          key: 2,
          display_name: "暫停",
        },
      ],
      temp: {
        id: "", // Id
        jobName: "", // 任務名稱
        jobType: 0, // 任務執行方式0：本地任務；1：外部接口任務
        jobCall: "", // 任務地址
        jobCallParams: "", // 任務參數，JSON格式
        cron: "", // CRON表達式
        // status: 0, // 任務運行狀態（0：停止，1：正在運行，2：暫停）
        remark: "", // 備註
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "編輯",
        create: "添加",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        cron: [
          {
            required: true,
            message: "規則不能為空",
            trigger: "blur",
          },
        ],
        jobName: [
          {
            required: true,
            message: "名稱不能為空",
            trigger: "blur",
          },
        ],
        jobType: [
          {
            required: true,
            message: "名稱不能為空",
            trigger: "blur",
          },
        ],
        jobCall: [
          {
            required: true,
            message: "任務地址不能為空",
            trigger: "blur",
          },
        ],
      },
      jobCallList: [],
      downloadLoading: false,
    };
  },
  filters: {
    filterJobType(val) {
      switch (val) {
        case 0:
          return "本地任務";
        case 1:
          return "外部接口任務";
      }
    },
    filterStatus(val) {
      switch (val) {
        case 0:
          return "停止";
        case 1:
          return "正在運行";
        case 2:
          return "暫停";
      }
    },
    statusFilter(val) {
      const disable = val === 0;
      const statusMap = {
        false: "color-success",
        true: "color-danger",
      };
      return statusMap[disable];
    },
  },
  created() {
    this.getList();
    this.queryLocalHandlers();
  },
  methods: {
    queryLocalHandlers() {
      openJobs.QueryLocalHandlers().then((res) => {
        this.jobCallList = res.result;
      });
    },
    rowClick(row) {
      this.$refs.mainTable.clearSelection();
      this.$refs.mainTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onBtnClicked: function (domId) {
      switch (domId) {
        case "btnAdd":
          this.handleCreate();
          break;
        case "btnEdit":
          if (this.multipleSelection.length !== 1) {
            this.$message({
              message: "只能選中一個進行編輯",
              type: "error",
            });
            return;
          }
          this.handleUpdate(this.multipleSelection[0]);
          break;
        case "btnDel":
          if (this.multipleSelection.length < 1) {
            this.$message({
              message: "至少刪除一個",
              type: "error",
            });
            return;
          }
          this.handleDelete(this.multipleSelection);
          break;
        default:
          break;
      }
    },
    getList() {
      this.listLoading = true;
      openJobs.getList(this.listQuery).then((response) => {
        this.list = response.data;
        this.total = response.count;
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    handleModifyStatus(row) {
      // 模擬修改狀態
      const status = row.status === 0 ? 1 : 0;
      this.$confirm(
        `確認${status === 0 ? "停止" : "啟動"}定時任務"${row.jobName}"?`,
        "提示",
        {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
          beforeClose: (action, instance, done) => {
            if (action === "confirm") {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = "執行中...";
              openJobs
                .changeStatus({ id: row.id, status: status })
                .then(() => {
                  this.$message.success(
                    `"${row.jobName}"${status === 0 ? "已停止" : "已啟動"}`
                  );
                  instance.confirmButtonLoading = false;
                  instance.confirmButtonText = "確定";
                  row.status = status;
                  done();
                })
                .catch(() => {
                  instance.confirmButtonLoading = false;
                  instance.confirmButtonText = "確定";
                });
            } else {
              done();
            }
          },
        }
      );
    },
    resetTemp() {
      this.temp = {
        id: "",
        jobName: "",
        jobType: 0,
        jobCall: "",
        jobCallParams: "",
        cron: "",
        remark: "",
      };
    },
    handleCreate() {
      // 彈出添加框
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      // 保存提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          openJobs.add(this.temp).then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "創建成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row) {
      // 彈出編輯框
      this.temp = Object.assign({}, row); // copy obj
      this.temp.jobCallParams =
        row.jobCallParams === "null" ? "" : row.jobCallParams;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      // 更新提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          openJobs.update(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleDelete(rows) {
      // 多行刪除
      this.$confirm(`確認刪除?`, "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "執行中...";
            openJobs
              .del(rows.map((u) => u.id))
              .then(() => {
                this.$notify({
                  title: "成功",
                  message: "刪除成功",
                  type: "success",
                  duration: 2000,
                });
                instance.confirmButtonLoading = false;
                instance.confirmButtonText = "確定";
                rows.forEach((row) => {
                  const index = this.list.indexOf(row);
                  this.list.splice(index, 1);
                });
                done();
              })
              .catch(() => {
                instance.confirmButtonLoading = false;
                instance.confirmButtonText = "確定";
              });
          } else {
            done();
          }
        },
      });
    },
  },
};
</script>
<style>
.dialog-mini .el-select {
  width: 100%;
}
</style>
