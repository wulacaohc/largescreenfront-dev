import {GET,POST,FILE,FILEPOST,PUT,GETNOBASE} from "../api";
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
const indexUrl=  { 
    "centerTop":"/statistics/getTop", //中上
}
export function getStatisticsTop() {
  return request({
    url: '/statistics/getTop',
    method: 'get'
  });
}
export default indexUrl

/**左上--设备内总览 */
// export const getStatisticsTop=(param:any={})=>{
//     return GET(indexUrl.centerTop,param)
// }
// /equipment/statistics
// 设备状态统计（总计）
export const equipmentStatistics=(param:any={})=>{
    return request({
        url: "/equipment/statistics",
        method: 'get',
        params:param
    })
} 
// 设备汇总
export const summaryStatistics=(param:any={})=>{
    return request({
        url: "/statistics/Summary",
        method: 'get',
        params:param
    })
} 
// 服务区域
export const serviceArea=(param:any={})=>{
     return request({
        url: "/statistics/serviceArea",
        method: 'get',
        params:param
    }) 
}
// ID、SIM卡号、序列号搜索设备

export const searchEquipment=(param:any={})=>{
     return request({
        url: "/equipment/search",
        method: 'get',
        params:param
    }) 
}
// 设备趋势
export const equipmentTrend=(param:any={})=>{
    return request({
        url: "/statistics/trend",
        method: 'get',
        params:param
    }) 
}
// 设备类型
export const getDeviceType=(param:any={})=>{
    return request({
        url: "/equipment/getDeviceType",
        method: 'get',
        params:param
    }) 
}
// 设备列表
export const getEquipmentDetail=(param:any={})=>{
    return request({
        url: "/statistics/detail",
        method: 'get',
        params:param
    }) 
}
// 搜索设备列表
//  /equipment/getSensor
// 传感器列表
export const getSensorList=(param:any={})=>{
    return request({
        url: "/equipment/getGroupSensor",
        method: 'get',
        params:param
    }) 
}

// 年度数据统计
export const getAnnualStatistics=(param:any={})=>{
    return request({
        url: "/statistics/annualFailure",
        method: 'get',
        params:param
    }) 
}

// 地图数据查看
export const getMapData=(param:any={})=>{
    return request({
        url: "/equipment/countByCity",
        method: 'get',
        params:param
    }) 
}
// equipment/uploadDbc
// 上传DBC文件
export const uploadDbc=(param:any={})=>{
    return request({
        url: "/equipment/uploadDbc",
        method: 'post',
        params:param
    }) 
}

// /equipment/selectSensor
// 查询传感器数据
export const selectSensor=(param:any={})=>{
    return request({
        url: "/equipment/selectSensor",
        method: 'get',
        params:param
    }) 
}

// equipment/getNotDBC?deviceId=
// 查询未绑定DBC的设备
export const getNotDBC=(param:any={})=>{
    return request({
        url: "/equipment/getNotDBC",
        method: 'get',
        params:param
    }) 
}
