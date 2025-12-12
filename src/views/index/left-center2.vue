<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { graphic } from "echarts/core";
import { getAnnualStatistics } from "@/api";
import { ElMessage } from "element-plus";
import { useAreaStore } from "@/stores/area";
const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);
console.log(areaStore);
let colors = ["#00FFB6", "#377BFF", "#B923FF", "#FFC01E"];
const option = ref({});
const annualStatistics = ref({});
const echartsGraphic = (colors: string[]) => {
  return new graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: colors[0] },
    { offset: 1, color: colors[1] },
  ]);
};
const getData = () => {
  getAnnualStatistics(
    {province:selectedCityName.value}
  )
    .then((res) => {
      if (res.code == 200) {
        annualStatistics.value = res.data.data.map((v) => {
          return {
            name: v.equipmentType,
            value: v.totalFailure,
          };
        });
        console.log("左中--用户总览", annualStatistics.value);
        setOption(annualStatistics.value);
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch((err) => {
      ElMessage.error(err);
    });
};
getData();
watch(selectedCityName, getData);
const setOption = (data: any) => {
  const totalFailure = data.reduce(
    (sum: number, item: any) => sum + item.value,
    0
  );
  option.value = {
    title: {
      top: "center",
      left: "30%",
      text: ["{value|" + totalFailure + "}", "{name|故障总数}"].join("\n"),

      textAlign: "center",
      textStyle: {
        rich: {
          value: {
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "bold",
            lineHeight: 20,
            padding: [4, 0, 4, 0],
          },
          name: {
            color: "#ffffff",
            lineHeight: 20,
            fontSize: 10,
          },
        },
      },
    },

    legend: {
      right: "20%",
      top: "middle",
      orient: "vertical",
      textStyle: { color: "#fff" },
      itemWidth: 8,
      itemHeight: 8, 
      icon:'circle', 
      formatter: function(name:any) {
        const item = data.find(item => item.name === name);
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) + '%' : '0%';
        return `${name}: ${percent}`;
      }
    },
    series: [
      {
        name: "用户总览",
        type: "pie",
        radius: ["55%", "85%"],
        // avoidLabelOverlap: false,
        itemStyle: {
          borderColor: "rgba(255,255,255,0)",
          borderWidth: 2,
        },
        color: colors,
        label: {
          show: true,
          formatter: "{d}%",
          position: "inside",
        },
        emphasis: {
          label: {
            show: true,
            formatter: "{d}%",
            position: "inside",
          },
        }, 
        tooltip: { show: true },
        data: data,
        labelLine: {
          show: false,
        },
        left: "2%",
        right: "40%", 
      },
    ],
  };
};
</script>

<template>
  <v-chart class="chart" :option="option" />
</template>

<style scoped lang="scss"></style>
