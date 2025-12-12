<script setup>
import { ref, watch, nextTick } from 'vue'
import { Rank } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
    required: true  // 标记为必传属性
  },
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  uploadDbcFlag: {
    type: Boolean,
    default: false
  },
})
watch(() => props.uploadDbcFlag, (newVal) => { 
})

const emit = defineEmits(['item-drag-start', 'item-drag-end', 'update:data'])

const tableRef = ref(null)
const tableData = ref([...props.data])
const draggedItem = ref(null)

// 深度监听 props.data 变化
watch(() => props.data, (newVal) => {
  // console.log('父组件数据更新:', newVal)
  tableData.value = [...newVal]  // 创建新数组保证响应性
  
  // 如果需要保持展开状态，可以在这里处理
  nextTick(() => {
    // 保持当前展开行的状态
    // tableRef.value?.toggleRowExpansion(...)
  })
}, {
  deep: true,
  immediate: true  // 立即执行一次
})

const getRowKey = (row) => {
  return typeof props.rowKey === 'function' 
    ? props.rowKey(row) 
    : row[props.rowKey]
}

const handleRowClick = (row) => {
  tableRef.value?.toggleRowExpansion(row)
}

const handleDragStart = (e, row, item) => {
  if (!e.target.classList.contains('expand-item')) {
    e.preventDefault()
    return
  }
  
  draggedItem.value = {
    row,
    item: { ...item }  // 深度拷贝
  }
  
  e.dataTransfer.setData('text/plain', JSON.stringify({
    rowId: getRowKey(row),
    itemId: item.id
  }))
  
  e.target.style.opacity = '0.5'
  emit('item-drag-start', { row, item })
}

const handleDragEnd = (e) => {
  if (e.target.classList.contains('expand-item')) {
    e.target.style.opacity = ''
  }
  emit('item-drag-end', draggedItem.value)
  draggedItem.value = null
  
  // 如果需要同步数据回父组件
  emit('update:data', [...tableData.value])
}

// 暴露方法给父组件
defineExpose({
  tableRef,
  refreshData: () => {
    tableData.value = [...props.data]
  }
})
</script>

<template>
  <el-table
    ref="tableRef"
    :data="tableData"
    row-key="id"
    @row-click="handleRowClick"
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
    height="100%"
  >
    
    <!-- 展开行 -->
    <el-table-column type="expand" v-if="uploadDbcFlag">
      <template #default="{ row }">
        <div 
          class="expand-content"
          :data-row-id="getRowKey(row)"
        >
          <div
            v-for="item in row.sensors"
            :key="item.id"
            class="expand-item"
            :data-item-id="item.id"
            draggable="true"
            @dragstart="handleDragStart($event, row, item)"
            @dragend="handleDragEnd"
          >
            <slot name="expand-item" :item="item">
              {{ item.sensorCode }}
              <el-icon class="drag-handle"><Rank /></el-icon>
            </slot>
          </div>
        </div>
      </template>
    </el-table-column>
    
    <!-- 常规列插槽 -->
    <slot />
  </el-table>
</template>

<style scoped>
.expand-content {
  padding: 0 10px;
}

.expand-item {
  padding: 8px 12px;
  margin: 4px 0;
  /* background: #f5f7fa; */
  border-radius: 4px;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.expand-item:active {
  cursor: grabbing;
}

.drag-handle {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  margin-left: 8px;
}

.drag-handle:hover {
  color: var(--el-color-primary);
}

/* 拖拽时的视觉效果 */
.expand-item.dragging {
  opacity: 0.5;
  background: var(--el-color-primary-light-8);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
</style>