<script setup lang="ts">
import { serviceArea } from "@/api";
import SeamlessScroll from "@/components/seamless-scroll";
import { computed, onMounted, reactive, watch } from "vue";
import { useSettingStore } from "@/stores";
import { storeToRefs } from "pinia";
import EmptyCom from "@/components/empty-com";
import { ElMessage } from "element-plus";
import { useAreaStore } from "@/stores/area";
const settingStore = useSettingStore();
const { defaultOption, indexConfig } = storeToRefs(settingStore);
const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);
const state = reactive<any>({
  list: [],
  defaultOption: {
    ...defaultOption.value,
    singleHeight: 252,
    limitScrollNum: 3,
    // step:3
  },
  scroll: true,
});

const getData = () => {
  serviceArea({
    limitNum: 20,
    province: selectedCityName.value
  })
    .then((res) => {
      console.log("右下", res);
      if (res.code==200) {
        state.list = res.data.data;
      } else {
        ElMessage({
          message: res.msg,
          type: "warning",
        });
      }
    })
    .catch((err) => {
      ElMessage.error(err);
    });
};

const comName = computed(() => {
  if (indexConfig.value.rightBottomSwiper) {
    return SeamlessScroll;
  } else {
    return EmptyCom;
  }
});
function montionFilter(val: any) {
  // console.log(val);
  return val ? Number(val).toFixed(2) : "--";
}
const handleAddress = (item: any) => {
  return `${item.provinceName}/${item.cityName}/${item.countyName}`;
};
onMounted(() => {
  getData();
});
watch(selectedCityName, getData);
</script>

<template>
  <div class="right_bottom_wrap beautify-scroll-def" :class="{ 'overflow-y-auto': !indexConfig.rightBottomSwiper }">
    <table class="table">
      <tr>
        <td>序号</td>
        <td>地区</td>
        <td>电话</td>
      </tr>
      <tr v-for="(item, i) in state.list" :key="i">
        <td>{{ item.id }}</td>
        <td>{{item.name}}</td>
        <td>{{item.phone}}</td>
      </tr> 
    </table>
  </div>
</template>

<style scoped lang="scss">
.right_bottom_wrap{
  padding: 0 16px;
  .table{
    width: 100%;
    text-align: center;
    font-family: Alibaba PuHuiTi;
    font-size: 16px;
    font-weight: 500;
    line-height: 40px; 
    color: #fff;
  }
}
</style>
