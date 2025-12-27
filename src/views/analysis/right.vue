<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { useWebSocket } from '@/utils/useWebSocket2.ts'
import dayjs from "dayjs";
import * as echarts from "echarts";
import VChart from "vue-echarts";
import {selectSensor} from "@/api";
// 组件状态
const props = defineProps({
  ws: {},
  searchTime: {
    type: Object,
    default: () => {}
  },
  sensorCodes: {
    type: Array as () => string[],
    default: () => [],
  },
  deviceId: {
    type: String,
    default: "",
  },
  selectedTime: {
    type: Array as () => [number, number],
    default: () => [],
  },
  chartGroup: {
    type: String,
    default: "",
  },
  messageId: {
    type: String,
    default: "",
  },
  pushIndex: {
    type: Number,
    default: 0,
  },
  index: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
  },
  searchLoading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['isZooming', 'updatePushIndex']);

// 默认打开接收
const showWebsocketNewData = ref(true)
// 纵轴的值
const storeMap = ref({})
// 横轴的值
const xStore = ref([])

const pointList = ref(new Array(60).fill(0).map((_) => ''))
const series = ref({})

const setShowWebsocketNewData = (value: boolean) => {
  showWebsocketNewData.value = value
  nextTick(() => {
    emit('isZooming', value)
  })
  if (!value) {
    storeMap.value = {}
    xStore.value = []
  } else if (value) {
    // 处理点
    Object.keys(series.value).forEach((key) => {
      series.value[key].list.push(...storeMap.value[key])
    })
    // 处理横轴
    pointList.value.splice(props.pushIndex, 0, ...xStore.value)
  }
}
// 在组件响应式变量定义部分添加
const lastTimestampAdded = ref<number>(0); // 记录最后添加时间戳的时间
const ONE_SECOND = 1000; // 1秒 = 1000毫秒

// 使用 Set 提高查找效率并确保唯一性
const timestampSet = new Set<string>();
const handleMessage = (message: any) => {
  if (props.searchTime.startTime || props.searchTime.endTime) {
    return
  }

  console.log('进入步骤，可以实时显示数据了')

  const gotData = message ? JSON.parse(message.data) :[];


// 修改为 - 根据实际数据结构处理传感器数据
  if (gotData.device_data) {
    // 处理 device_data 数组
    gotData.device_data.forEach((deviceItem: any) => {
      // 使用 messageTime 作为时间戳
      const timestamp = deviceItem.messageTime;
      if (!timestamp) return;

      // 检查是否已处理该时间戳
      if (timestampSet.has(timestamp)) {
        console.log('时间戳已存在，跳过处理:', timestamp);
        return;
      }

      // 修改后的handleMessage函数中的时间戳处理部分
      // 更新时间戳列表
      if (showWebsocketNewData.value) {
        const currentTime = Date.now();

        if (props.pushIndex <= 60) {
          pointList.value[props.pushIndex] = timestamp;
          timestampSet.add(timestamp);
        } else {
          // 检查距离上次添加时间戳是否超过1秒
          if (currentTime - lastTimestampAdded.value >= ONE_SECOND) {
            console.log('增加一次时间：(timestamp)', timestamp);
            pointList.value.push(timestamp);
            timestampSet.add(timestamp);
            lastTimestampAdded.value = currentTime; // 更新最后添加时间
          } else {
            console.log('时间间隔不足1秒，跳过添加时间戳');
          }
        }
      }

// 处理传感器数据 - 遍历 sensors 数组
      if (deviceItem.sensors && Array.isArray(deviceItem.sensors)) {
        deviceItem.sensors.forEach((sensor: any) => {
          // 使用正确的字段名
          const sensorName = sensor.sensorCode;

          if (sensorName) {
            // 检查传感器是否在需要显示的列表中 - 使用更灵活的匹配方式
            const matchedSensorCode = props.sensorCodes.find(code =>
                code.includes(sensorName) || sensorName.includes(code) || code === sensorName
            );

            if (matchedSensorCode) {
              const code = matchedSensorCode;

              if (!series.value[code]) {
                pointList.value = new Array(Math.max(props.pushIndex, 60)).fill(0).map((_) => '')
                series.value[code] = {
                  list: props.pushIndex > 1 ? new Array(Math.max(Number(props.pushIndex) - 1, 1)).fill(1).map((_, i) => null) : [],
                };
              }

              // 获取传感器值
              const sensorValue = sensor.sensorValue !== undefined ? sensor.sensorValue :
                  sensor.value !== undefined ? sensor.value :
                      sensor.data;

              series.value[code] = {
                name: code,
                ...series.value[code],
                ts: timestamp,
                sensorValue: sensorValue,
                sensorName: sensorName,
                sensorUnit: sensor.sensorUnit || sensor.unit
              }

              if (showWebsocketNewData.value) {
                series.value[code]['list'].push(sensorValue)
              } else {
                if (!storeMap.value[code]) {
                  storeMap.value[code] = []
                }
                storeMap.value[code].push(sensorValue)
              }
            } else {
              // 调试日志：输出传感器信息以帮助调试
              // console.log('传感器未匹配:', sensorName, '期望的传感器:', props.sensorCodes);
            }
          }
        });
      }
    })
  }


    if (!showWebsocketNewData.value) {
      return
    }

    if (props.index === 0) {
      emit('updatePushIndex')
    }

    Object.values(series.value).map((item: any) => {
      // console.log('--------------------------------')
      // console.log('item.name', item.name)
      // console.log('item.ts', item.ts)
      // console.log('item.list', JSON.stringify(item.list))
      // console.log('-----')
      // console.log('pointList', JSON.stringify(pointList.value))
      console.log('pointList--length', pointList.value.length)
      console.log('item.list.length', item.list.length)
      // console.log('-----')
      // console.log('props.pushIndex', props.pushIndex)
    })
    const seriesData = Object.values(series.value)
        .map((item: any) => ({
          name: item.name,
          data: item.list,
          type: "line",
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2 },
          large: true,
          largeThreshold: 900,
          progressive: 200
        }));
    chartData.value.xAxis = pointList.value.map((item: any) => {
      return item ? dayjs(item).format("HH:mm:ss") : ''
    })
    chartData.value.series = seriesData
    updateChart();
  }






watch(() => props.ws, (nv) => {
  nv && props.ws.addEventListener('message', handleMessage)
}, {immediate: true})






// 全局图表组管理
const chartGroups: Record<string, echarts.ECharts[]> = {};





// 响应式数据
const chartInstance = ref<InstanceType<typeof VChart>>();
const chartReady = ref(false);
const option = ref<echarts.EChartsOption>({});
const chartData = ref({
  xAxis: [] as string[],
  series: [] as echarts.SeriesOption[]
});

watch(() => props.sensorCodes.length, (nv,ov = 0) => {
  if (nv > 0) {
    chartReady.value = true
    if (nv === 1) {
      chartData.value = { xAxis: [], series: [] };
    }
    nextTick(() => {
      updateChart();
    })
  }

  if (ov - nv>0) {
    Object.keys(series.value).forEach(key => {
      if (!props.sensorCodes.includes(key)) {
        delete series.value[key];
      }
    })
  }

}, {immediate: true})
watch(
  () => option.value,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      chartReady.value = true;
      nextTick(() => {
        if (chartInstance.value) {
          connectCharts();
        }
      });
    }
  },
  { deep: true, immediate: true }
);

watch(() => props.height, (nv, ov) => {
  nextTick(() => {
    chartInstance.value.chart.resize()
  })
})


// 自动滚动控制
const displayCount = 60;
const scrollStep = 1;
const currentDisplayStart = ref(0);
let pollTimer: number | null = null;
let scrollTimer: number | null = null;

// 缩放状态管理
const isZooming = ref(false);
const currentZoomState = ref({
  start: 0,
  end: 100,
  startValue: '',
  endValue: ''
});

// 计算属性
const hasSelectedTime = computed(() => {
  return props.selectedTime.length === 2 &&
         props.selectedTime.every(t => t !== null && t !== undefined);
});

// 数据处理方法
const groupValuesByKey = (data: any[]) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { keys: [], groupedValues: {} };
  }

  return data.reduce((acc, obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (!acc.groupedValues[key]) {
        acc.groupedValues[key] = [];
      }
      if (value !== undefined) {
        acc.groupedValues[key].push(value);
      }
    });
    return acc;
  }, { keys: [] as string[], groupedValues: {} as Record<string, any[]> });
};

const formatTimestamp = (timestamp: number) => {
  return dayjs(timestamp).format("HH:mm:ss");
};

// 图表配置
const setChartOption = (xAxisData: string[], seriesData: echarts.SeriesOption[]) => {
  option.value = {
    group: props.chartGroup,
    animation: false,
    xAxis: {
      type: "category",
      data: xAxisData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.3)" } },
      axisTick: { show: false },
      axisLabel: { color: "rgba(255, 255, 255, 0.6)", fontWeight: "500" },
      splitLine: { show: false },
      axisPointer: {
        label: { formatter: (params: any) => params.value }
      }
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.3)" } },
      axisTick: { show: false },
      axisLabel: { color: "rgba(255, 255, 255, 0.6)", fontWeight: "500" },
      splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.1)" } }
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,.6)",
      borderColor: "rgba(147, 235, 248, .8)",
      textStyle: { color: "#FFF" },
      axisPointer: { type: "cross" }
    },
    axisPointer: {
      type: "line",
      link: { xAxisIndex: "all" },
      triggerTooltip: true,
      label: { backgroundColor: "#777" }
    },
    grid: {
      left: "10px",
      right: "20px",
      bottom: "20px",
      top: "40px",
      containLabel: true
    },
    dataZoom: [
      {
        type: "inside",
        realtime: true,
        start: currentZoomState.value.start,
        end: currentZoomState.value.end,
        zoomLock: false,
        filterMode: "weakFilter",
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        throttle: 50
      },
      {
        type: "slider",
        realtime: true,
        start: currentZoomState.value.start,
        end: currentZoomState.value.end,
        bottom: 10,
        height: 12,
        handleSize: "100%",
        textStyle: { color: "rgba(255, 255, 255, 0.6)" },
        borderColor: "rgba(255, 255, 255, 0.3)",
        fillerColor: "rgba(147, 235, 248, 0.2)",
        showDetail: false
      }
    ],
    series: seriesData.map(item => ({
      ...item,
      emphasis: { symbolSize: 8 },
      markPoint: {
        data: [
          {
            name: "最大值",
            type: "max",
            valueDim: "y",
            symbol: "rect",
            symbolSize: [60, 26],
            symbolOffset: [0, -20],
            itemStyle: { color: "rgba(0,0,0,0)" },
            label: {
              color: "#fff",
              padding: [7, 14],
              formatter: `${item.name}：{c}`
            }
          },
          {
            name: "最小值",
            type: "min",
            valueDim: "y",
            symbol: "circle",
            symbolSize: 6,
            itemStyle: {
              color: "rgba(210, 26, 251, 1)",
              shadowColor: "#fff",
              shadowBlur: 8
            },
            label: { formatter: "" }
          }
        ]
      }
    }))
  };
  chartReady.value = true;
};


const updateChart = () => {
  const { xAxis: fullXAxis, series: fullSeries } = chartData.value;
  // 在缩放状态下，保持当前显示的x轴范围
  console.log('isZooming.value------缩放变量', isZooming.value)
  if (isZooming.value && currentZoomState.value.startValue && currentZoomState.value.endValue) {
    const startIndex = fullXAxis.findIndex(x => x === currentZoomState.value.startValue);
    const endIndex = fullXAxis.findIndex(x => x === currentZoomState.value.endValue);

    if (startIndex !== -1 && endIndex !== -1) {
      const displayXAxis = fullXAxis.slice(startIndex, endIndex + 1);
      const displaySeries = fullSeries.map(s => ({
        ...s,
        data: s.data.slice(startIndex, endIndex + 1)
      }));

      setChartOption(displayXAxis, displaySeries);
      return;
    }
  }

  // 非缩放状态下，正常滚动
  const end = Math.min(currentDisplayStart.value + displayCount, fullXAxis.length);
  const displayXAxis = fullXAxis;
  const displaySeries = fullSeries.map(s => ({
    ...s,
    data: s.data
  }));
  setChartOption(displayXAxis, displaySeries);

  // 恢复缩放状态
  nextTick(() => {
    if (chartInstance.value?.chart && currentZoomState.value.startValue && currentZoomState.value.endValue) {
      chartInstance.value.chart.dispatchAction({
        type: 'dataZoom',
        startValue: currentZoomState.value.startValue,
        endValue: currentZoomState.value.endValue
      });
    }
  });
};

// 自动滚动控制
// const scrollLeft = () => {
//   if (hasSelectedTime.value || isZooming.value) return;
//
//   const { xAxis: fullXAxis } = chartData.value;
//   if (fullXAxis.length <= displayCount) return;
//
//   currentDisplayStart.value += 1;
//
//   if (currentDisplayStart.value + displayCount > fullXAxis.length) {
//     currentDisplayStart.value = fullXAxis.length - displayCount;
//   }
//
//   updateChart();
// };

const startPolling = () => {
  stopPolling();

  if (!isZooming.value) {
  }
};

const stopPolling = () => {
  if (pollTimer) clearInterval(pollTimer);
  if (scrollTimer) clearInterval(scrollTimer);
  pollTimer = null;
  scrollTimer = null;
};


const stopScrolling = () => {
  if (scrollTimer) clearInterval(scrollTimer);
  scrollTimer = null;
}

// 图表联动管理
const connectCharts = () => {
  if (!props.chartGroup || !chartInstance.value?.chart) return;

  if (!chartGroups[props.chartGroup]) {
    chartGroups[props.chartGroup] = [];
  }

  if (!chartGroups[props.chartGroup].includes(chartInstance.value.chart)) {
    chartGroups[props.chartGroup].push(chartInstance.value.chart);
  }
  echarts.connect(props.chartGroup);
};

const disconnectCharts = () => {
  if (!props.chartGroup || !chartInstance.value?.chart) return;

  const group = chartGroups[props.chartGroup];
  if (group) {
    const index = group.indexOf(chartInstance.value.chart);
    if (index !== -1) group.splice(index, 1);

    if (group.length > 0) {
      echarts.connect(props.chartGroup);
    } else {
      delete chartGroups[props.chartGroup];
    }
  }
};

// 缩放事件处理
const onDataZoom = (params: any) => {
  // 保存当前缩放状态
  if (params.batch) {
    // 处理批量缩放
    const zoom = params.batch[0];
    currentZoomState.value = {
      start: zoom.start,
      end: zoom.end,
      startValue: zoom.startValue,
      endValue: zoom.endValue
    };
  } else {
    // 处理单个缩放
    currentZoomState.value = {
      start: params.start,
      end: params.end,
      startValue: params.startValue,
      endValue: params.endValue
    };
  }

  // 检测是否用户手动缩放
  const isUserZoom = params.batch ?
    params.batch.some((z: any) => z.from !== 'dataZoom') :
    params.from !== 'dataZoom';

  if (isUserZoom) {
    isZooming.value = true;
    stopPolling();

    emit('isZooming', {
      chartGroup: props.chartGroup,
      isZooming: true
    });
  }
};

// 恢复自动滚动
const onRestore = () => {
  isZooming.value = false;
  startPolling();
  emit('isZooming', {
    chartGroup: props.chartGroup,
    isZooming: false
  });
};

const getData =async (isScrolling = false) => {
  try {
    emit('apiRequestCompleted', true);
    const res = await selectSensor({
      deviceId: props.deviceId,
      sensorCode: props.sensorCodes.join(","),
      startTime: props.selectedTime[0],
      endTime: props.selectedTime[1],
      limit: hasSelectedTime.value ? 9999 : isScrolling ? displayCount + scrollStep : 9999
    });

    if (res.code !== 200) {
      ElMessage.warning(res.msg);
      return;
    }
    const { groupedValues } = groupValuesByKey(res.data.data);
    const xAxisData = groupedValues.ts?.map(formatTimestamp) || [];
    const seriesData = Object.entries(groupedValues)
        .filter(([key]) => key !== "ts")
        .map(([key, values]) => ({
          name: key,
          data: values,
          type: "line",
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2 },
          large: true,
          largeThreshold: 900,
          progressive: 200
        }));
    emit('apiRequestCompleted', false);
    if (isScrolling && chartData.value.xAxis.length > 0) {
      chartData.value = {
        xAxis: [...chartData.value.xAxis, ...xAxisData],
        series: chartData.value.series.map((s, i) => ({
          ...s,
          data: [...s.data, ...seriesData[i].data]
        }))
      };
    } else {
      chartData.value = { xAxis: xAxisData, series: seriesData };
    }
    updateChart();
  } catch (err) {

    ElMessage.error(err instanceof Error ? err.message : String(err));
  }
}

// 生命周期与监听
watch(() => [props.deviceId, props.sensorCodes, props.selectedTime], () => {
  currentDisplayStart.value = 0;

  startPolling();
}, { deep: true });

watch(() => props.chartGroup, (newVal, oldVal) => {
  if (oldVal) disconnectCharts();
  if (newVal) nextTick(connectCharts);
});

onMounted(() => {
  startPolling();
  nextTick(() => {
    connectCharts();
  });
});

onUnmounted(() => {
  stopPolling();
  disconnectCharts();
});

const resetChart = () => {

  // 所有变量恢复初始化
  storeMap.value = {}
  xStore.value = []
  pointList.value = new Array(60).fill(0).map((_) => '')
  series.value = {}

  chartReady.value = false
}

defineExpose({ onRestore, setShowWebsocketNewData, showWebsocketNewData, getData, resetChart });
</script>

<template>
  <v-chart
    ref="chartInstance"
    class="chart"
    :option="option"
    :group="props.chartGroup"
    @dataZoom="onDataZoom"
    v-if="chartReady"
    autoresize
  />
</template>

<style scoped lang="scss">
.chart {
  width: 100%;
  //height: 175px;
}
</style>
