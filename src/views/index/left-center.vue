<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { equipmentTrend } from "@/api";
import { graphic } from "echarts/core";
import { ElMessage } from "element-plus";
import { useAreaStore } from "@/stores/area";
const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);
import dayjs from "dayjs";
const option = ref({});
const getData = () => {
  equipmentTrend({
    province: selectedCityName.value
  })
    .then((res) => {
      console.log("右上--报警次数 ", res);
      if (res.code==200) {
        let data=res.data.data
        console.log(data, "data 左er");
        const xData=data.map((item:any)=>dayjs(item.date).format("MM-DD"))
        const onlineNum=data.map((item:any)=>item.onlineNum)
        setOption(xData, onlineNum);
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
const setOption = async (xData: any[], onlineNum: any[]) => {
  option.value = {
    xAxis: {
      boundaryGap: ['2%', '2%'],  // 两端各留10%的空白
      type: "category",
      data: xData, 
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(31,99,163,.2)",
        },
      },
      axisLine: {
        // show:false,
        lineStyle: {
          color: "rgba(31,99,163,.1)",
        },
      },
      axisLabel: {
        color: "#7EB7FD",
        fontWeight: "500",
      },
    },
    yAxis: {
      type: "value",
      splitLine: { 
        lineStyle: {
          color: "rgba(31,99,163,.2)",
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(31,99,163,.1)",
        },
      },
      axisLabel: {
        color: "#7EB7FD",
        fontWeight: "500",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,.6)",
      borderColor: "rgba(147, 235, 248, .8)",
      textStyle: {
        color: "#FFF",
      },
    },
    grid: {
      //布局
      show: true,
      left: "10px",
      right: "20px",
      bottom: "10px",
      top: "32px",
      containLabel: true,
      borderColor: "#1F63A3",
    },
    series: [ 
      {
        data: onlineNum,
        type: "line", 
        symbol: "none", //去除点
        name: "在线量",
        color: "rgba(27, 126, 242, 1)",
        areaStyle: {
          //右，下，左，上
          color: new graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(27, 126, 242, .6)",
              },
              {
                offset: 1,
                color: "rgba(27, 126, 242, 0.2)",
              },
            ],
            false
          ),
        },
        markPoint: {
          data: [
            {
              name: "最大值",
              type: "min",
              valueDim: "y",
              symbol: "rect",
              symbolSize: [60, 26],
              symbolOffset: [0, -20],
              itemStyle: {
                color: "rgba(0,0,0,0)",
              },
              label: {
                color: "#fff", 
                padding: [7, 14],
                formatter: "在线量：{c}",
                borderWidth: 0.5,
              },
            }, 
            {
              name: "最大值",
              type: "min",
              valueDim: "y",
              symbol: "circle",
              symbolSize: 6,
              itemStyle: {
                color: "rgba(27, 126, 242, 1)",
                shadowColor: "#fff",
                shadowBlur: 8,
              },
              label: {
                formatter: "",
              },
            },
          ],
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
  <v-chart class="chart" :option="option" v-if="JSON.stringify(option) != '{}'" />
</template>

<style scoped lang="scss"></style>
