<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, watch } from "vue";
import { summaryStatistics } from "@/api";
import { color, graphic } from "echarts/core";
import { ElMessage } from "element-plus";
import { useAreaStore } from "@/stores/area";
const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);
import dayjs from "dayjs";
const option = ref({});
const getData = () => {
  summaryStatistics({
    province: selectedCityName.value
  })
    .then((res) => {
      console.log("中下--安装计划", res);
      if (res.code==200) {
        let data = res.data.data
        
        const date: string[] = data.map(item => dayjs(item.date).format("MM-DD"));
        const failureNum: string[] = data.map(item => item.failureNum);
        const countNum: string[] = data.map(item => item.countNum);
        const onlineNum: string[] = data.map(item => item.onlineNum);
        setOption(date, failureNum, countNum, onlineNum);
      } else {
        ElMessage({
          message: res.msg,
          type: "warning",
        });
      }
    })
    .catch((err) => {
      ElMessage.error(err);
    });
};
const setOption = async (date: any, failureNum: any, countNum: any, onlineNum: any) => {
  option.value = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,.6)",
      borderColor: "rgba(147, 235, 248, .8)",
      textStyle: {
        color: "#FFF",
      },
      formatter: function (params: any) {
        // 添加单位
        var result = params[0].name + "<br>";
        params.forEach(function (item: any) {
          if (item.value) {
            if (item.seriesName == "安装率") {
              result += item.marker + " " + item.seriesName + " : " + item.value + "%</br>";
            } else {
              result += item.marker + " " + item.seriesName + " : " + item.value + "个</br>";
            }
          } else {
            result += item.marker + " " + item.seriesName + " :  - </br>";
          }
        });
        return result;
      },
    },
    
    grid: {
      left: "50px",
      right: "40px",
      bottom: "30px",
      top: "20px",
    },
    xAxis: {
      data: date,
      axisLine: {
        lineStyle: {
          color: "#B4B4B4",
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        splitLine: { 
            lineStyle: {
             color: 'rgba(255, 255, 255, 0.2)',
            type:'dashed'
          },
         },
        axisLine: {
          lineStyle: {
            color: "#B4B4B4",
          },
        },

        axisLabel: {
          formatter: "{value}",
        },
      },
      {
        splitLine: { show: false },
        axisLine: {
          lineStyle: {
            color: "#B4B4B4",
          },
        },
        axisLabel: {
          formatter: "{value}% ",
        },
      },
    ],
    series: [
      {
        name: "设备总数",
        type: "bar",
        barWidth: 10,
        itemStyle: { 
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#4DA6F9" },
            { offset: 1, color: "#174776" },
          ]),
        },
        data: countNum,
        label: {
          show: true,
          position: 'top',
          color: '#fff'
        },
      },
      {
        name: "在线总数",
        type: "bar", 
        barWidth: 10,
        itemStyle: { 
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#56FDFD" }, 
            { offset: 1, color: "#267A7B" },
          ]),
        }, 
        data: onlineNum,
        label: {
          show: true,
          position: 'top',
          color: '#fff'
        },
      },
      {
         name: "故障总数",
        type: "bar", 
        barWidth: 10,
        itemStyle: { 
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#FFAA00" }, 
            { offset: 1, color: "#C7540E" },
          ]),
        }, 
        data: failureNum,
        label: {
          show: true,
          position: 'top',
          color: '#fff'
        },
      },
    ],
  };
};
onMounted(() => {
  getData();
});
watch(selectedCityName, getData);
</script>

<template>
  <div class="center-bottom">
     <div class="item_title">
      <div class="zuo"></div>
      
      <div class="title-inner"><span  >设备汇总（近七天）</span> </div>
      <div class="flex">
         <div class="sb">设备总数</div>
         <div class="onLine">在线总数</div>
         <div class="gz">故障总数</div>
      </div>
    </div>
     <div class="item_title_content">
       <v-chart class="chart" :option="option" v-if="JSON.stringify(option) != '{}'" />
     </div>
  </div>
</template>

<style scoped lang="scss">
$item-title-height: 34px;
$item_title_content-height: calc(100% - 34px);
.center-bottom{
  width: 100%;
  height: 100%;
}
.item_title {
  height: $item-title-height;
  line-height: $item-title-height;
  width: 100%; 
  // text-align: center;
  // background: linear-gradient(to right, transparent, #0f0756, transparent);
  position: relative;
  display: flex;
  align-items: center;
  // justify-content: center;
  
  /* 纯白 */
  color: #FFFFFF;
 background-image: url('@/assets/img/DTitle.png');
 background-size: cover;
 padding-left: 40px;
 box-sizing: border-box;
 height: 34px;
 font-size: 18px;
 padding-top: 10px;
  .zuo{
    background: #24BAFF;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 10px;
  }

 
  .title-inner {
    font-weight: 900;
    letter-spacing: 2px; 
    flex: 1;
  }
}

:deep(.dv-border-box-content)  {
    box-sizing: border-box;
    padding: 6px 16px 0px;
  }

.item_title_content {
  height: $item_title_content-height;
  width: 100%; 
  background: linear-gradient(180deg, rgba(0, 140, 255, 0.2) 0%, rgba(36, 186, 255, 0) 80%);
  backdrop-filter: blur(16px);
  margin-top: 10px;
}

.item_title_content_def {
  width: 100%;
  height: 100%;
}
.sb{
  font-size: 14px;
  color: #4DA6F9;
  padding-left: 16px;
  position: relative; 
  &::before{
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    position: absolute;
    background: #4DA6F9;
  }

}
.onLine{
  font-size: 14px;
  color: #56FDFD;
  padding-left: 16px;
  position: relative;
  margin-left: 20px;
  &::before{
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    position: absolute;
    background: #56FDFD;
  }


}
.gz{
  font-size: 14px;
  color: #FFAA00;
  padding-left: 16px;
  position: relative;
  margin-left: 20px;
  &::before{
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    position: absolute;
    background: #FFAA00;
  }
}
</style>
