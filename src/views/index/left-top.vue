<script setup lang="ts">
import { reactive, ref ,computed,onMounted,watch} from "vue";
import { getEquipmentDetail } from "@/api";
import CountUp from "@/components/count-up";
import {ElMessage} from "element-plus"

import { useAreaStore } from "@/stores/area";

const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);
const duration = ref(2);
const state = reactive({
  statusStatistics:{}
});


const getData = () => {
  getEquipmentDetail().then((res) => {
    console.log("左上--设备总览",res);
    if (res.code==200) {
      state.statusStatistics=res.data.info.statisticsInfo;
    }else{
      ElMessage.error(res.msg)
    }
  }).catch(err=>{
    ElMessage.error(err)
  });;
};
onMounted(() => {
  getData();
});
watch(selectedCityName, getData);
</script>

<template>
  <ul class="user_Overview flex">
    <li class="user_Overview-item "  >
      <div class="user_Overview_nums allnum">
        <CountUp :endVal="state.statusStatistics.normal" :duration="duration" />
      </div>
      <div  class="text">在线</div>
    </li>
    <li class="user_Overview-item"  >
      <div class="user_Overview_nums online">
        <CountUp :endVal="state.statusStatistics.shutdown" :duration="duration" />
      </div>
      <div  class="text">离线</div>
    </li>
    <li class="user_Overview-item"  >
      <div class="user_Overview_nums offline">
        <CountUp :endVal="state.statusStatistics.warning" :duration="duration" />
      </div>
      <div  class="text">预警</div>

    </li>
    <li class="user_Overview-item"  >
      <div class="user_Overview_nums laramnum">
        <CountUp :endVal="state.statusStatistics.failure" :duration="duration" />
      </div>
      <div class="text">故障</div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.left-top {
  width: 100%;
  height: 100%;
}

.user_Overview {
  overflow: hidden;  
     display: flex;
     flex-wrap: wrap;
     height: 100%;
  li {
    // flex: 1;
     width: 50%;
     height: 50%;
     display: flex;
     flex-wrap: wrap;
     align-content: flex-end;
     justify-content: center;
    .text { 
      font-size: 16px;
      color: #fff;
      padding-left: 20px;
      position: relative;
      line-height: 54px; 
      height: 54px; 
      margin-left: 10px;
      &::before{ 
        content: "";
        width: 12px;
        height: 12px;
        border-radius: 50%;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);

      }
    }
    &:nth-child(1) {
      .text{
        &::before{
          background-color: #29F1FA;
        }
      }
    }
    &:nth-child(2) {
      .text{
        &::before{
          background-color: #9F9F9F;
        }
      }
    }
    &:nth-child(3) {
      .text{
        &::before{
          background-color: #FF5748;
        }
      }
    }
    &:nth-child(4) {    
      .text{
        &::before{
          background-color: #FFAA00;
        }
      }
    }

    .user_Overview_nums {
      width: 120px;
      height: 74px; 
      font-size: 22px; 
      background-size: contain;
      background-repeat: no-repeat;
      text-align: center;
      background-position: center; 
      position: relative;
      font-size: 20px;
      font-weight: 600;
      color: #fff; 
    }

    .allnum {
      background-image: url("@/assets/img/left_top_1.png");
      
    }

    .online {
      background-image: url("@/assets/img/left_top_2.png"); 
       
    }

    .offline {
      background-image: url("@/assets/img/left_top_3.png"); 
       
    }

    .laramnum {
      background-image: url("@/assets/img/left_top_4.png"); 
       

    }
  }
}
</style>
