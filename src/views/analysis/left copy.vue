<script setup>
import { ref, onMounted, watch, defineEmits, nextTick } from 'vue';
const emit = defineEmits(['dragEnd', 'sendSelectedData']);
import { ElMessage } from 'element-plus';
import { Delete, Rank } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';
import { uploadDbc, getSensorList } from '@/api'
import { useRouter, useRoute } from "vue-router";
import { upload } from '@/utils/request';
const route = useRoute();
const router = useRouter();
import dayjs from 'dayjs'
const props = defineProps({
  keyword: {
    type: String,
    default: ''
  }
});
watch(() => props.keyword, () => {
  search.value = props.keyword
  //getDetail()
})
const search = ref(props.keyword)
const customUpload = async (options) => {
  const file = options.file;
  const params = {
    deviceId: search.value,
  };

  try {
    const response = await upload('/equipment/uploadDbc', file, params);
    // options.onSuccess(response);
    dialogVisible.value = false
    getDetail()
  } catch (error) {
    options.onError(error);
  }
};
const handleSuccess = (response) => {
  ElMessage.success('文件上传成功');
  // console.log()
  return
};

const handleError = (error) => {
  // ElMessage.error('文件上传失败');
};

const handleSearch = () => {
  if (search.value.trim().length == 0) {
    ElMessage.error('请输入搜索内容')
    return
  }
  getDetail()
}
const sensorList = ref([])
const initTime = ref(null)
const getDetail = () => {
  if (search.value && search.value.trim().length == 0) {
    ElMessage.error('请输入搜索内容')
    return
  } else {
    getSensorList(
      { search: search.value }
    ).then(res => {
      if (res.code == 200) {
        if (!initTime.value) {
          initTime.value = res.data.result[0].messageTime / 1000
        }

        let arr = res.data.result.map(v => {
          return {
            ...v,
            absoluteTime: v.messageTime / 1000 - initTime.value
          }
        })
        tableData.value.push(arr[0])
        console.log(tableData.value)
      }
    })
  }
}

const dialogVisible = ref(false)
const handleClose = () => {
  dialogVisible.value = false;
}

// 表格数据
const tableData = ref([]);
const selectedDataList = ref([[]]);
const dropTables = ref([]);
const sortableInstances = ref([]);
const currentDragItem = ref(null);

const setDragItem = (row) => {
  currentDragItem.value = row;
};

// 初始化拖拽
onMounted(() => {
  initSortable();
});

const table1 = ref(null)

// 修改Sortable配置
const initSortable = () => {
  sortableInstances.value.forEach(instance => instance?.destroy());
  sortableInstances.value = [];

  // Source table configuration
  const table1El = table1.value?.$el.querySelector('.el-table__body-wrapper tbody');
  if (table1El) {
    const sortable1 = new Sortable(table1El, {
      group: {
        name: 'shared',
        pull: 'clone',
        put: false
      },
      sort: false,
      // draggable: '.sensorsData', // Make entire row draggable
      handle: '.sensorsData', // But only allow drag via sensorsData elements
      ghostClass: 'sortable-ghost',
      onStart: (evt) => {

        console.log(evt)
        // Only allow drag from sensorsData elements
        if (!evt.target.classList.contains('sensorsData') && 
            !evt.target.closest('.sensorsData')) {
          evt.preventDefault();
          return;
        }
        
        // Get the actual row data
        const rowEl = evt.item;
        const rowIndex = [...rowEl.parentNode.children].indexOf(rowEl);
        currentDragItem.value = tableData.value[rowIndex];
      },
      onEnd: () => {
        // Reset any visual changes
        table1.value?.$el.querySelectorAll('.el-table__row').forEach(row => {
          row.style.transform = '';
        });
      }
    });
    sortableInstances.value.push(sortable1);
  }

  // Target areas configuration
  initDropTables();
};

// 目标区域初始化
const initDropTables = () => {
  nextTick(() => {
    dropTables.value.forEach((tableEl, index) => {
      if (tableEl) {
        const sortable = new Sortable(tableEl, {
          group: {
            name: 'shared',
            pull: true,
            put: true
          },
          sort: true,
          animation: 150,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          onAdd: (evt) => {
            // 阻止默认DOM插入行为
            evt.item.remove();
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;

            // 手动处理数据移动
            const fromData = tableData.value;
            const toData = selectedDataList.value[index];
            const item = { ...fromData[oldIndex] };

            fromData.splice(oldIndex, 1);
            toData.splice(newIndex, 0, item);

            // 强制更新
            tableData.value = [...tableData.value];
            selectedDataList.value = [...selectedDataList.value];
            emit('dragEnd', search.value, selectedDataList.value);
          }
        });
        sortableInstances.value.push(sortable);
      }
    });
  });
};
const handleDragEnd = (evt) => {
  const { from, to, oldIndex, newIndex } = evt;

  let fromData, toData;

  if (from === table1.value?.$el.querySelector('.el-table__body-wrapper tbody')) {
    fromData = tableData.value;
  } else {
    const fromIndex = Array.from(document.querySelectorAll('.drop-table-body')).indexOf(from);
    if (fromIndex >= 0) {
      fromData = selectedDataList.value[fromIndex];
    }
  }

  const toIndex = Array.from(document.querySelectorAll('.drop-table-body')).indexOf(to);
  if (toIndex >= 0) {
    toData = selectedDataList.value[toIndex];
  }

  if (!fromData || !toData || oldIndex === undefined) return;

  const draggedItem = fromData[oldIndex];
  if (!draggedItem) return;

  // 从源数据中移除
  fromData.splice(oldIndex, 1);

  // 添加到目标数据
  const newItem = { ...draggedItem };
  if (newIndex >= 0 && newIndex <= toData.length) {
    toData.splice(newIndex, 0, newItem);
  } else {
    toData.push(newItem);
  }

  // 强制更新视图
  nextTick(() => {
    tableData.value = [...tableData.value];
    selectedDataList.value = [...selectedDataList.value];
  });

  emit('dragEnd', search.value, selectedDataList.value);
};

const addDropZone = () => {
  selectedDataList.value.push([]);
  dropTables.value.push(null);
  nextTick(() => {
    initDropTables();
  });
};

const removeDropZone = (index) => {
  if (selectedDataList.value.length <= 1) {
    ElMessage.warning('至少保留一个分栏');
    return;
  }

  tableData.value.push(...selectedDataList.value[index]);
  selectedDataList.value.splice(index, 1);
  dropTables.value.splice(index, 1);

  initSortable();
  emit('dragEnd', search.value, selectedDataList.value);
};
// 修改后的clearDropZone方法，清空时也清空选中状态
const clearDropZone = (index) => {
  if (selectedDataList.value[index].length === 0) return;

  // 返回数据到源表格
  tableData.value.unshift(...selectedDataList.value[index]);

  // 清空分栏数据和选中状态
  selectedDataList.value[index] = [];
  selectedItems.value[index] = new Set();

  // 强制更新视图
  nextTick(() => {
    tableData.value = [...tableData.value];
    selectedDataList.value = [...selectedDataList.value];
  });

  emit('dragEnd', search.value, selectedDataList.value);
  ElMessage.success(`已清空分栏并返回数据到源表格`);
};

const removeItem = (item, index) => {
  selectedDataList.value[index] = selectedDataList.value[index].filter(i => i.id !== item.id);
  tableData.value.push(item);
  ElMessage.info(`已移除: ${item.sensor_code}`);
  emit('dragEnd', search.value, selectedDataList.value);
};

// 新增选中状态相关代码
const selectedItems = ref([]); // 存储所有分栏的选中状态
const initSelectedItems = () => {
  selectedItems.value = selectedDataList.value.map(() => new Set());
};

// 初始化时创建选中状态存储
watch(selectedDataList, () => {
  initSelectedItems();
}, { deep: true });

// 切换选中状态
const toggleSelect = (itemId, zoneIndex) => {
  if (!selectedItems.value[zoneIndex]) {
    selectedItems.value[zoneIndex] = new Set();
  }
  if (selectedItems.value[zoneIndex].has(itemId)) {
    selectedItems.value[zoneIndex].delete(itemId);
  } else {
    selectedItems.value[zoneIndex].add(itemId);
  }
};

// 检查是否选中
const isSelected = (itemId, zoneIndex) => {
  return selectedItems.value[zoneIndex]?.has(itemId) || false;
};

// 获取当前分栏所有选中数据
const getSelectedData = (zoneIndex) => {
  if (!selectedDataList.value[zoneIndex] || !selectedItems.value[zoneIndex]) {
    return [];
  }
  return selectedDataList.value[zoneIndex].filter(item =>
    selectedItems.value[zoneIndex].has(item.id)
  );
}

// 发送选中数据到父组件
const sendSelectedDataToParent = () => {
  const allSelectedData = selectedDataList.value.map((_, index) => getSelectedData(index));
  console.log(allSelectedData, 'allSelectedData');
  emit('sendSelectedData', search.value, allSelectedData);
}

// 全选/取消全选当前分栏
const toggleSelectAll = (zoneIndex) => {
  const currentZone = selectedDataList.value[zoneIndex];
  if (!currentZone) return;

  const allSelected = currentZone.every(item =>
    selectedItems.value[zoneIndex].has(item.id)
  );

  if (allSelected) {
    // 取消全选
    currentZone.forEach(item => {
      selectedItems.value[zoneIndex].delete(item.id);
    });
  } else {
    // 全选
    currentZone.forEach(item => {
      selectedItems.value[zoneIndex].add(item.id);
    });
  }
  sendSelectedDataToParent();
};
</script>

<template>
  <div class="left-content">
    <div class="left-search">
      <search-box>
        <template #content>
          <input
            v-model="search"
            class="elInput"
            placeholder="请输入设备ID号/SIM卡号/产品序列号"
            @keyup.enter="handleSearch"
          />
        </template>
        <template #right-icon>
          <img
            src="@/assets/img/search-icon.png"
            class="search-icon"
            @click="handleSearch"
          />
        </template>
      </search-box>
    </div>
    <div class="contentBox">
      <div class="drag-container">
        <el-row :gutter="20">
          <el-col :span="13">
            <ItemWrap class="right-content right-content1" title="报文信息">
              <template #right>
                <el-button
                  type="primary"
                  size="small"
                  @click="dialogVisible = true"
                  >导入</el-button
                >
              </template>
              <div shadow="hover" class="drag-box">
                <div v-show="tableData.length > 0">
                  <el-table
                    ref="table1"
                    :data="tableData"
                    row-key="id"
                    style="width: 100%"
                    height="786"
                    :default-expand-all="true"
                    :preserve-expanded-content="true"
                    :header-cell-style="{
                      background: 'transparent',
                      color: '#fff',
                      height: '50px',
                    }"
                    :header-row-style="{
                      background: 'rgba(0, 140, 255, 0.3)',
                      color: '#fff',
                      height: '50px',
                    }"
                    :row-style="{
                      background: 'rgba(0, 140, 255, 0.2)',
                      color: '#fff',
                    }"
                    :cell-style="{ border: 'none', color: '#fff' }"
                  >
                    <el-table-column type="expand" width="20px">
                      <template #default="scope">
                        <div class="table-expand pl-[30px] box-border">
                          <!-- {{ JSON.stringify(scope.row) }} -->
                          <div 
                            class="flex sensorsData cursor-pointer py-[10px]"
                            v-for="(item, index) in scope.row.sensors"
                            draggable="true"
                            @dragstart="onDragStart($event, item.sensorCode)"
                          >
                            <div>{{ item.sensorCode }}</div>
                            <div></div>
                          </div>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="device_id"
                      label="绝对时间"
                      width="120"
                    >
                      <template #default="scope">
                        {{ scope.row.absoluteTime.toFixed(6) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="sensor_unit" label="通道" />
                    <el-table-column prop="messageId" label="标识符" />
                    <el-table-column prop="sensorCommet" label="帧率" />
                    <el-table-column prop="messageName" label="报文名称" />
                  </el-table>
                </div>
                <div v-if="tableData.length === 0" class="empty-tip">
                  <div class="empty-content">
                    <div class="text1 mb-[20px]">请导入DBC文件解析数据</div>
                    <el-button
                      type="primary"
                      size="large"
                      class="exportBtn"
                      @click="dialogVisible = true"
                    >
                      <img
                        src="@/assets/img/export.png"
                        class="exportIcon size-4"
                      />导入
                    </el-button>
                  </div>
                </div>
              </div>
            </ItemWrap>
          </el-col>

          <el-col :span="11">
            <ItemWrap class="right-content" title="统计内容">
              <div shadow="hover" class="drop-box">
                <div
                  v-for="(selectedData, index) in selectedDataList"
                  :key="index"
                  class="drop-area"
                >
                  <div class="drop-table">
                    <div class="drop-table-header">
                      <div class="drop-table-cell">名称</div>
                      <div class="drop-table-cell">操作</div>
                    </div>
                    <div
                      class="drop-table-body"
                      :ref="(el) => (dropTables[index] = el)"
                    >
                      <div
                        v-for="item in selectedData"
                        :key="item.id"
                        class="drop-table-row"
                        :data-id="item.id"
                      >
                        <div class="drop-table-cell">
                          {{ item.sensor_code }}
                        </div>
                        <div class="drop-table-cell">
                          <div class="flex">
                            <div
                              style="margin-right: 10px"
                              @click.stop="
                                () => {
                                  toggleSelect(item.id, index);
                                  sendSelectedDataToParent();
                                }
                              "
                            >
                              <img
                                src="@/assets/img/check.png"
                                alt=""
                                class="checkIcon"
                                v-if="isSelected(item.id, index)"
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
                                @click="removeItem(item, index)"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="selectedData.length === 0" class="drop-empty">
                        暂无数据，请从左侧拖拽添加
                      </div>
                    </div>
                  </div>

                  <div class="flex abtnBox">
                    <div class="abtn" @click="clearDropZone(index)">清空</div>
                    <div class="abtn" @click="addDropZone">添加分栏</div>
                    <div class="abtn" @click="removeDropZone(index)">
                      删除分栏
                    </div>
                  </div>
                </div>
              </div>
            </ItemWrap>
          </el-col>
        </el-row>
        <el-dialog
          v-model="dialogVisible"
          title="录入应收单"
          width="800"
          :before-close="handleClose"
          custom-class="dialog-custom"
        >
          <div>
            <el-upload
              class="upload-demo"
              drag
              multiple
              :http-request="customUpload"
              :on-success="handleSuccess"
              :on-error="handleError"
            >
              <div class="uploadBox text-center">
                <img src="@/assets/img/upload.png" class="upload-img" />
                <div class="el-upload__text">将文件拖到此处或点击上传</div>
              </div>
            </el-upload>
          </div>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="dialogVisible = false" size="large"
                >取消</el-button
              >
              <el-button
                type="primary"
                @click="dialogVisible = false"
                size="large"
                >确定</el-button
              >
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.right-content {
  height: 100%;
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
  margin-top: 30px;
  height: 786px;
}
.drag-container {
  height: 100%;
  .el-row {
    height: 100%;
    .el-col {
      height: 100%;
    }
  }
}
.drag-box {
  height: 100%;
  margin-top: 12px;
  background: linear-gradient(
    180deg,
    rgba(0, 140, 255, 0.2) 0%,
    rgba(36, 186, 255, 0) 100%
  );
}
.drop-box {
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(0, 140, 255, 0.2) 0%,
    rgba(36, 186, 255, 0) 100%
  );
  margin-top: 12px;
  overflow-y: auto;
}

.drop-table {
  border-radius: 4px;
  overflow: hidden;
  height: 200px;
  display: flex;
  flex-direction: column;
  background: rgba(0, 140, 255, 0.2);

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
}

.sortable-ghost {
  opacity: 0.5;
  background: rgba(0, 140, 255, 0.1) !important;
}

.sortable-chosen .drop-table-row {
  background: rgba(0, 140, 255, 0.3) !important;
}

.sortable-fallback {
  display: none !important;
}

.abtnBox {
  align-items: center;
  justify-content: space-between;
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
.delIcon,
.checkIcon {
  width: 24px;
  height: 24px;
  display: block;
  margin: 0 5px;
  cursor: pointer;
}
.drop-table-body {
  tr {
    display: none !important;
  }
}
/* 在style部分添加 */
.sortable-ghost {
  opacity: 0.5;
  background: rgba(0, 140, 255, 0.1);
  /* 重要：确保ghost元素不会影响布局 */
  position: absolute;
  z-index: 9999;
  pointer-events: none;
}

/* 隐藏默认拖拽图像 */
.el-table__body-wrapper .sortable-drag {
  display: none !important;
}

/* 目标区域拖拽占位符样式 */
.drop-table-body .sortable-ghost {
  position: relative;
  height: 48px;
  background: rgba(0, 140, 255, 0.2);
  border: 1px dashed #409eff;
}
.el-table__row sortable-chosen sortable-ghost {
  display: none !important;
}
.empty-content {
  height: 786px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.uploadBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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
</style>

<style>
.dialog-custom {
  background: #071d34 !important;
}
::deep .el-upload-dragger {
  border: none;
}
</style>