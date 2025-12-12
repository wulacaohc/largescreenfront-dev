<script lang="ts" setup>
import { ref, reactive, nextTick } from "vue";
import {useRouter} from 'vue-router'
import { searchEquipment } from '@/api';
import { ElMessage } from 'element-plus';
const router=useRouter()
const keyword=ref('')
const handleSearch=()=>{
  console.log(keyword.value);
  // 处理搜索逻辑
  if (!keyword.value) {
    ElMessage.error('请输入设备ID号/SIM卡号/产品序列号');
    return;
  }
  searchEquipment({
    search: keyword.value,
  }).then(res => {
    if (res.code === 200&&res.data.equipmentInfo.length>0) {
      router.push({
        path: '/detail',
        query: {
          keyword: keyword.value,
        }
      })
    }else{
      ElMessage.error('没有该设备')
    }
  }).catch(err => {
    ElMessage.error(err.message)
  })
}
</script>
<template>
  <div class="center-search"> 
     <search-box>
        <template #content>
          <input v-model="keyword" style="background: 'transparent';" @keyup.enter="handleSearch"  class="elInput" placeholder="请输入设备ID号/SIM卡号/产品序列号" /> 
        </template>
        <template #right-icon>
          <img src="@/assets/img/search-icon.png" alt="" class="search-icon" @click="handleSearch">
        </template>
     </search-box>
  </div>
</template>
<style  lang="scss" scoped>
.center-search{
     
      .search-icon{
        width: 24px;
        height: 24px;
        display: block;
        cursor: pointer;
      }
      .elInput{
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: #fff;
        font-size: 14px;
      }
}

</style> 