<template>
  <div class="flex-column allOrder">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 車行選擇 -->
        <el-input
          style="width: 200px; margin-right: 0.5rem"
          size="mini"
          v-model="value"
          clearable
          placeholder="請輸入關鍵字"
        ></el-input>

        <!-- 日期選擇 -->
        <el-date-picker
          size="mini"
          v-model="value1"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="结束日期"
        ></el-date-picker>

        <!-- 權限按鈕 -->
        <permission-btn
          moduleName="builderTables"
          size="mini"
          v-on:btn-event="onBtnClicked"
        ></permission-btn>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 全部訂單 -->
      <Title title="全部訂單"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <div class="orderTableContainer">
          <div v-for="item in 9" :key="item" class="orderContainer">
            <div class="orderLeft">
              <div class="orderLeftTitle">訂單編號 TS1599449730870</div>
              <div class="orderLeftDetail">
                <p>單位：社團法人臺灣計程車學院協會</p>
                <p>預約時間：2020-09-08 11:30</p>
                <p>狀態：新訂單</p>
                <p>行程：回程</p>
                <p>建立時間：2020-09-07 11:35</p>
                <p>訂車人身分：B單位</p>
              </div>
            </div>
            <div class="orderCenter">
              <div class="orderCenterTitle">
                <p class="isCarpool">可共乘</p>
                <p class="wheelchairType">輪椅類型：普通輪椅</p>
                <p>陪同人員：1人</p>
              </div>
              <div class="orderCenterDetail">
                <div class="driverInfo">
                  <div class="driverName">林茂隆</div>
                  <div class="userId">個案編號：108X25316</div>
                  <div class="Uid">身分證字號：L100131797</div>
                </div>
                <div class="addressInfo">
                  <p class="startAdd">100台灣台北市中正區常德街1號(醫院診所)</p>
                  <p>to</p>
                  <p class="endAdd">235台灣新北市中和區民德路58號(通訊地址)</p>
                </div>
              </div>
            </div>
            <div class="orderRight">
              <div class="orderRightTitle">
                <p class="orderStatus">新訂單</p>
                <button class="changeOrder">轉單</button>
              </div>
              <div class="orderRightDetail">
                <p>個案負擔 $0</p>
                <p>(車資 + 陪同金額)</p>
                <div class="rightBtnBox">
                  <button class="orderDetail">查看訂單</button>
                  <button class="orderFlow">訂單歷程</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
        />
      </div>
    </div>

    <!-- violation dialog -->
    <el-dialog
      v-el-drag-dialog
      title="各車行違規點數"
      :visible.sync="violationDialog"
    >
      <el-table :data="gridData">
        <el-table-column
          property="date"
          label="日期"
          width="150"
        ></el-table-column>
        <el-table-column
          property="name"
          label="姓名"
          width="200"
        ></el-table-column>
        <el-table-column property="address" label="地址"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import elDragDialog from "@/directive/el-dragDialog";
import Pagination from "@/components/Pagination";
export default {
  name: "allOrder",
  components: {
    Sticky,
    Title,
    permissionBtn,
    Pagination,
  },
  directives: {
    elDragDialog,
  },
  data() {
    return {
      total: 200,
      listQuery: {
        page: 20,
        limit: 20,
      },
      value: "",
      value1: "",
      gridData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
      ],
      options: [
        {
          value: "选项1",
          label: "黄金糕",
        },
        {
          value: "选项2",
          label: "双皮奶",
        },
        {
          value: "选项3",
          label: "蚵仔煎",
        },
        {
          value: "选项4",
          label: "龙须面",
        },
        {
          value: "选项5",
          label: "北京烤鸭",
        },
      ],
      violationDialog: false,
    };
  },
  methods: {
    onBtnClicked(domId) {
      //   console.log(domId);
      switch (domId) {
        case "violationBtn":
          this.violationDialog = true;
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang='scss'>
</style>