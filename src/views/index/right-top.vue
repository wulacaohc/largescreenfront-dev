<script setup lang="ts">
import { ref, reactive, computed, watch,onMounted  } from "vue";
import CapsuleChart from "@/components/datav/capsule-chart";
import { ranking ,getDeviceType} from "@/api";
import { ElMessage } from "element-plus";
import { useAreaStore } from "@/stores/area";

const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);

const config = ref({
  showValue: true,
  unit: "次",
});
const data = ref([]);
const max= ref(0);
const getData = () => {
  getDeviceType({
    province: selectedCityName.value
  })
    .then((res) => {
      console.log("右中--报警排名", res);
      if (res.code==200) {
        data.value = res.data.result.map((item) => {
          return {
            name: item.equipmentType,
            value: item.total,
          };
        });
       max.value = Math.max(...res.data.result.map(item => item.total));

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
onMounted(() => {
  getData();
});
watch(selectedCityName, getData);
</script>

<template>
  <div class="right_bottom">
    <!-- <CapsuleChart :config="config" style="width: 100%; height: 212px" :data="data" /> -->
     <div class="row-item" v-for="(item, index) in data" :key="index">
        <div class="ranking-info">
          <div class="rank">{{item.name}}</div>
          <div class="ranking-value">{{item.value}}</div>
        </div>
        <div class="ranking-column">
           <div class="inside-column" :style="{width: (item.value/max)*100 + '%'}"></div>
           <img src="@/assets/img/circle.png" class="circle" :style="{left: (item.value/max)*100 + '%'}"></img>
        </div>
     </div> 
  </div>
</template>

<style scoped lang="scss">
.right_bottom {
  box-sizing: border-box;
  padding: 0 16px;
  height: 100%;
  overflow: hidden;
}
.row-item { 
  width: 100%;
  padding-top: 15px;
  .ranking-info{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #fff;
  }
  .ranking-column{
    width: 100%;
    height: 8px;
    background: rgba(112, 112, 112, 0.23);
    position: relative;
    margin-top: 10px;
    .inside-column{
      background: linear-gradient(270deg, #1B7EF2 0%, rgba(27, 126, 242, 0) 99%);
      width: 100%;
      height: 8px;
    }
    .circle{ 
      width: 16px;
      height: 16px; 
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
      left: 0;
      margin-left: -9px;
    }
  }
}
</style>
