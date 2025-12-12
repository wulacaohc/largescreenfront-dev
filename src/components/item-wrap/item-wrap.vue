<script setup lang="ts">
import BorderBox13 from "@/components/datav/border-box-13";
const props = withDefaults(
  defineProps<{
    // 标题
    title: number | string;
  }>(),
  {
    title: "",
  }
);
</script>

<template>
  <div>
    <div class="item_title" v-if="title !== ''">
      <div class="zuo"></div>
      <div class="title-inner flex-1 text-left">{{ title }}</div> 
      <div>
        <slot name="right"></slot>
      </div>
    </div>
    <div
      :class="title !== '' ? 'item_title_content' : 'item_title_content_def'"
    >
      <slot></slot></div
  ></div>
</template>

<style scoped lang="scss">
$item-title-height: 34px;
$item_title_content-height: calc(100% - 34px);

.item_title {
  height: $item-title-height;
  line-height: $item-title-height;
  width: 100%; 
  text-align: center;
  // background: linear-gradient(to right, transparent, #0f0756, transparent);
  position: relative;
  display: flex;
  align-items: center;
  // justify-content: center;
  
  /* 纯白 */
  color: #FFFFFF;
 background-image: url('@/assets/img/xTitle.png');
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
  }
}

:deep(.dv-border-box-content)  {
    box-sizing: border-box;
    padding: 6px 16px 0px;
  }

.item_title_content {
  height: $item_title_content-height;
}

.item_title_content_def {
  width: 100%;
  height: 100%;
}
</style>
