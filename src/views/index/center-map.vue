<script setup lang="ts">
import { ref, reactive, nextTick,onMounted } from "vue";
import { centerMap, GETNOBASE,getMapData } from "@/api";
import { registerMap, getMap } from "echarts/core";
import { optionHandle, regionCodes } from "./center.map";
import BorderBox13 from "@/components/datav/border-box-13";
import { ElMessage } from "element-plus";
import { useAreaStore } from "@/stores/area";

import type { MapdataType } from "./center.map";

const areaStore = useAreaStore();
const option = ref({});
const code = ref(areaStore.selectedRegion); // 使用 store 中的区域状态

withDefaults(
  defineProps<{
    // 结束数值
    title: number | string;
  }>(),
  {
    title: "地图",
  }
);

const dataSetHandle = async (regionCode: string, list: object[]) => {
  console.log(list, "list")
  const geojson: any = await getGeojson(regionCode);
  let cityCenter: any = {};
  let mapData: MapdataType[] = [];
  //获取当前地图每块行政区中心点
  geojson.features.forEach((element: any) => {
    cityCenter[element.properties.name] = element.properties.centroid || element.properties.center;
  });
  //当前中心点如果有此条数据中心点则赋值x，y当然这个x,y也可以后端返回进行大点，前端省去多行代码
  list.forEach((item: any) => {
    if (cityCenter[item.name]) {
      mapData.push({
        name: item.name,
        value: cityCenter[item.name].concat(item.value),
      });
    }
  });
  await nextTick();

  option.value = optionHandle(regionCode, list, mapData);
};

const getData = async (regionCode: string,name: string) => {

  areaStore.setSelectedRegion(regionCode,name);
  code.value = regionCode;
  getMapData({ province: name }).then((res) => {
      console.log("中上--设备分布", res);
      if (res.code==200) {

        if (res.data.equipmentInfo.length> 0) {
          let data=res.data.equipmentInfo.map(v =>{
            return{
              ...v,
              name:v.province?v.province:v.name,
            }
          });
          dataSetHandle(regionCode, data);
          return
        }else{

        dataSetHandle(regionCode, []);
        }
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch((err) => {
      ElMessage.error(err);
    });
};
const getGeojson = (regionCode: string) => {
  return new Promise<boolean>(async (resolve) => {
    let mapjson = getMap(regionCode);
    if (mapjson) {
      mapjson = mapjson.geoJSON;
      resolve(mapjson);
    } else {
      mapjson = await GETNOBASE(`./map-geojson/${regionCode}.json`).then((data) => data);
      code.value = regionCode;
      registerMap(regionCode, {
        geoJSON: mapjson as any,
        specialAreas: {},
      });
      resolve(mapjson);
    }
  });
};
getData(code.value,'');
const dataList=[
  { name: '青海省', value: 513,value1:100,value2:100 },
  { name: '吉林省', value: 277,value1:100,value2:100 },
  { name: '安徽省', value: 518,value1:100,value2:100 },
  { name: '海南省', value: 25,value1:100,value2:100 },
  { name: '山西省', value: 959,value1:100,value2:100 },
  { name: '天津', value: 976,value1:100,value2:100 },
  { name: '浙江省', value: 775,value1:100,value2:100 },
  { name: '内蒙古自治区', value: 1089,value1:100,value2:100 },
  { name: '云南省', value: 161,value1:100,value2:100 }
]
onMounted(()=>{
  console.log(areaStore.selectedRegion,'areaStore.selectedRegion');
  // getData(areaStore.selectedRegion);
  // dataSetHandle(areaStore.selectedRegion, dataList);
})
const mapClick = (params: any) => {
  let xzqData = regionCodes[params.name];
  if (xzqData) {
    getData(xzqData.adcode,params.name);

  } else {
    // window["$message"].warning("暂无下级地市");
  }
};
</script>

<template>
  <div class="centermap">
    <div class="mapwrap">
        <div class="quanguo" @click="getData('china','')" v-if="code !== 'china'">中国</div>
        <v-chart
          class="chart"
          :option="option"
          ref="centerMapRef"
          @click="mapClick"
          v-if="JSON.stringify(option) != '{}'"
        />
    </div>
  </div>
</template>

<style scoped lang="scss">
.centermap {

  .maptitle {
    height: 60px;
    display: flex;
    justify-content: center;
    padding-top: 10px;
    box-sizing: border-box;

    .titletext {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 6px;
      background: linear-gradient(92deg, #0072ff 0%, #00eaff 48.8525390625%, #01aaff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 10px;
    }

    .zuo,
    .you {
      background-size: 100% 100%;
      width: 29px;
      height: 20px;
      margin-top: 8px;
    }

    .zuo {
      background: url("@/assets/img/xiezuo.png") no-repeat;
    }

    .you {
      background: url("@/assets/img/xieyou.png") no-repeat;
    }
  }

  .mapwrap {
    height: 580px;
    width: 100%;
    // padding: 0 0 10px 0;
    box-sizing: border-box;
    position: relative;

    .quanguo {
      position: absolute;
      right: 20px;
      top: 6px;
      width: 80px;
      height: 28px;
      border: 1px solid #00eded;
      border-radius: 10px;
      color: #00f7f6;
      text-align: center;
      line-height: 26px;
      letter-spacing: 6px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 237, 237, 0.5), 0 0 6px rgba(0, 237, 237, 0.4);
      z-index: 10;
    }
  }
}
</style>
