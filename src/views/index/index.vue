<script setup lang="ts">
import ItemWrap from "@/components/item-wrap";
import LeftTop from "./left-top.vue";
import LeftCenter from "./left-center.vue";
import LeftCenter2 from "./left-center2.vue";
import LeftBottom from "./left-bottom.vue";
import CenterMap from "./center-map.vue";
import CenterBottom from "./center-bottom.vue";
import RightTop from "./right-top.vue";
import RightCenter from "./right-center.vue";
import RightBottom from "./right-bottom.vue";
import CenterTop from "./center-top.vue";
import CenterSearch from "./center-search.vue";

import { onMounted } from "vue";
import { searchEquipment } from "@/api";
import { ElMessage } from "element-plus";

onMounted(()=>{
  
})
  
</script>

<template>
  <div class="index-box">
    <div class="contetn_left">
      <!-- <div class="pagetab">
        <div class="item">实时监测</div>
        <div class="item">统计分析</div>
      </div> -->
      <ItemWrap class="contetn_left-top contetn_lr-item" title="设备状态统计">
        <div class="contnetBox">
             <LeftTop />
        </div>
       
      </ItemWrap>
      <ItemWrap class="contetn_left-center contetn_lr-item" title="设备在线趋势图（近30天）">
        <div class="contnetBox ">
          <LeftCenter />
        </div>
      </ItemWrap>
      <ItemWrap
        class="contetn_left-bottom contetn_lr-item"
        title="设备故障趋势图（近30天）"
        style="padding: 0 10px 16px 10px"
      >
        <div class="contnetBox">
          <LeftBottom />
        </div>
      </ItemWrap>
      <ItemWrap class="contetn_left-center contetn_lr-item" title="年度故障累计">
        <div class="contnetBox">
          <LeftCenter2 />
        </div>
      </ItemWrap>
    </div>
    <div class="contetn_center">
      <CenterTop class="contetn_center_top"/>
      <CenterSearch class="contetn_center_search"/>
      <CenterMap class="contetn_center_map" />
      <div class="contetn_center-bottom" title="设备汇总（近7天）">
        <div class="contnetBox contnetBox1">
          <CenterBottom />
        </div>
      </div>
    </div>
    <div class="contetn_right">
      <ItemWrap class="contetn_left-bottom contetn_lr-top-item" title="设备类型">
        <div class="contnetBox">
          <RightTop />
        </div>
      </ItemWrap>
      <ItemWrap
        class="contetn_left-bottom contetn_lr-center-item"
        title="设备列表"
        style="padding: 0 10px 16px 10px"
      >
        <div class="contnetBox">
          <RightCenter />
        </div>
      </ItemWrap>
      <ItemWrap class="contetn_left-bottom contetn_lr-item" title="服务地区 ">
        <div class="contnetBox">

          <RightBottom />
        </div>
      </ItemWrap>
    </div>
  </div>
</template>

<style scoped lang="scss">
.index-box {
  width: 100%;
  display: flex;
  min-height: calc(100% - 76px - 71px);
  justify-content: space-between;
}
//左边 右边 结构一样
.contetn_left,
.contetn_right {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  position: relative;
  width: 450px;
  box-sizing: border-box;
  flex-shrink: 0;
}
.contetn_center {
  flex: 1;
  margin: 0 54px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  .contetn_center-bottom {
    height: 224px;
  }
}

.contetn_lr-item {
  height: 212px;
}
.contetn_lr-top-item{
  height: 254px;
}
.contetn_lr-center-item{
  height: 420px;
}
.contetn_center_top{
  margin-top: 10px;
}
.contetn_center_search{
  margin-top: 20px;
}
.contnetBox{
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0, 140, 255, 0.2) 0%, rgba(36, 186, 255, 0) 80%);
  backdrop-filter: blur(16px);
  margin-top: 10px;
}
.contnetBox1{
  background: transparent;
  margin-top: 0;
}
</style>
