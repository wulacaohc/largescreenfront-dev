<script setup lang="ts">
import { ref, reactive, nextTick,onMounted ,computed,watch} from "vue";
import { getStatisticsTop } from "@/api";
import { registerMap, getMap } from "echarts/core";
import { optionHandle, regionCodes } from "./center.map";
import BorderBox13 from "@/components/datav/border-box-13";
import { ElMessage } from "element-plus";
const duration = ref(2);
import { useAreaStore } from "@/stores/area";

const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);
onMounted(() => {
    getData()
})
const tapData=ref()
const getData = () => {
    console.log('qwqwqw')
    getStatisticsTop({province: selectedCityName.value}).then(res=>{
        console.log(res,112)
        tapData.value=res.data.info[0]
    })
}

watch(selectedCityName, getData);
</script>
<template>
  
  <div class="centertop">
     <div class="centertopItem" >
         <div class="thumb">
           <img src="@/assets/img/center_top_1.png" alt="">
         </div>
         <div class="captions">
            <div class="text">报警次数</div>
            <div class="num"><CountUp :endVal="tapData?.report_emergency" :duration="duration" /></div>
         </div>
     </div>
     <div class="centertopItem" >
         <div class="thumb">
           <img src="@/assets/img/center_top_2.png" alt="">
         </div>
         <div class="captions">
            <div class="text">报警处理</div>
            <div class="num"><CountUp :endVal="tapData?.report_emergency_processing" :duration="duration" /></div>
         </div>
     </div>
     <div class="centertopItem" >
         <div class="thumb">
           <img src="@/assets/img/center_top_3.png" alt="">
         </div>
         <div class="captions">
            <div class="text">平均处理时间</div>
            <div class="num"> {{ tapData?.processing_time?tapData.processing_time:0 }}</div>
         </div>
     </div>
  </div>
</template>
<style lang="scss" scoped>
.centertop{
    display: flex;
    justify-content: space-between;
}
.centertopItem{ 
    display: flex; 
    align-items: center;
    color: #fff;
    .thumb{
        width: 72px;
        height: 72px;
        margin-right: 12px;
        img{
            width: 100%;
            height: 100%;
            display: block;
        }
    } 
    .captions{
        margin-top: 10px;
    }
    .text{
        font-size: 16px;
    }
    .num{
        font-size: 24px;
        font-weight: bold;
    }
}
</style>