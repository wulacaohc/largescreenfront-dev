<script lang="ts" setup>
</script>
<template>
  <div>
    <div class="search-box">
      <div>
        <img src="@/assets/img/sj-icon.png" alt="" class="sj-icon">
      </div>
      <div class="search-box-input">
         <slot name="content"></slot>
      </div>
      <div><slot name="right-icon"></slot></div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
   .search-box{
      height: 40px;
      width: 100%;
      background: rgba(27, 126, 242, 0.14);
      border-left: 4px solid #1B7EF2;
      display: flex;
      padding-left: 10px;
      padding-right: 30px;
      align-items: center;
      .sj-icon{
        width: 6px;
        height: 12px;
        display: block;
        margin-right: 10px;
      }
      .search-box-input{
        flex: 1;
      }
   }
</style>