<script setup lang="ts">
import { reactive, ref } from "vue";
import dayjs from 'dayjs';
import type {DateDataType} from "./index.d"
import {useSettingStore} from "@/stores/index"
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const dateData = reactive<DateDataType>({
  dateDay: "",
  dateYear: "",
  dateWeek: "",
  timing:null
});
const isFullScreen = ref(false);

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement;
};

document.addEventListener('fullscreenchange', handleFullscreenChange);
window.addEventListener('load', handleFullscreenChange);

const { setSettingShow} =useSettingStore()
const weekday= ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
const timeFn = () => {
  dateData.timing = setInterval(() => {
    dateData.dateYear = dayjs().format("YYYY-MM-DD");
    dateData.dateDay = dayjs().format("HH : mm : ss");
    dateData.dateWeek = weekday[dayjs().day()];
  }, 1000);
};
timeFn()

const goHome = () => {
  router.push('/');
};

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
};
</script>

<template>
  <div class="d-flex jc-center title_wrap">  
    <div class="d-flex jc-center">
      <div class="title">
        <span class="title-text">远能大数据运维服务系统</span>
      </div>
    </div>
    <div class="timers">
      <img src="@/assets/img/rili_icon.png" alt="日期" class="rili_icon">
      <span>{{ dateData.dateYear }}</span> 
      <span>{{ dateData.dateWeek }} </span>
      <span>{{ dateData.dateDay }}</span> 
    </div>
    <div class="HeaderRight"> 
        <img @click="toggleFullScreen" src="@/assets/img/bigScreen_icon.png" :alt="isFullScreen ? '退出全屏' : '点击全屏预览'" class="icon"><span @click="toggleFullScreen">{{ isFullScreen ? '退出全屏' : '点击全屏预览' }}</span>
        <template v-if="route.name !== 'index'">
          <img @click="goHome" src="@/assets/img/logou_icon.png" alt="退出" class="icon"><span @click="goHome">退出</span>
        </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.title_wrap {
  height: 76px;
  background-image: url("../assets/img/top.png");
  background-size: cover;
  background-position: center center;
  position: relative;
  margin-bottom: 4px;

  .guang {
    position: absolute;
    bottom: -26px;
    background-image: url("../assets/img/guang.png");
    background-position: 80px center;
    width: 100%;
    height: 56px;
  }

  .zuojuxing,
  .youjuxing {
    position: absolute;
    top: -2px;
    width: 140px;
    height: 6px;
    background-image: url("../assets/img/headers/juxing1.png");
  }

  .zuojuxing {
    left: 11%;
  }

  .youjuxing {
    right: 11%;
    transform: rotate(180deg);
  }

  .timers {
    position: absolute;
    left: 0%;
    top: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    padding-left: 20px;
    font-family: Alibaba PuHuiTi 3.0;
    span{
      margin-right: 20px;
      color: #fff;
    }
    .rili_icon{
      width: 16rpx;
      height: 16rpx;
      display: block;
      margin-right: 12px;
    }
   
  }
}
 .HeaderRight{
      position: absolute;
      right: 0;
      top: 20px;
    font-size: 14px;
      display: flex;
      align-items: center;
      padding-right: 20px;
      font-family: Alibaba PuHuiTi 3.0;
      span{
        color: #fff;
        margin-left: 12px;
        cursor: pointer;
      }
      .icon{
         width: 16px;
         height: 16px;
        display: block;
        margin-left: 20px;
        
          cursor: pointer;
      }
    }
.title {
  position: relative;
  // width: 500px;
  text-align: center;
  background-size: cover;
  color: transparent;
  height: 60px;
  line-height: 76px;

  .title-text {
    font-size: 40px;
    font-weight: 900;
    letter-spacing: 6px;
    width: 100%;
    color: #fff;
  }
}
</style>
