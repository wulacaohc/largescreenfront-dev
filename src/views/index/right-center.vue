<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import CapsuleChart from "@/components/datav/capsule-chart";
import { getEquipmentDetail } from "@/api";
import { ElMessage } from "element-plus";
import { useAreaStore } from "@/stores/area";
import {useRouter} from 'vue-router'
const router=useRouter()
const areaStore = useAreaStore();
const selectedCityName = computed(() => areaStore.selectedCityName);

let timer: any = null;
const config = ref({
  showValue: true,
  unit: "次",
});
const data = ref([]);
const getData = () => {
  getEquipmentDetail({
    province: selectedCityName.value
  })
    .then((res) => {
      console.log("右中--报警排名", res);
      if (res.code==200) {
        data.value = res.data.info.equipmentList;
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
  timer = setInterval(() => {
    getData();
  }, 5000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
const statusList = ref([
  {label:'在线',value:0,color:'#33FEFE'},
  {label:'离线',value:1,color:'#FF4D4F'},
  {label:'预警',value:2,color:'#9F9F9F'},
  {label:'故障',value:3,color:'#FFAA00'},
]);
//  '0=正常1=停机2=预警3=故障',
const getText = (status:any) => {
  const item = statusList.value.find((item) => item.value == status);
  return item;
}
watch(selectedCityName, getData);
const handleClick = (item:any) => {
  console.log(item)
  router.push({
    path: "/detail",
    query: {
      keyword: item.device_id,
    },
  });
}
</script>

<template>
  <div class="right_center">
      <!-- <table class="table">
         <tr>
           <td>序号</td>
           <td>设备ID</td>
           <td>SIM卡号</td>
           <td>序列号</td>
           <td>使用时长（h）</td>
           <td>状态</td>
         </tr>
         <tr v-for="(item,i) in data" :key="i" >
           <td>
             <div :class="['sort',`sort-${i}`]"><div class="num">{{item.id}}</div></div>
           </td>
           <td>{{item.device_id}}</td>
           <td>{{item.sim}}</td>
           <td>{{item.serial_number}}</td>
           <td>{{item.workTime?item.workTime:0}}</td>
           <td>
            <div :class="['status',`status${item.status}`]" >
              {{ getText(item.status)?.label }}
            </div>
          </td>
         </tr>
      </table> -->

      <el-table
                    ref="table1"
                    :data="data"
                    row-key="id"
                    style="width: 100%"
                    height="400px"
                    @row-click	="handleClick"
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
                   <el-table-column
                      prop="id"
                      label="序号"
                      width="90"
                    >
                      <template #default="scope">
                        <div :class="['sort',`sort-${scope.$index}`,'text-center'] "><div class="num">{{scope.$index + 1}}</div></div>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="device_name"
                      label="设备名称"
      show-overflow-tooltip
                    />
                    <!-- <el-table-column
                      prop="sim"
                      label="SIM卡号"
                      v-if="selectedCityName.length>0"
                    /> -->
                    <!-- <el-table-column
                      prop="serial_number"
                      label="序列号"
                      v-if="selectedCityName.length>0"
                    /> -->
                    <el-table-column
                      prop="workTime"
                      label="使用时长(h)"
                      width="70"

                    >
                      <template #default="scope">
                        <div>{{ scope.row.this_work_time ? scope.row.this_work_time : 0 }}</div>
                      </template>
                  </el-table-column>
                    <el-table-column
                      prop="status"
                      label="状态"
                      width="90"
                    >
                      <template #default="scope">
                        <div :class="['status',`status${scope.row.status}`]" >
                          {{ getText(scope.row.status)?.label }}
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
  </div>
</template>

<style scoped lang="scss">
.right_center {
  padding: 0 16px;
  .table {
    width: 100%;
    text-align: center;
    font-family: Alibaba PuHuiTi;
    font-size: 16px;
    font-weight: 500;
    line-height: 40px;
    color: #fff;
  }
  .status{
    color: #33FEFE;
    position: relative;
    padding-left: 20px;
    &::before{
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #33FEFE;
    }
    &.status1{
      color: #33FEFE;
      &::before{
        background-color: #33FEFE;
      }
    }
    &.status2{
      color: #FF4D4F;
      &::before{
        background-color: #FF4D4F;
      }
    }
    &.status3{
      color: #FFAA00;
      &::before{
        background-color: #FFAA00;
      }
    }
    &.status4{
      color: #9F9F9F;
      &::before{
        background-color: #9F9F9F;
      }
    }
  }
  .sort{
      width: 30px;
      height: 22px;
      line-height: 22px;
      position: relative;
      .num{
        position: relative;
        z-index: 1;
      }
      &::after{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 22px;
        height: 22px;
        transform: skew(-8deg);
      }
      &::before{
        content: '';
        position: absolute;
        top: 3px;
        left:3px;
        width: 22px;
        height: 22px;
        transform: skew(-8deg);
        opacity: 0.3;
      }
      &.sort-0{
        &::after{
          background-color: #1676F6;
        }
        &::before{
          background-color: #1676F6;
        }

      }
      &.sort-1{
        &::after{
          background-color: #08C2DF;
        }
        &::before{
          background-color: #08C2DF;
        }
      }
      &.sort-2{
        &::after{
          background-color: #15C549;
        }
        &::before{
          background-color: #15C549;
        }
      }

  }
}
</style>
