<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input
          @keyup.enter.native="handleFilter"
          size="mini"
          style="width: 200px;"
          class="filter-item"
          :placeholder="'名稱'"
          v-model="firstQuery.key"
        ></el-input>
        <el-button
          class="filter-item"
          size="mini"
          v-waves
          icon="el-icon-search"
          @click="handleFilter"
        >搜索</el-button>
        <permission-btn moduleName="wmsInboundOrderTbls" size="mini" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item flex-column">
      <div class="flex-item">
        <el-card shadow="nerver" class="demo-card fh">
          <el-table
            ref="multipleTable"
            id="firstCard"
            :key="tableKey"
            :data="mainList"
            v-loading="listLoading"
            border
            tooltip-effect="dark"
            style="width: 100%;"
            height="calc(100% - 52px)"
            @row-click="rowClickFirstTable"
          >
            <el-table-column width="55" align="center">
              <template slot-scope="scope">
                <el-radio :label="scope.row.id" v-model="radio">{{''}}</el-radio>
              </template>
            </el-table-column>
            <!--使用服務器返回的表頭，如果複雜的表頭和格式解析，請自己定義表格格式-->
            <template v-for="(headerItem,index) in firstHeaderList">
              <!-- 如果需要單獨處理的格式化顯示，可以在這裡單獨處理 -->
              <el-table-column
                v-if="headerItem.key=='orderType'"
                :key="index"
                :label="headerItem.description"
              >
                <template slot-scope="scope">
                  <select-type
                    :isEdit="false"
                    typeId="SYS_INBOUNDTYPE"
                    v-model="scope.row[headerItem.key]"
                  ></select-type>
                </template>
              </el-table-column>
              <el-table-column
                v-else-if="headerItem.key=='goodsType'"
                :key="index"
                :label="headerItem.description"
              >
                <template slot-scope="scope">
                  <select-type
                    :isEdit="false"
                    typeId="SYS_GOODSTYPE"
                    v-model="scope.row[headerItem.key]"
                  ></select-type>
                </template>
              </el-table-column>
              <el-table-column
                v-else-if="headerItem.key=='transferType'"
                :key="index"
                :label="headerItem.description"
              >
                <template slot-scope="scope">
                  <select-type
                    :isEdit="false"
                    typeId="SYS_SHIPTYPE"
                    v-model="scope.row[headerItem.key]"
                  ></select-type>
                </template>
              </el-table-column>
              <el-table-column
                v-else-if="headerItem.type=='String' ||headerItem.type=='DateTime'"
                :key="index"
                :prop="headerItem.key"
                :label="headerItem.description"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                v-else-if="headerItem.key=='status' || headerItem.key === 'inBondedArea' || headerItem.key === 'enable'"
                :label="headerItem.description"
                min-width="100px"
                :key="index"
              >
                <template slot-scope="scope">
                  <span>{{handleFilterStatus(scope.row[headerItem.key], headerItem.key)}}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :label="headerItem.description"
                min-width="100px"
                :key="index"
              >
                <template slot-scope="scope">
                  <span>{{scope.row[headerItem.key]}}</span>
                </template>
              </el-table-column>
            </template>
          </el-table>
          <pagination
            v-show="firstTotal>0"
            :total="firstTotal"
            :page.sync="firstQuery.page"
            :limit.sync="firstQuery.limit"
            @pagination="handleCurrentChange"
          />
        </el-card>
      </div>
      <el-row class="flex-item">
        <el-col :span="showTitleDialog ? 12 : 0" class="fh form-card">
          <el-card shadow="nerver" class="demo-card fh">
            <div slot="header">
              <span v-if="radio == ''">頭信息</span>
              <span v-else>{{radio}}頭信息</span>
            </div>
            <el-form
              :rules="mainRules"
              ref="dataForm"
              :model="firstTemp"
              label-position="right"
              label-width="100px"
              style="height:calc(100% - 34px);overflow: auto;"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'入庫通知單號'" prop="id">
                    <el-input v-model="firstTemp.id" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'相關單據號'" prop="externalNo">
                    <el-input v-model="firstTemp.externalNo" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'單據類型'" prop="externalType">
                    <el-input v-model="firstTemp.externalType" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'狀態'">
                    <el-select
                      class="filter-item"
                      :disabled="!editModel"
                      v-model="firstTemp.status"
                      placeholder="Please select"
                    >
                      <el-option
                        v-for="item in  statusOptions"
                        :key="item.key"
                        :label="item.display_name"
                        :value="item.key"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'入庫類型'" prop="orderType">
                    <select-type
                      :isEdit="true"
                      :disabled="!editModel"
                      typeId="SYS_INBOUNDTYPE"
                      v-model="firstTemp.orderType"
                    ></select-type>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'商品類別'" prop="goodsType">
                    <select-type
                      :isEdit="true"
                      :disabled="!editModel"
                      typeId="SYS_GOODSTYPE"
                      v-model="firstTemp.goodsType"
                    ></select-type>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'采購單號'" prop="purchaseNo">
                    <el-input v-model="firstTemp.purchaseNo" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'倉庫編號'" prop="stockId">
                    <el-input v-model="firstTemp.stockId" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'貨主編號'" prop="ownerId">
                    <el-input v-model="firstTemp.ownerId" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8"></el-col>
                <el-col :span="8"></el-col>
                <el-col :span="8"></el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'承運人編號'" prop="shipperId">
                    <el-input v-model="firstTemp.shipperId" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'供應商編號'" prop="supplierId">
                    <el-input v-model="firstTemp.supplierId" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'承運方式'" prop="transferType">
                    <select-type
                      :isEdit="true"
                      :disabled="!editModel"
                      typeId="SYS_SHIPTYPE"
                      v-model="firstTemp.transferType"
                    ></select-type>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'備註'" prop="remark">
                    <el-input v-model="firstTemp.remark" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'有效標誌'">
                    <el-switch
                      v-model="firstTemp.enable"
                      :active-value="true"
                      :disabled="!editModel"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item size="mini" :label="'是否入保稅庫'">
                    <el-switch
                      v-model="firstTemp.inBondedArea"
                      :disabled="!editModel"
                      :active-value="true"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item size="mini" :label="'預定時間'" prop="scheduledInboundTime">
                    <el-date-picker
                      v-model="firstTemp.scheduledInboundTime"
                      type="datetime"
                      style="width: 185px;"
                      size="mini"
                      :disabled="!editModel"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item size="mini" :label="'銷退箱數'" prop="returnBoxNum">
                    <el-input v-model="firstTemp.returnBoxNum" :disabled="!editModel"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </el-col>

        <!-- 第二部分多選 -->
        <el-col :span="!showTitleDialog ? 24 : 12" class="fh detail-card">
          <el-card shadow="nerver" class="demo-card fh" id="secondCard">
            <div slot="header">
              <i
                class="show-title-button"
                :class="showTitleDialog ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"
                :title="showTitleDialog ? '展開' : '收縮'"
                @click="showTitleDialog=!showTitleDialog"
              ></i>
              <span v-if="radio == ''">訂單明細</span>
              <span v-else>{{radio}}訂單明細</span>
              <el-button
                v-if="editModel"
                class="filter-item edit-button"
                size="mini"
                v-waves
                icon="el-icon-plus"
                @click="onBtnClicked('btnAddDetail')"
              >添加</el-button>
              <el-button
                v-if="editModel"
                class="filter-item edit-button delete-button"
                size="mini"
                v-waves
                icon="el-icon-delete"
                @click="onBtnClicked('btnDelDetail')"
              >刪除</el-button>
            </div>
            <el-table
              ref="secondTable"
              border
              :data="secondList"
              tooltip-effect="dark"
              style="width: 100%"
              height="calc(100% - 44px)"
              @row-click="rowClickSecondTable"
              @selection-change="selChangeSecondTable"
            >
              <el-table-column width="55" type="selection" align="center" prop="custid"></el-table-column>

              <!--使用服務器返回的表頭，如果複雜的表頭和格式解析，請自己定義表格格式-->
              <template v-for="(headerItem,index) in secondHeaderList">
                <el-table-column
                  v-if="headerItem.type=='String'||headerItem.type=='Decimal' ||headerItem.type=='DateTime'"
                  :key="index"
                  :prop="headerItem.key"
                  :label="headerItem.description"
                  show-overflow-tooltip
                  :min-width="(headerItem.key ==='prodDate' || headerItem.key ==='expireDate') ? '150px' : '100px'"
                >
                  <template slot-scope="scope">
                    <div v-if="editModel && isEdit(headerItem.key)">
                      <el-date-picker
                        v-model="scope.row[headerItem.key]"
                        type="date"
                        :placeholder="scope.row[headerItem.description]"
                        v-if="headerItem.key ==='prodDate' || headerItem.key ==='expireDate'"
                        style="width: 130px;"
                        value-format="yyyy-MM-dd"
                        size="mini"
                      ></el-date-picker>
                      <el-input
                        v-else
                        type="text"
                        size="mini"
                        v-model="scope.row[headerItem.key]"
                        :placeholder="scope.row[headerItem.description]"
                      ></el-input>
                    </div>
                    <span v-else>{{scope.row[headerItem.key]}}</span>
                  </template>
                </el-table-column>

                <el-table-column
                  v-else-if="headerItem.key=='inStockStatus' || headerItem.key === 'asnStatus'"
                  :label="headerItem.description"
                  min-width="100px"
                  :key="index"
                >
                  <template slot-scope="scope">
                    <span>{{handleFilterStatus(scope.row[headerItem.key], headerItem.key)}}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-else
                  :label="headerItem.description"
                  align="center"
                  min-width="120px"
                  :key="index"
                >
                  <template slot-scope="scope">
                    <div v-if="editModel">
                      <el-select
                        v-if="headerItem.key === 'asnStatus'"
                        size="mini"
                        v-model="scope.row[headerItem.key]"
                      >
                        <el-option :value="1" :label="'狀態1'"></el-option>
                      </el-select>
                      <el-switch
                        v-else
                        size="mini"
                        v-model="scope.row[headerItem.key]"
                        :active-value="true"
                        :inactive-value="false"
                      ></el-switch>
                    </div>
                    <span v-else>{{scope.row[headerItem.key]|filterInt}}</span>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            <!-- 分頁 -->
            <pagination
              v-show="secondTotal>0"
              :total="secondTotal"
              :page.sync="secondQuery.page"
              :limit.sync="secondQuery.limit"
              @pagination="handleSecondPage"
            />
          </el-card>
        </el-col>
      </el-row>
      <el-card shadow="nerver" v-if="editModel" style="text-align: right;padding-bottom: 10px;">
        <el-row>
          <el-col :span="24">
            <el-button size="mini" @click="editModel = false">取消</el-button>
            <el-button
              size="mini"
              v-if="dialogStatus=='create'"
              type="primary"
              @click="createData"
            >確認</el-button>
            <el-button size="mini" v-else type="primary" @click="updateData">確認</el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import * as wmsInboundOrderTbls from "@/api/wmsinboundordertbls";
import * as wmsInboundOrderDtbls from "@/api/wmsinboundorderdtbls";
import waves from "@/directive/waves"; // 水波紋指令
import Sticky from "@/components/Sticky";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-dragDialog";
import { parseTime } from "@/utils/index";
import SelectType from "@/components/SelectType";
import { mapGetters } from "vuex";
export default {
  name: "wmsInboundOrderTbl",
  components: {
    Sticky,
    permissionBtn,
    Pagination,
    SelectType,
  },
  directives: {
    waves,
    elDragDialog,
  },
  data() {
    return {
      // ------------------------主列表數據（頭）-----------------------------
      firstHeaderList: [], // 主列表列定義
      radio: "", // 主列表選中項
      firstQuery: {
        // 主列表查詢條件
        page: 1,
        limit: 20,
        key: undefined,
        appId: undefined,
      },
      mainList: null, // 主列表值
      firstTotal: 0, // 主列表總條數
      listLoading: true, // 主列表記錄總數
      tableKey: 0,
      showTitleDialog: true,

      editModel: false, // 是否為編輯模式
      editType: "edit", // 編輯類型
      dialogStatus: "", // 主修改對話框狀態create/update
      selectRow: {},
      firstTempDefaultVal: {
        // 頭信息默認值
        id: "", // 入庫通知單號
        externalNo: "", // 相關單據號
        externalType: "", // 相關單據類型
        status: "", // 入庫通知單狀態(SYS_INSTCINFORMSTATUS)
        orderType: "", // 入庫類型(SYS_INSTCTYPE)
        goodsType: "", // 商品類別
        purchaseNo: "", // 采購單號
        stockId: "", // 倉庫編號
        ownerId: "", // 貨主編號(固定值CQM)
        shipperId: "", // 承運人編號
        supplierId: "", // 供應商編號
        scheduledInboundTime: "", // 預定入庫時間
        remark: "", // 備註
        enable: false, // 有效標誌
        transferType: "", // 承運方式
        inBondedArea: false, // 是否入保稅庫(0:否,1:是)
        returnBoxNum: "", // 銷退箱數
        extendInfo: "", // 其他信息,防止自動生成代碼最後加逗號，可以刪除
      },
      firstTemp: {}, // 當前選中的頭信息
      mainRules: {
        appId: [
          {
            required: true,
            message: "必須選擇一個應用",
            trigger: "change",
          },
        ],
        name: [
          {
            required: true,
            message: "名稱不能為空",
            trigger: "blur",
          },
        ],
      },
      // ------------------------明細列表數據-------------------------------------
      secondHeaderList: [], // 明細列表列定義
      secondList: [], // 明細列表值
      secondQuery: {}, // 明細列表的過濾條件，如頁碼、每頁條數，搜索關鍵字等
      secondTotal: 0, // 明細列表總條數
      multipleSelection: [], // 明細列表checkbox選中的值,

      // ------------------------通用數據項-------------------------------------
      statusOptions: [
        {
          key: 1,
          display_name: "停用",
        },
        {
          key: 0,
          display_name: "正常",
        },
      ],

      textMap: {
        update: "編輯",
        create: "添加",
      },
      excelName: `訂單${parseTime(new Date())}`,
    };
  },
  computed: {
    ...mapGetters(["defaultorgid", "typeDataLists"]),
    json_fields() {
      let obj = {};
      this.firstHeaderList.length > 0 &&
        this.firstHeaderList.forEach((item) => {
          if (!item.description) return;
          if (
            item.key === "orderType" ||
            item.key === "goodsType" ||
            item.key === "transferType"
          ) {
            obj[item.description] = {
              field: item.key,
              callback: (value) => {
                return this.handleFilterState(value, item.key);
              },
            };
            return;
          }
          if (
            item.key === "status" ||
            item.key === "inBondedArea" ||
            item.key === "enable"
          ) {
            obj[item.description] = {
              field: item.key,
              callback: (value) => {
                return this.handleFilterStatus(value, item.key);
              },
            };
            return;
          }
          obj[item.description] = item.key;
        });
      return obj;
    },
  },
  filters: {
    filterInt(val) {
      switch (val) {
        case null:
          return "";
        case 1:
          return "狀態1";
        case 2:
          return "狀態2";
        default:
          return "默認狀態";
      }
    },
    statusFilter(disable) {
      const statusMap = {
        false: "color-success",
        true: "color-danger",
      };
      return statusMap[disable];
    },
  },
  created() {
    this.getList();
  },
  methods: {
    handleFilterStatus(val, key) {
      const status = [
        {
          key: false,
          display_name: "否",
        },
        {
          key: true,
          display_name: "是",
        },
      ];
      const arr = key === "status" ? this.statusOptions : status;
      return key === "asnStatus"
        ? val === 0
          ? "否"
          : "是"
        : arr.find((item) => item.key === val).display_name;
    },
    handleFilterState(val, key) {
      const typeIds = {
        orderType: "SYS_INBOUNDTYPE",
        goodsType: "SYS_GOODSTYPE",
        transferType: "SYS_SHIPTYPE",
      };
      const obj =
        this.typeDataLists.length > 0 &&
        this.typeDataLists.find((item) => item.typeId === typeIds[key]);
      const arr = (obj && obj.typeDatas) || [];
      const item =
        (arr.length > 0 &&
          arr.find((item) => item.dtCode === val) &&
          arr.find((item) => item.dtCode === val).name) ||
        "";
      return item || val || "";
    },
    isEdit(key) {
      switch (key) {
        case "updateUserName":
        case "updateTime":
        case "createUserName":
        case "createTime":
          return false;
        default:
          return true;
      }
    },
    // ------------------------通用處理函數-------------------------------------
    onBtnClicked: function (domId, callback) {
      console.log("you click:" + domId);
      switch (domId) {
        case "btnAdd": // 添加新記錄
          this.resetFirstTemp();
          this.secondList = [];
          this.dialogStatus = "create";
          this.editModel = true;
          this.editType = "add";
          this.$nextTick(() => {
            this.$refs["dataForm"].clearValidate();
          });
          break;
        case "btnEdit": // 編輯頭
          this.firstTemp = Object.assign({}, this.selectRow);
          if (this.firstTemp.id === "") {
            this.editModel = false;
            this.$message({
              message: "請選擇要修改的項",
              type: "error",
            });
            return;
          }
          this.dialogStatus = "update";
          this.editModel = true;
          this.editType = "edit";
          this.$nextTick(() => {
            this.$refs["dataForm"].clearValidate();
          });
          break;
        case "btnDel": // 刪除主表
          if (this.firstTemp.id === "") {
            this.$message({
              message: "請選擇要刪除的項",
              type: "error",
            });
            return;
          }
          this.handleFirstDel(this.firstTemp);
          break;
        case "btnAddDetail": // 添加明細行
          this.handleAddOrderDetail();
          break;
        case "btnDelDetail": // 刪除明細行
          if (this.multipleSelection.length < 1) {
            this.$message({
              message: "至少刪除一個",
              type: "error",
            });
            return;
          }
          this.handleSecondDel(this.multipleSelection);
          break;
        case "btnExport":
          this.handleDownExcel(callback);
          break;
        default:
          break;
      }
    },
    handleDownExcel(callback) {
      let obj = {};
      obj.json_fields = this.json_fields;
      obj.data = this.mainList;
      obj.excelName = `訂單${parseTime(new Date())}`;
      callback(obj);
    },
    // ------------------------主數據列表處理------------------------------------
    getList() {
      this.listLoading = true;
      wmsInboundOrderTbls.getList(this.firstQuery).then((response) => {
        response.columnHeaders.forEach((item) => {
          // 首字母小寫
          item.key =
            item.key.substring(0, 1).toLowerCase() + item.key.substring(1);
        });
        this.firstHeaderList = response.columnHeaders.filter(
          (u) => u.browsable
        );
        this.mainList = response.data;
        this.firstTotal = response.count;

        if (this.firstTotal > 0) {
          this.rowClickFirstTable(this.mainList[0]);
        }

        this.listLoading = false;
      });
    },
    rowClickFirstTable(row) {
      // 點擊行
      this.radio = row.id;
      this.secondQuery.page = 1;
      this.secondQuery.limit = 10;
      this.querySecondList(this.radio);
      this.showTitleDetail(row);
    },
    handleFilter() {
      this.firstQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.firstQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.firstQuery.page = val.page;
      this.firstQuery.limit = val.limit;
      this.getList();
    },
    resetFirstTemp() {
      this.firstTemp = Object.assign({}, this.firstTempDefaultVal);
    },
    createData() {
      // 保存提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let tempData = Object.assign({}, this.firstTemp);
          tempData = this.setDetails(tempData);
          tempData.OrgId = this.defaultorgid;
          wmsInboundOrderTbls.add(tempData).then(() => {
            this.mainList.unshift(this.firstTemp);
            this.editModel = false;
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
    showTitleDetail(row) {
      // 彈出編輯框
      this.selectRow = Object.assign({}, row); // 新增訂單時保存當前選中行
      this.firstTemp = Object.assign({}, row); // copy obj
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    setDetails(tempData) {
      // 處理明細
      tempData.wmsInboundOrderDtblReqs = [];
      tempData.scheduledInboundTime =
        tempData.scheduledInboundTime &&
        parseTime(tempData.scheduledInboundTime, "{y}-{m}-{d} {h}:{i}:{s}");
      tempData.returnBoxNum =
        (tempData.returnBoxNum && parseInt(tempData.returnBoxNum)) || 0;
      this.secondList.length > 0 &&
        this.secondList.forEach((item) => {
          const obj = {
            id: item.id || "",
            orderId: item.orderId || "",
            price: (item.price && parseFloat(item.price)) || 0,
            priceNoTax: (item.priceNoTax && parseFloat(item.priceNoTax)) || 0,
            inStockStatus: item.inStockStatus || false,
            asnStatus: (item.asnStatus && parseInt(item.asnStatus)) || 0,
            goodsId: item.goodsId || "",
            goodsBatch: item.goodsBatch || "",
            qualityFlg: item.qualityFlg || "",
            orderNum: (item.orderNum && parseFloat(item.orderNum)) || 0,
            inNum: (item.inNum && parseFloat(item.inNum)) || 0,
            leaveNum: (item.leaveNum && parseFloat(item.leaveNum)) || 0,
            holdNum: (item.holdNum && parseFloat(item.holdNum)) || 0,
            prodDate: item.prodDate,
            expireDate: item.expireDate,
            taxRate: (item.taxRate && parseFloat(item.taxRate)) || 0,
            ownerId: item.ownerId || "",
            remark: item.remark || "",
          };
          tempData.wmsInboundOrderDtblReqs.push(obj);
        });
      return tempData;
    },
    updateData() {
      // 更新提交
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let tempData = Object.assign({}, this.firstTemp);
          tempData = this.setDetails(tempData);
          wmsInboundOrderTbls.update(tempData).then(() => {
            for (const v of this.mainList) {
              if (v.id === this.firstTemp.id) {
                const index = this.mainList.indexOf(v);
                this.mainList.splice(index, 1, this.firstTemp);
                break;
              }
            }

            this.editModel = false;
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
    handleFirstDel(row) {
      // 刪除頭
      wmsInboundOrderTbls.del([row.id]).then(() => {
        this.$notify({
          title: "成功",
          message: "刪除成功",
          type: "success",
          duration: 2000,
        });
        const index = this.mainList.indexOf(row);
        this.mainList.splice(index, 1);
      });
    },

    // ------------------------明細列表處理-------------------------------------
    handleSecondPage(e) {
      this.secondQuery = e;
      this.querySecondList(this.radio);
    },
    querySecondList(id) {
      wmsInboundOrderDtbls
        .getList({
          inboundorderid: id,
          page: this.secondQuery.page,
          limit: this.secondQuery.limit,
          key: this.secondQuery.customerKey,
        })
        .then((res) => {
          res.columnHeaders.forEach((item) => {
            // 首字母小寫
            item.key =
              item.key.substring(0, 1).toLowerCase() + item.key.substring(1);
          });
          this.secondHeaderList = res.columnHeaders.filter((u) => u.browsable);
          this.secondHeaderListC = res.columnHeaders || [];
          this.secondTotal = res.count;
          this.secondList = res.data;
        });
    },
    rowClickSecondTable(row) {
      // 行點擊事件
      this.$refs.multipleTable.clearSelection();
      this.$refs.multipleTable.toggleRowSelection(row);
    },
    handleSecondDel(rows) {
      // 刪除明細時,只刪除前端
      rows.forEach((row) => {
        const index = this.secondList.indexOf(row);
        this.secondList.splice(index, 1);
      });
    },
    selChangeSecondTable(val) {
      // 明細選中事件
      this.multipleSelection = val;
    },
    handleAddOrderDetail() {
      // 添加明細
      const obj = {};
      this.secondHeaderListC.forEach((item) => {
        obj[item.key] = "";
      });
      obj.orderId = this.firstTemp.id;

      this.secondList.push(Object.assign({}, obj));
    },
  },
};
</script>
<style lang="scss">
.nomal-form label {
  font-weight: 500 !important;
}
.detail-card {
  .el-table__body-wrapper {
    height: calc(100% - 32px) !important;
  }
}

.demo-card .el-card__header {
  padding: 10px !important;
  line-height: 1;
  position: relative;
}

.el-card__body {
  padding: 10px 10px 0 10px !important;
  height: 100%;
}
.form-card .el-card__body {
  padding-right: 0 !important;
}
.form-card .el-form {
  padding-right: 5px;
}

.dialog-small .el-dialog__header {
  padding: 10px;
  border-bottom: 1px solid #efefef;
}

.dialog-small .el-dialog__headerbtn {
  top: 15px;
}

.dialog-small .el-dialog__body {
  padding: 10px;
}

.el-form-item__error {
  padding-top: 0;
}
</style>

<style scoped>
.el-form-item {
  margin-bottom: 15px !important;
}

.m-t-lg {
  margin-top: 20px;
}

.pagination-container {
  border: 0;
  padding-left: 0 !important;
}

.times .el-date-editor.el-input,
.times .el-date-editor.el-input__inner {
  width: 120px;
}

.times .el-select {
  width: 120px;
}

.box-flex .label {
  width: 50px;
}

.m-b-sm {
  margin-bottom: 5px;
}

.p-l-m {
  padding-left: 10px;
}

.p-r-m {
  padding-right: 10px;
}
.edit-button {
  position: absolute !important;
  top: 2px;
  right: 5px;
}
.delete-button {
  right: 90px;
}
.show-title-button {
  cursor: pointer;
  padding: 0 10px 0 0;
}
</style>
