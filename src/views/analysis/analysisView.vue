<script lang="ts" setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { download } from "@/utils/request";
import dayjs from "dayjs";
import Left from "./left.vue";
import Right from "./right.vue";
import CustomDateTimePicker from "./halfHourRangePicker.vue";
import {useWebSocket} from "@/utils/useWebsocket2";
import {ElMessage} from "element-plus";

const keyword = ref("");
const searchLoading = ref(false);
const router = useRouter();
const route = useRoute();
const time = ref("");
const sensorCodes = ref([]);
const deviceId = ref("");
let interval = null;
const startTime =ref();
const now = ref();
const searchNow = ref()
const minTime = ref(new Date(dayjs().valueOf() - 90 * 60000));
const selectedTime = ref([]);
const newTwoDimArray = ref([]);
const rightRefs = ref({});
const chartInstances = ref<Record<string, any>>({});
const leftRef = ref<Record<string, any>>({});

const {ws} = useWebSocket(() => {})
onMounted(() => {

  let query = route.query.id;
  keyword.value = query;
  deviceId.value = query;
  interval = setInterval(() => {
    searchNow.value = new Date();
    minTime.value = new Date(searchNow.value.getTime() - 90 * 60000);
  }, 60000);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});

const pushIndex = ref(0)
const handlesendSelectedData = (search, data) => {
  newTwoDimArray.value = data.map((target) => {
    console.log(target,'target')
       let obj ={
        targetId: target.targetId,
        sensorCodes: target.items.map((item) =>{
          return `${item.sensorCode}_${item.messageId.toUpperCase()}`;
        }),
       }
       if(target.items.length>0){
        // obj.messageId=target.items[0].messageId
       }
       console.log(obj)
       return obj;

  });
  deviceId.value = search;
};

const setChildRef = (id, el) => {
  if (el) {
    rightRefs.value[id] = el;
    chartInstances.value[id] = el.chartInstance;
  }
};

const syncHover = (targetId, params) => {
  if (!params || params.length === 0) return;

  const hoverTime = params[0].axisValue;

  Object.keys(chartInstances.value).forEach(id => {
    if (id !== targetId && chartInstances.value[id]) {
      const chart = chartInstances.value[id];
      const seriesCount = chart.getOption().series.length;

      chart.dispatchAction({
        type: 'showTip',
        seriesIndex: seriesCount > 0 ? 0 : 0,
        dataIndex: findDataIndex(chart, hoverTime)
      });
    }
  });
};

const findDataIndex = (chart, time) => {
  const option = chart.getOption();
  const xAxisData = option.xAxis[0].data;
  return xAxisData.findIndex(item => item === time);
};

const handleReset = () => {
  selectedTime.value = [];
  startTime.value = ''
  now.value = ''
  pushIndex.value = 0
  Object.values(rightRefs.value).forEach((child) => {
    child.resetChart();
  });
  leftRef.value?.resetTarget();

  searchTime.value = {
    startTime: '',
    now: ''
  }

  // 重置后重新获取实时数据
  nextTick(() => {
    leftRef.value?.getDetail();
  });

};

const handleApiRequestCompleted = (loading) => {
  searchLoading.value = loading;
};

const handleSearch = () => {
  console.log(now.value , startTime.value,'now.value && startTime.value');

   if(!now.value || !startTime.value) {
     return ElMessage.warning('请输入时间范围')
   }

  if (now.value.length != 0 || startTime.value.length !=0) {
    selectedTime.value = [dayjs(startTime.value).valueOf(), dayjs(now.value).valueOf()];
  }

  console.log('rightRefs.value', rightRefs.value)

  searchTime.value.startTime = dayjs(startTime.value).format("YYYY-MM-DD HH:mm:ss");
  searchTime.value.now = dayjs(now.value).format("YYYY-MM-DD HH:mm:ss");

  console.log('searchTime.value.startTime', searchTime.value.startTime)
  console.log('searchTime.value.now', searchTime.value.now)
  if (rightRefs.value) {
    callAllChildren();
  }
  leftRef.value?.getDetail();
  // searchLoading.value = true
};

const callAllChildren = () => {
  Object.values(rightRefs.value).forEach((child) => {
    child.getData();
  });
};

const handleSTimeChange = (e) => {
  //if(e){
    //selectedTime.value = [dayjs(e).valueOf(), dayjs(now.value).valueOf()];
  //}
  //console.log(selectedTime.value);
};
const handleETimeChange = (e) => {
  //if(e){
    //selectedTime.value = [dayjs(startTime.value).valueOf(), dayjs(e).valueOf()];
 // }
};

const exportLoading = ref(false)
const handleExport = async () => {
  console.log('startTime.value', startTime.value)
  if (!now.value || !startTime.value) {
    ElMessage({ message: '请选择有效的时间范围', type: 'warning' });
    return;
  }

  if (now.value.length != 0 || startTime.value.length !=0) {
    selectedTime.value = [dayjs(startTime.value).valueOf(), dayjs(now.value || searchNow.value).valueOf()];
  }

  console.log('----开始导出了')
  if (exportLoading.value) return
  exportLoading.value = true;
  await download("/equipment/selectSensor", {
    deviceId: keyword.value,
    startTime: selectedTime.value[0],
    endTime: selectedTime.value[1],
    is_export: 1,
  }, `${keyword.value}-${startTime.value}-${now.value}`, () => {
    console.log('----是不是出文件了')
    exportLoading.value = false;
  });
};

const disabledHours = () => {
  const currentHour = now.value.getHours();
  const minHour = minTime.value.getHours();

  if (now.value.getDate() === minTime.value.getDate()) {
    return Array.from({ length: 24 }, (_, i) => i).filter(
      (hour) => hour > currentHour || hour < minHour
    );
  } else {
    return Array.from({ length: 24 }, (_, i) => i).filter(
      (hour) => hour > currentHour && hour < minHour
    );
  }
};

const disabledMinutes = (selectedHour) => {
  const currentHour = now.value.getHours();
  const currentMinute = now.value.getMinutes();
  const minHour = minTime.value.getHours();
  const minMinute = minTime.value.getMinutes();

  if (selectedHour === currentHour) {
    return Array.from({ length: 60 }, (_, i) => i).filter(
      (minute) => minute > currentMinute
    );
  } else if (selectedHour === minHour) {
    return Array.from({ length: 60 }, (_, i) => i).filter(
      (minute) => minute < minMinute
    );
  }
  return [];
};

const disabledSeconds = () => {
  return [];
};


const isZooming = ref(false);
const playStatus = ref(false);
const handleIsZooming = ({chartGroup, isZoomingStatus}: {chartGroup: string, isZoomingStatus: boolean}) => {

  // if (chartGroup !== 'syncGroup-' + deviceId.value) {
  console.log('handleRestore', chartGroup, isZoomingStatus);
  isZooming.value = true;
}

// 恢复所有子组件的自动滚动
const handleRestore = () => {
  isZooming.value = false;
  // 可选：强制刷新数据
  nextTick(() => {
    playStatus.value = Object.values(rightRefs.value)[0].showWebsocketNewData
    Object.values(rightRefs.value).forEach((child) => {
      child.onRestore();
      child.setShowWebsocketNewData(!child!.showWebsocketNewData)
    });
  });


};

const updatePushIndex = () => {
  pushIndex.value++
}

const searchTime = ref({
  startTime: '',
  now: ''
})
</script>

<template>
  <div class="analysis-box">
    <div class="analysis-left">
      <div class="relatvie-title">{{route.query.name}}</div>
      <Left
        ref="leftRef"
        :keyword="keyword"
        :deviceId="deviceId"
        :searchTime="searchTime"
        :start-time="searchTime.startTime"
        :end-time="searchTime.now"
        :searchLoading="searchLoading"
        @apiRequestCompleted="handleApiRequestCompleted"
        @sendSelectedData="handlesendSelectedData"
      />
    </div>
    <div class="analysis-right">
      <div class="flex">
        <div class="right-search">
          <div class="flex items-center">
            <span>开始时间：</span><CustomDateTimePicker v-model="startTime" @change="handleSTimeChange"/>
            <span>结束时间：</span><CustomDateTimePicker v-model="now"  @change="handleETimeChange"/>
          </div>
        </div>
        <div class="flex">
          <div class="btn" v-loading="searchLoading" @click="handleSearch">搜索</div>
          <div class="btn" @click="handleReset">重置</div>
          <div class="btn" @click="handleExport" v-loading="exportLoading"> 全部导出</div>
          <div class="btn flex justify-center items-center" @click="handleRestore">
            <img v-if="playStatus" src="@/assets/img/play.png" alt="" style="width: 20px;height: 20px">
            <img v-else src="@/assets/img/stop.png" alt="" style="width: 20px;height: 20px">
            {{playStatus ? '播放' : '暂停'}}</div>
        </div>
      </div>
      <div class="right-content">
        <div class="right">
          <div v-if="newTwoDimArray.length > 0" class="h-full ">
            <div v-for="(item, index) in newTwoDimArray" :style="{height: Math.floor(870/newTwoDimArray.length) + 'px'}"
           :key="`right-${index}-${item.targetId}`">
              <div v-if="item.sensorCodes.length > 0" class="h-full" style="padding:6px 0">
                <Right
                    :searchTime="searchTime"
                    :ws="ws"
                    :index="index"
                  :pushIndex="pushIndex"
                    :searchLoading="searchLoading"
                  @updatePushIndex="updatePushIndex"
                    @apiRequestCompleted="handleApiRequestCompleted"
                  :sensorCodes="item.sensorCodes"
                  :deviceId="deviceId"
                  :selectedTime="selectedTime"
                  :messageId="item.messageId"
                  :height="870 / newTwoDimArray.length"
                  :chartGroup="'syncGroup-' + deviceId"
                  :ref="(el) => setChildRef(item.targetId, el)"
                  @chart-hover="(params) => syncHover(item.targetId, params)"
                  @isZooming="handleIsZooming"
                />
              </div>
            </div>
          </div>
          <div v-else class="emptyContent">请在左侧勾选统计内容</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.analysis-box {
  width: 100%;
  display: flex;
  min-height: calc(100% - 76px - 71px);
  justify-content: space-between;
  box-sizing: border-box;
  padding-right: 10px;
  padding-left: 10px;

  .analysis-left {
    margin-top: 30px;
    width: 790px;
    height: 100%;
    position: relative;
    .relatvie-title{
      position: absolute;
      top: -32px;
    }
  }

  .analysis-right {
    width: 1100px;
    margin-top: 30px;

    .right-search {
      flex: 1;
    }

    .btn {
      width: 112px;
      height: 40px;
      line-height: 40px;
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      background-image: url("@/assets/img/btnBg.png");
      background-size: contain;
      margin-left: 12px;
      cursor: pointer;
    }
  }
}

.right {
  width: 100%;
  height: 870px;
  background: linear-gradient(
    180deg,
    rgba(0, 140, 255, 0.15) 0%,
    rgba(36, 186, 255, 0) 100%
  );
  overflow-y: auto;
  margin-top: 10px;
}

.right-content {
  margin-top: 10px;
}

.emptyContent {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
