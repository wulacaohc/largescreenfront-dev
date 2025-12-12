<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { searchEquipment } from "@/api";
import { ElMessage } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import SignalStrength from "./SignalStrength.vue";
import dayjs from "dayjs";
const router = useRouter();
const route = useRoute();
const keyword = ref("");
const statusList = ref([
  { label: "正常", value: 0, color: "#33FEFE" },
  { label: "停机", value: 1, color: "#FF4D4F" },
  { label: "预警", value: 2, color: "#9F9F9F" },
  { label: "故障", value: 3, color: "#FFAA00" },
]);
//  '0=正常1=停机2=预警3=故障',
const getText = (status: any) => {
  const item = statusList.value.find((item) => item.value == status);
  return item;
};
onMounted(() => {
  let query = route.query.keyword;
  keyword.value = query;
  getDetail();
});
const detail = ref(null);
const getDetail = () => {
  if (!keyword.value) {
    ElMessage.error('请输入设备ID号/SIM卡号/产品序列号');
    return;
  }
  searchEquipment({
    search: keyword.value,
  }).then((res: any) => {
    if (res.code == 200) {
      console.log(res);
      if (res.data.equipmentInfo.length) {
        detail.value = res.data.equipmentInfo[0];
      }else{
        detail.value= null
      }
    }
  });
};

const handleAnalysis = () => {
  router.push({
    path: "/analysisView",
    query: {
      id: detail.value.device_id,
      name: detail.value.device_name
    },
  });
};

const handleSearch = () => {
  getDetail();
};
const handleReset = () => {
  keyword.value = "";
  // getDetail();
};
</script>
<template>
  <div class="detailBox">
    <div class="flex searchBox">
      <div class="searchTop">
        <search-box>
          <template #content>
            <input
              v-model="keyword"
              style="background: 'transparent'"
              class="elInput"
              placeholder="请输入设备ID号/SIM卡号/产品序列号"
              @keyup.enter="handleSearch"
            />
          </template>
          <template #right-icon>
            <img
              src="@/assets/img/search-icon.png"
              alt=""
              class="search-icon"
              @click="handleSearch"
            />
          </template>
        </search-box>
      </div>
      <div class="flex">
        <div class="btn" @click="handleSearch">搜索</div>
        <div class="btn" @click="handleReset">重置</div>
      </div>
    </div>
    <div class="detailContent">
      <div class="detail_left">
        <div v-if="detail">
          <ItemWrap class="right-content" title="设备基础信息">
            <div class="contentBox">
              <div class="item">
                <div class="item-title">机组状态：</div>
                <div class="item-content">

                  <div :class="['status',`status${detail.status}`]" >
                    {{ getText(detail.status)?.label }}
                  </div>
                </div>
              </div>
              <div class="item">
                <div class="item-title">产品序列号：</div>
                <div class="item-content">{{ detail?.serial_number }}</div>
              </div>
              <div class="item">
                <div class="item-title">程序编号：</div>
                <div class="item-content">{{ detail?.program_number }}</div>
              </div>
              <div class="item">
                <div class="item-title">SIM卡号：</div>
                <div class="item-content">{{ detail?.sim }}</div>
              </div>
              <div class="item">
                <div class="item-title">当前定位：</div>
                <div class="item-content">{{ detail?.province }}-{{ detail?.city }}</div>
              </div>
              <div class="item">
                <div class="item-title">出厂时间</div>
                <div class="item-content">
                  {{ dayjs(detail.leave_factory_time * 1000).format("YYYY-MM-DD") }}
                </div>
              </div>
              <div class="item">
                <div class="item-title">网速状态：</div>
                <div class="item-content flex items-center"><SignalStrength :strength="detail?.internet_status" />{{ detail?.internet_status_text }}</div>
              </div>
              <div class="item">
                <div class="item-title">最近上线时间：</div>
                <div class="item-content">
                  {{ dayjs(detail.recently_time * 1000).format("YYYY-MM-DD HH:mm:ss") }}
                </div>
              </div>
              <div class="item">
                <div class="item-title">设备初上线时间：</div>
                <div class="item-content">
                  {{ dayjs(detail.create_time * 1000).format("YYYY-MM-DD HH:mm:ss") }}
                </div>
              </div>
              <div class="item">
                <div class="item-title">累计工作时间：</div>
                <div class="item-content">{{ detail?.work_time }}</div>
              </div>
              <div class="item">
                <div class="item-title">数据累计容量：</div>
                <div class="item-content">{{ detail?.data_capacity }}</div>
              </div>
              <div class="item">
                <div class="item-title">固件版本号：</div>
                <div class="item-content">{{ detail?.version_number }}</div>
              </div>
              <div class="item">
                <div class="item-title">客户归属：</div>
                <div class="item-content">{{ detail?.belonging }}</div>
              </div>
              <div class="btn" @click="handleAnalysis">数据分析</div>
            </div>
          </ItemWrap>
        </div>
        <div class="empty-content" v-else>
          <img src="@/assets/img/empty.png" alt="" class="empty-img">
          <div>暂无相关数据~</div>
        </div>
      </div>
      <div class="detail_right">
        <div class="contentBox contentBoxright">
          <div  v-if="detail?.images">
            <div class="goodsImg" >
              <img :src="detail?.images" alt=""/>
            </div>
            <div class="circle"></div>
          </div>
          <div class="empty-content" v-else>
          <img src="@/assets/img/empty.png" alt="" class="empty-img">
          <div>暂无图片</div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.detailBox {
  width: 100%;
  display: flex;
  min-height: calc(100% - 76px - 71px);
  // justify-content: space-between;
  // box-sizing: border-box;
  padding-right: 50px;
  padding-left: 50px;
  padding-top: 30px;
  box-sizing: border-box;
  flex-direction: column;
}
.searchTop {
  flex: 1;
}
.detail_left {
  height: 100%;
  width: 840px;
  padding-top: 30px;
  box-sizing: border-box;
}
.detail_right {
  width: 920px;
  height: 100%;
  padding-top: 64px;
  box-sizing: border-box;
}
.detailContent {
  flex: 1;
  display: flex;
  justify-content: space-between;
  // box-sizing: border-box;
}
.searchBox {
  .btn {
    width: 112px;
    height: 40px;
    line-height: 40px;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    background-image: url("@/assets/img/btnBg.png");
    background-size: contain;
    margin-left: 12px;
    cursor: pointer;
  }
}
.search-icon {
  width: 24px;
  height: 24px;
  display: block;
  cursor: pointer;
}
.elInput {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  font-size: 14px;
}
.contentBox {
  margin-top: 10px;
  height: 786px;
  background: linear-gradient(
    180deg,
    rgba(0, 140, 255, 0.16) 0%,
    rgba(36, 186, 255, 0) 100%
  );
  .item {
    line-height: 48px;
    padding-left: 30px;
    color: #fff;
    font-size: 20px;
    font-weight: 500;
    display: flex;
    .item-title {
      width: 300px;
    }
    &:nth-child(odd) {
      background: rgba(0, 140, 255, 0.16);
    }
  }
  .btn {
    width: 320px;
    line-height: 64px;
    text-align: center;
    color: #fff;
    font-size: 24px;
    font-weight: 500;
    background: #1572f6;
    margin: auto;
    margin-top: 74px;
    border-radius: 8px;
    cursor: pointer;
  }
}
.circle {
  box-sizing: border-box;
  border: 5.25px solid #407df7;
  box-shadow: 0px 2.63px 21px 0px #435cff;
  width: 684px;
  height: 97px;
  border-radius: 50%;
}
.contentBoxright {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.goodsImg {
  width: 516px;
  height: 388px;
  margin: 20px auto;
  img {
    width: 100%;
  }
}
  .empty-content{
    height: 786px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  .empty-img{
    width: 80px;
    height: 80px;
    display: block;
    margin-bottom: 10px;
  }
  .text1{
    color: #fff;
  }
  .empty-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
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
</style>
