<template>
  <el-container style="border: 1px solid #eee">
    <el-main>
      <el-form label-width="80px">
        <el-form-item label>
          <el-tag>這是一個表單詳情展示樣例，你可以完全根據客戶的需求進行排版</el-tag>
        </el-form-item>
        <el-form-item label="請假類型">
          <el-radio-group v-model="temp.requestType">
            <el-radio label="病假"></el-radio>
            <el-radio label="事假"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="'請假人'" prop="userName">
          <el-input name="name" :disabled="true" v-model="temp.userName"></el-input>
        </el-form-item>

        <el-form-item label="開始時間">
          <el-col :span="11">
            <el-date-picker
              :disabled="true"
              type="date"
              placeholder="選擇日期"
              v-model="temp.startDate"
              style="width: 100%;"
            ></el-date-picker>
          </el-col>
          <el-col class="line" :span="2" style="text-align: center;">-</el-col>
          <el-col :span="11">
            <el-time-picker
              :disabled="true"
              type="fixed-time"
              placeholder="選擇時間"
              v-model="temp.startTime"
              style="width: 100%;"
            ></el-time-picker>
          </el-col>
        </el-form-item>

        <el-form-item label="結束時間">
          <el-col :span="11">
            <el-date-picker
              :disabled="true"
              type="date"
              placeholder="選擇日期"
              v-model="temp.endDate"
              style="width: 100%;"
            ></el-date-picker>
          </el-col>
          <el-col class="line" :span="2" style="text-align: center;">-</el-col>
          <el-col :span="11">
            <el-time-picker
              :disabled="true"
              type="fixed-time"
              placeholder="選擇時間"
              v-model="temp.endTime"
              style="width: 100%;"
            ></el-time-picker>
          </el-col>
        </el-form-item>

        <el-form-item size="small" :label="'請假說明'" prop="requestComment">
          <el-input type="textarea" :disabled="true" :rows="3" v-model="temp.requestComment"></el-input>
        </el-form-item>

        <el-carousel :interval="4000" type="card" height="150px">
          <el-carousel-item v-for="file in temp.files" :key="file.filePath">
            <a :href="baseURL +'/' + file.filePath" target="_blank">
              <img height="150" :src="baseURL +'/' + file.filePath" :title="file.fileName" />
            </a>
          </el-carousel-item>
        </el-carousel>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "frm-leave-req-detail",
  props: ["frmData"],
  data() {
    return {
      baseURL: process.env.BASE_IMG_URL, // 附件的根目錄
    };
  },
  computed: {
    temp: function () {
      return JSON.parse(this.frmData);
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
</style>
