<template>
  <div class="flex-column hospitalRatio">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <!-- 區域選擇 -->
        <el-select size="mini" v-model="value" clearable placeholder="請選擇區域">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

        <!-- 公司選擇 -->
        <el-select size="mini" v-model="value" clearable placeholder="請選擇公司">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

        <!-- 日期選擇 -->
        <el-date-picker
          size="mini"
          v-model="value1"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </div>
    </sticky>

    <div class="app-container flex-item">
      <!-- 醫療院所比率 -->
      <div class="hospitalContainer">
        <Title title="醫療院所比率"></Title>
        <ve-histogram :data="chartData" :settings="chartSettings"></ve-histogram>
      </div>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
export default {
  name: "hospitalRatio",
  components: {
    Sticky,
    Title,
  },
  data() {
    this.chartSettings = {
      metrics: ["金額"],
      dimension: ["車牌"],
      yAxisName: ["單位(%)"],
    };
    return {
      value: "",
      value1: "",
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
      chartData: {
        columns: ["車牌", "金額"],
        rows: [
          { 車牌: "新莊區", 金額: 20 },
          { 車牌: "林口區", 金額: 12 },
          { 車牌: "蘆洲區", 金額: 49 },
          { 車牌: "板橋區", 金額: 49 },
          { 車牌: "中和區", 金額: 49 },
          { 車牌: "土城區", 金額: 49 },
          { 車牌: "八里區", 金額: 49 },
          { 車牌: "永和區", 金額: 49 },
        ],
      },
    };
  },
};
</script>

<style lang="scss"></style>
