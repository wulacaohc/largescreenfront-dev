<template>
  <div class="enhanced-datetime-picker" :id="pickerId">
    <div class="datetime-input" @click="togglePicker">
      <input
        type="text"
        :value="displayValue"
        readonly
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <span class="icon">
        <svg viewBox="0 0 1024 1024" width="16" height="16">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
          <path d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z"></path>
        </svg>
      </span>
    </div>

    <div class="datetime-panel" v-if="visible">
      <div class="panel-header">
        <div class="date-picker">
          <div class="header">
            <button @click="prevMonth">&lt;</button>
            <span>{{ currentYear }}年{{ currentMonth + 1 }}月</span>
            <button @click="nextMonth">&gt;</button>
          </div>
          <div class="weekdays">
            <div v-for="day in weekdays" :key="day">{{ day }}</div>
          </div>
          <div class="days">
            <div
              v-for="day in days"
              :key="day.date"
              :class="[
                'day',
                {
                  'prev-month': day.isPrevMonth,
                  'next-month': day.isNextMonth,
                  'today': day.isToday,
                  'selected': day.isSelected,
                  'disabled': day.isDisabled
                }
              ]"
              @click.stop="selectDate(day)"
            >
              {{ day.day }}
            </div>
          </div>
        </div>

        <div class="time-picker">
          <div class="time-section">
            <div class="time-title">小时</div>
            <div class="time-scroll">
              <div
                v-for="hour in hours"
                :key="hour"
                :class="{ 'active': selectedHour === hour }"
                @click="selectHour(hour)"
              >
                {{ hour.toString().padStart(2, '0') }}
              </div>
            </div>
          </div>
          <div class="time-section">
            <div class="time-title">分钟</div>
            <div class="time-scroll">
              <div
                v-for="minute in minutes"
                :key="minute"
                :class="{ 'active': selectedMinute === minute }"
                @click="selectMinute(minute)"
              >
                {{ minute.toString().padStart(2, '0') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <button class="quick-btn" @click="setNow">现在</button>
        <button class="quick-btn" @click="clear">清空</button>
        <button class="confirm-btn" @click="confirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {ElMessage} from "element-plus";

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '请选择日期时间'
  },
  disabled: Boolean,
  format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm'
  },
  minDate: String,
  maxDate: String
})
const pickerId = ref(`datetime-picker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
const emit = defineEmits(['update:modelValue', 'change'])

const visible = ref(false)
const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedHour = ref(0)
const selectedMinute = ref(0)

// 初始化值
const initFromModelValue = () => {
  if (props.modelValue) {
    const date = props.modelValue ? new Date(props.modelValue) : ''
    if (date && !isNaN(date.getTime())) {
      selectedDate.value = date
      selectedHour.value = date.getHours()
      selectedMinute.value = date.getMinutes()
      currentDate.value = new Date(date) // 同时更新当前显示的月份
    }
  }
}

// 初始调用
initFromModelValue()

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    if (!isNaN(date.getTime())) {
      selectedDate.value = date
      selectedHour.value = date.getHours()
      selectedMinute.value = date.getMinutes()
      currentDate.value = new Date(date) // 同时更新当前显示的月份
    }
  } else {
    // 如果 modelValue 被清空，则清空内部状态
    selectedDate.value = null
    selectedHour.value = 0
    selectedMinute.value = 0
  }
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const displayValue = computed(() => {
  if (!selectedDate.value) return ''

  const year = selectedDate.value.getFullYear()
  const month = (selectedDate.value.getMonth() + 1).toString().padStart(2, '0')
  const day = selectedDate.value.getDate().toString().padStart(2, '0')
  const hour = selectedHour.value.toString().padStart(2, '0')
  const minute = selectedMinute.value.toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
})

watch(displayValue, (newValue) => {
  emit('update:modelValue', newValue)
})

const days = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // 获取当月第一天
  const firstDay = new Date(year, month, 1)
  // 获取当月最后一天
  const lastDay = new Date(year, month + 1, 0)
  // 获取上个月最后几天
  const prevLastDay = new Date(year, month, 0)
  // 获取下个月前几天
  const nextFirstDay = new Date(year, month + 1, 1)

  const daysInMonth = lastDay.getDate()
  const daysInPrevMonth = prevLastDay.getDate()
  const firstDayOfWeek = firstDay.getDay()

  const daysArray = []

  // 添加上个月的日期
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    daysArray.push({
      day,
      date,
      isPrevMonth: true,
      isNextMonth: false,
      isToday: isToday(date),
      isSelected: isSelected(date),
      isDisabled: isDisabled(date)
    })
  }

  // 添加当月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    daysArray.push({
      day: i,
      date,
      isPrevMonth: false,
      isNextMonth: false,
      isToday: isToday(date),
      isSelected: isSelected(date),
      isDisabled: isDisabled(date)
    })
  }

  // 添加下个月的日期
  const remainingDays = 42 - daysArray.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    daysArray.push({
      day: i,
      date,
      isPrevMonth: false,
      isNextMonth: true,
      isToday: isToday(date),
      isSelected: isSelected(date),
      isDisabled: isDisabled(date)
    })
  }

  return daysArray
})

const isToday = (date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isSelected = (date) => {
  if (!selectedDate.value) return false

  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  )
}

const isDisabled = (date) => {
  if (props.minDate) {
    const minDate = new Date(props.minDate)
    if (date < minDate) return true
  }

  if (props.maxDate) {
    const maxDate = new Date(props.maxDate)
    if (date > maxDate) return true
  }

  return false
}

const togglePicker = () => {
  if (props.disabled) return
  visible.value = !visible.value
}

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const selectDate = (day) => {
  if (day.isDisabled) return

  selectedDate.value = new Date(day.date)
  if (day.isPrevMonth) prevMonth()
  if (day.isNextMonth) nextMonth()
}

const selectHour = (hour) => {
  selectedHour.value = hour
}

const selectMinute = (minute) => {
  selectedMinute.value = minute
}

const setNow = () => {
  const now = new Date()
  selectedDate.value = now
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
  currentDate.value = new Date(now)
}

const clear = () => {
  selectedDate.value = null
  selectedHour.value = 0
  selectedMinute.value = 0
  emit('update:modelValue', '')
  emit('change', '')
  visible.value = false
}

const confirm = () => {
  if (!selectedDate.value) {
    ElMessage.warning("请选择具体日期")
    return
  }

  const date = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth(),
    selectedDate.value.getDate(),
    selectedHour.value,
    selectedMinute.value
  )

  emit('update:modelValue', formatDate(date, props.format))
  emit('change', formatDate(date, props.format))
  visible.value = false
}

// 格式化日期
const formatDate = (date, format) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

// 点击外部关闭面板
const clickOutside = (event) => {
  const picker = document.getElementById(pickerId.value)
  if (picker && !picker.contains(event.target)) {
    visible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', clickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', clickOutside)
})
</script>

<style scoped>
.enhanced-datetime-picker {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.datetime-input {
  position: relative;
  display: inline-block;
}

.datetime-input input {
  padding: 8px 30px 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
  cursor: pointer;
}

.datetime-input input:focus {
  outline: none;
  border-color: #409eff;
}

.datetime-input input:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.datetime-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 1000;
  width: 400px;
}

.panel-header {
  display: flex;
  padding: 10px;
}

.date-picker {
  flex: 1;
  padding-right: 10px;
}

.time-picker {
  width: 120px;
  display: flex;
  border-left: 1px solid #ebeef5;
  padding-left: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.header button:hover {
  color: #409eff;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  margin-bottom: 5px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  color: #333;
}

.day:hover {
  background-color: #f2f6fc;
}


.day.today {
  color: #409eff;
  font-weight: bold;
}

.day.selected {
  background-color: #409eff;
  color: #fff;
}

.day.disabled {
  cursor: not-allowed;
  background-color: #f5f7fa;
}

.time-section {
  flex: 1;
}

.time-title {
  text-align: center;
  font-size: 12px;
  margin-bottom: 5px;
}

.time-scroll {
  height: 200px;
  overflow-y: auto;
}

.time-scroll div {
  padding: 5px 0;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  color: #333;
}

.time-scroll div:hover {
  background-color: #f2f6fc;
}

.time-scroll div.active {
  background-color: #409eff;
  color: #fff;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  border-top: 1px solid #ebeef5;
}

.quick-btn {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 12px;
  margin-right: 10px;
}

.quick-btn:hover {
  color: #66b1ff;
}

.confirm-btn {
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 15px;
  font-size: 12px;
  cursor: pointer;
}

.confirm-btn:hover {
  background-color: #66b1ff;
}
</style>
