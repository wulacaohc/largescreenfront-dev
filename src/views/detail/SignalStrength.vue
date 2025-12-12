<template>
  <div class="signal-strength">
    <div 
      v-for="i in 5" 
      :key="i" 
      class="signal-bar" 
      :class="{ 'active': i <= strength }"
    ></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  strength: {
    type: Number,
    required: true,
    validator: value => value >= 1 && value <= 5
  }
});
</script>

<style scoped>
.signal-strength {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 24px;
}

.signal-bar {
  width: 6px;
  background-color: #ddd;
  transition: background-color 0.3s ease;
  opacity: 0.2;
}

.signal-bar:nth-child(1) {
  height: 8px;
}
.signal-bar:nth-child(2) {
  height: 12px;
}
.signal-bar:nth-child(3) {
  height: 16px;
}
.signal-bar:nth-child(4) {
  height: 20px;
}
.signal-bar:nth-child(5) {
  height: 24px;
}

.signal-bar.active {
  background-color: #fff; /* 绿色表示信号强 */
  opacity: 1;
}
</style>