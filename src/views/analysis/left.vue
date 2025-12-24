<script setup>
import { ref, onMounted, watch, defineEmits, nextTick,onUnmounted, computed } from 'vue';
import { useWebSocket } from '@/utils/useWebsocket2.ts'
const emit = defineEmits(['dragEnd', 'sendSelectedData']);
import { ElMessage } from 'element-plus';
import { uploadDbc, getSensorList ,getNotDBC} from '@/api'
import { upload } from '@/utils/request';
import ExpandItemDragTable from './CloneDragTable.vue'
const props = defineProps({
  keyword: {
    type: String,
    default: ''
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {

    type: String,
    default: ''
  },
  searchTime: {},
  searchLoading: {
    type: Boolean,
    default: false
  },
  deviceId: {
    type: String,
    default: ''
  }
});

//添加
const isRealTimeMode = computed(() => {
  return !props.startTime && !props.endTime;
});

const search = ref(props.keyword)
const newChannelUrl = ref(import.meta.env.VITE_APP_CONFIG_WEBSOCKET)


const handleMessage = (newData) => {
  // if (props.startTime || props.endTime) {
  //   return
  // }
  console.log('采用实时模式，使用websocket')
  // console.log('left-message')
  const parseData = JSON.parse(newData)
  // console.log('Parsed data:', parseData) // 添加这行查看解析后的数据
  if(parseData && isObject(parseData)){
    // console.log('isObject check passed') // 添加这行
    // 修改这里，检查 device_data 而不是 device_list
    // console.log('device_data exists:', parseData.device_data)
    // console.log('device_data length:', parseData.device_data?.length)
    // if (parseData.device_list && parseData.device_list.length) {
    //   console.log('Device list:', parseData.device_list) // 添加这行查看设备列
    // 修改这里，使用 device_data 而不是 device_list
    if (parseData.device_data && parseData.device_data.length) {
      console.log('Device data:', parseData.device_data)
      let arr = parseData.device_data.map(v => {
        return {
          ...v,
          absoluteTime: initTime.value
        }
      })
      // console.log('Processed array:', arr)  // 添加这行
      sourceData.value=arr
      // console.log('SourceData updated:', sourceData.value)  // 添加这行
      initTime.value=initTime.value+1
    }
  }
}
const {
  setUrl,
  connect,
  sendMessage,
  isConnected,
} = useWebSocket(handleMessage)

let timer = null;

// 创建动态通道

const initTime = ref(0)
const handleCreateChannel = () => {
  const channelUrl = `${newChannelUrl.value}?deviceId=${search.value}`
  setUrl(channelUrl)
  connect()
  console.log('连接成功')
}
const getNotDBCList = () => {
  const params = {
    deviceId: search.value,
  }

  if (props.startTime && props.endTime) {
    params.startTime = props.startTime
    params.endTime = props.endTime
    timer && clearInterval(timer)
  }

  getNotDBC(params).then(res => {
    if (res.code == 200) {
      let arr = res.data.result.map(v => {
          return {
            ...v,
            absoluteTime: initTime.value
          }
        })

        sourceData.value=arr
        initTime.value=initTime.value+3
    }
  })
}
const getDetail = () => {
  // console.log('props.startTime', props.startTime)
  // console.log('props.endTime', props.endTime)
  // console.log('searchTime', props.searchTime, props.searchTime.startTime)

  if (!uploadDbcFlag.value) {
    getNotDBCList()
  } else {
    // 实时模式下不再定时请求数据，完全依赖WebSocket
    if (isRealTimeMode.value) {
      // 实时模式由WebSocket驱动，不需要主动请求

      return;
    }
    getSensorList(
        { search: props.deviceId, startTime: props.searchTime.startTime, endTime: props.searchTime.now },
    ).then(res => {
      // 历史模式下请求数据
      console.log('采用时间范围，查询历史模式')
      if (res.code == 200) {
        if (!initTime.value) {
          initTime.value = res.data.result[0].messageTime / 1000
        }

        let arr = res.data.result.map(v => {
          return {
            ...v,
            absoluteTime: initTime.value
          }
        })
        sourceData.value=arr
      }
    })
  }
}
watch(() => props.keyword, () => {
  search.value = props.keyword
  getDetail()

  // 只在非实时模式下设置定时器,清除之前的定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }


  // 只在需要轮询的情况下设置定时器:
  // 1. 未导入DBC文件时
  // 2. 已导入DBC但处于历史模式时
  if (!uploadDbcFlag.value || (!isRealTimeMode.value && uploadDbcFlag.value)) {
    timer = setInterval(getDetail, 1000)
  }
})

// 添加对时间范围的监听
// 修正时间范围监听逻辑
watch([() => props.startTime, () => props.endTime], ([newStartTime, newEndTime]) => {
  // 清除之前的定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // 如果是实时模式且已导入DBC文件，则不设置定时器（依赖WebSocket）
  if (!newStartTime && !newEndTime && uploadDbcFlag.value) {
    // 实时模式下依赖WebSocket，不清除定时器可能会更好
    // 但为了保险起见，这里不设置定时器
  } else {
    // 其他情况都设置定时器
    timer = setInterval(getDetail, 1000);
  }
})




function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}






const dialogVisible = ref(false)
const openDialog = () => {
  dialogVisible.value = true
}
const fileName = ref('')
const customUpload = async (options) => {
  const file = options.file;
  fileName.value = file.name
  const params = {
    deviceId: search.value,
  };

  try {
    const response = await upload('/equipment/uploadDbc', file, params);
    uploadDbcFlag.value = true
    clearInterval(timer);

    if (props.startTime || props.endTime) {
      getSensorList(
          { search: search.value, startTime: props.startTime, endTime: props.endTime },
      ).then(res => {
        if (res.code == 200) {
          if (!initTime.value) {
            initTime.value = res.data.result[0].messageTime / 1000
          }

          let arr = res.data.result.map(v => {
            return {
              ...v,
              absoluteTime: initTime.value
            }
          })
          sourceData.value=arr
        }
      })
    } else {
      console.log(isConnected.value,'1111')
      if(isConnected.value){
        const { disconnect } = useWebSocket(handleMessage);
        disconnect();
      }
      await handleCreateChannel ()
    }
  } catch (error) {
    options.onError(error);
  }
};

const handleSuccess = (response) => {
  ElMessage.success('文件上传成功');
  return
};

const handleError = (error) => {
  // ElMessage.error('文件上传失败');
};

const sourceTable = ref(null)
const sourceData = ref([])

const uploadDbcFlag = ref(false)


const targets = ref([
  { id: 1, items: [] },
  { id: 2, items: [] }
])

const selectedItems = ref(targets.value.map(() => []))


const initSelectedItems = () => {
  selectedItems.value = targets.value.map(() => [])
}

// 选择  item, 就是数据体
const toggleSelect = (itemId, targetIndex, item) => {
 if (!item.selected) {
   item.selected = true

   sendMessage(JSON.stringify({
     type: 'sub',
     sensorCode: item.sensorCode + '_' + item.messageId
   }))
 } else {
   item.selected = false
   sendMessage(JSON.stringify({
     type: 'unsub',
     sensorCode: item.sensorCode + '_' + item.messageId
   }))
 }
}

//传给父组件爱你
const sendSelectedDataToParent = (item) => {
  console.log('targets', targets)
  const selectedData = targets.value.map((target, index) => {
    return {
      targetId: target.id,
      items: target.items.filter(item =>
        item.selected
      ),
      item: item
    }
  })
  console.log('selectedData', selectedData)
  emit('sendSelectedData', search.value, selectedData)
}


const activeTarget = ref(null)
const currentDragItem = ref(null)

// 处理拖拽开始
const handleDragStart = ({ row, item }) => {
  currentDragItem.value = { row, item }
}

// 处理拖拽结束
const handleDragEnd = () => {
  currentDragItem.value = null
  activeTarget.value = null
}


// 处理拖拽进入目标区域
const handleDragEnter = (e, index) => {
  activeTarget.value = index
}

// 处理拖拽离开目标区域
const handleDragLeave = (e, index) => {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    activeTarget.value = null
  }
}

// 处理拖拽悬停
const handleDragOver = (e, index) => {
  activeTarget.value = index
}

// 处理放置
const handleDrop = (e, targetIndex) => {
  if (!currentDragItem.value) return

  const { item } = currentDragItem.value
  const target = targets.value[targetIndex]

  // 检查是否已存在
  if (target.items.some(i => i.id === item.id)) {
    ElMessage.warning(`"${item.sensorCode}" 已存在`)
    return
  }

  // 添加到目标容器
  targets.value[targetIndex].items.push({ ...item })
  activeTarget.value = null
}

// 移除项目
const removeItem = (targetIndex, itemIndex) => {
  const removedItem = targets.value[targetIndex].items[itemIndex]
  targets.value[targetIndex].items.splice(itemIndex, 1)

  // Remove from selected items if it was selected
  const selectedIndex = selectedItems.value[targetIndex].indexOf(removedItem.id)
  if (selectedIndex !== -1) {
    selectedItems.value[targetIndex].splice(selectedIndex, 1)
  }

  sendSelectedDataToParent()
}

// 添加目标容器
const addTarget = () => {
  targets.value.push({
    id: Date.now(),
    items: []
  })
  selectedItems.value.push([])
}

// 移除目标容器
const removeTarget = (index) => {
  if (targets.value.length <= 1) {
    ElMessage.warning('至少保留一个目标容器')
    return
  }
  targets.value.splice(index, 1)
  selectedItems.value.splice(index, 1)
  sendSelectedDataToParent()
}

const resetTarget = () => {
  Object.values(targets.value).forEach((item, index) => {
    item.items.every((each) => {
      each.selected = false
    })
  })
  sendSelectedDataToParent()
}
// 暴露组件方法给模板
defineExpose({
  sourceTable,
  openDialog,
  resetTarget,
  getDetail
})
onMounted(() => {
  initSelectedItems()
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});


</script>

<template>
  <div>
    <div class="contentBox">
      <div class="drag-container">
        <div class="w-[480px] shrink-0">
           <div class="flex">
             <el-upload
                  class="upload-demo"
                  multiple
                          accept=".dbc"
                  :http-request="customUpload"
                  :on-success="handleSuccess"
                  :on-error="handleError"
                >
                  <div class="uploadBox text-center">
                        <el-button
                          type="primary"
                          size="small"
                          class="exportBtn"
                        >
                          <img
                            src="@/assets/img/export.png"
                            class="exportIcon size-4"
                          />导入
                        </el-button>
                  </div>
                </el-upload>
           </div>

          <ItemWrap class="right-content right-content1" title="报文信息">
            <template #right>
               <span>{{fileName}}</span>
            </template>
            <div class="mt-[20px]" v-show="sourceData.length > 0" style="height: 830px;">
              <!-- 源表格 -->
              <expand-item-drag-table
                ref="sourceTable"
                :data="sourceData"
                @item-drag-start="handleDragStart"
                @item-drag-end="handleDragEnd"
                :uploadDbcFlag="uploadDbcFlag"
              >
                <template #expand-item="{ item }" v-if="uploadDbcFlag">
                  <span class="w-[150px] inline-block break-words">{{ item.sensorCode }}</span>
                  <span class="w-[100px]">{{item.sensorValue?item.sensorValue:'--'}}{{item.sensorUnit?item.sensorUnit:''}}</span>
                  <span class="w-[120px]">{{ item.sensorComment }}</span>
                </template>
                <el-table-column prop="deviceId" label="绝对时间" width="60">
                  <template #default="scope">
                    <span class="text-nowrap text-show">{{ scope.row.absoluteTime.toFixed(1) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="messageId" label="标识符" width="92">
                  <template #default="scope">
                    <span class="text-nowrap">
                    {{ scope.row.messageId?scope.row.messageId:scope.row.messageid?scope.row.messageid:'--' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="messageName" label="报文名称" width="100">
                  <template #default="scope">
                    <span class="text-nowrap">{{ scope.row.messageName?scope.row.messageName:'--' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="messagedata" label="报文内容" width="200">
                  <template #default="scope">
                    <span class="text-nowrap">{{ scope.row.messagedata?scope.row.messagedata:'--' }}</span>
                  </template>
                </el-table-column>
              </expand-item-drag-table>
            </div>
            <div v-if="sourceData.length === 0" class="empty-tip">
              <div class="empty-content">
                <div class="text1 mb-[20px]">暂无数据</div>
              </div>
            </div>
          </ItemWrap>
        </div>
        <!-- 动态目标容器 -->

        <div class="target-container">
          <ItemWrap class="right-content right-content1" title="统计内容" style="overflow-y: auto;">
            <template #right>
              <div @click="addTarget" class="abtn">添加分栏</div>
            </template>

            <div class="mt-[20px] h-full">
              <div v-for="(target, index) in targets" :key="index">
                <div
                  class="drop-target"
                  @dragover.prevent="handleDragOver($event, index)"
                  @dragenter.prevent="handleDragEnter($event, index)"
                  @dragleave.prevent="handleDragLeave($event, index)"
                  @drop.prevent="handleDrop($event, index)"
                  :class="{ 'drag-over': activeTarget === index }"
                >
                  <div class="drop-target-header">
                    <div class="drop-target-cell">名称</div>
                    <div class="drop-target-cell">操作</div>
                    <div><div class="abtn" @click="removeTarget(index)">删除分栏</div></div>
                  </div>
                  <div class="drop-target-body">
                    <div
                      class="dropped-item drop-target-row"
                      v-for="(item, itemIndex) in target.items"
                      :key="itemIndex"
                    >
                      <div class="drop-target-cell">
                        {{ item.sensorCode }}
                      </div>
                      <div class="drop-target-cell">
                        <div class="flex">
                          <div
                            style="margin-right: 10px"
                            @click.stop="
                              () => {
                                toggleSelect(item.id, index, item);
                                sendSelectedDataToParent(item);
                              }
                            "
                          >
                            <img
                              src="@/assets/img/check.png"
                              alt=""
                              class="checkIcon"
                              v-if="item.selected"
                            />
                            <img
                              src="@/assets/img/checkbox-no.png"
                              alt=""
                              class="checkIcon"
                              v-else
                            />
                          </div>
                          <div>
                            <img
                              src="@/assets/img/del-icon.png"
                              class="delIcon"
                              @click="removeItem(index, itemIndex)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="target.items.length === 0" class="empty-tip">
                      拖拽项目到此处
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ItemWrap>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.right-content {
  height: 100%;
  &::-webkit-scrollbar {
    display: none; /* 隐藏滚动条 */
  }
}
.left-search {
  .search-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  .elInput {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #fff;
    font-size: 14px;
  }
}
.contentBox {
  // margin-top: 30px;
  height: 950px;
}
.drag-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  height: 100%;
}

.target-container {
  width: 300px;
}
.drop-target {
  border-radius: 4px;
  overflow: hidden;
  height: 175px;
  width: 300px;
  display: flex;
  flex-direction: column;
  background: rgba(0, 140, 255, 0.2);
  margin-bottom: 5px;

  &-header {
    display: flex;
    background: rgba(0, 140, 255, 0.3);
    color: #fff;
    height: 50px;
    align-items: center;
  }

  &-body {
    flex: 1;
    overflow-y: auto;
    tr {
      display: none !important;
    }
  }

  &-row {
    display: flex;
    height: 48px;
    align-items: center;
    background: rgba(0, 140, 255, 0.2);
    color: #fff;
    border-bottom: 1px solid rgba(0, 140, 255, 0.1);

    &:hover {
      background: rgba(0, 140, 255, 0.3);
    }
  }

  &-cell {
    padding: 0 12px;
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;

    &:last-child {
      justify-content: flex-end;
      flex: 0 0 80px;
    }
  }

  .drop-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.5);
  }
  .delIcon,
  .checkIcon {
    width: 24px;
    height: 24px;
    display: block;
    margin: 0 5px;
    cursor: pointer;
  }
}
.empty-content {
  height: 786px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
}
.abtnBox {
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
  .abtn {
    width: 89px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    font-size: 16px;
    color: #fff;
    font-weight: 600;
    background: url("@/assets/img/blueBtn.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    &:nth-last-child(1) {
      background: url("@/assets/img/redBtn.png") no-repeat;
      background-size: 100% 100%;
    }
  }
}
.abtn {
  width: 89px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
  background: url("@/assets/img/blueBtn.png") no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  &:nth-last-child(1) {
    background: url("@/assets/img/redBtn.png") no-repeat;
    background-size: 100% 100%;
  }
}
.uploadBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  //height: 300px;
  .upload-img {
    width: 100px;
    height: 80px;
    display: block;
    margin-bottom: 20px;
  }
  .el-upload__text {
    color: #fff;
    font-size: 18px;
  }
}
.text-show{
  overflow: visible;
  text-overflow: nowrap !important;
}
</style>
