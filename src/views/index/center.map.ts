

//mapData数据结构
export interface MapdataType {
    name: string;
    value: [number, number, number]; //x,y,value  第一个x 第二个y  第三个value
}
const getImageUrl = (name) => {
    return new URL(`../../assets/img/${name}`, import.meta.url).href
}
console.log(getImageUrl("textBg.png"))
export const optionHandle = (regionCode: string,
    list: object[],
    mapData: MapdataType[]) => {
    let top = 45;
    let zoom = ["china"].includes(regionCode) ? 1.05 : 1;
    return {
        backgroundColor: "rgba(0,0,0,0)",
        tooltip: {
            show: true,
            formatter: function (params: any) {
                if (params && params.data) {
                    var str = `<div style = "background:url( ${getImageUrl("textBg.png")}) no-repeat center center;background-size:100% 100%;padding:24px;width:263px;box-sizing:border-box">
								<div style = "fonts-size:18px;font-weight:600;color:#29F1FA">${params.name}</div>
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 设备总数：${params.data.totalCount}</div>
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 在线数：${params.data.onlineCount}</div> 
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 故障数：${params.data.failureCount}</div>
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 运行数：${params.data.runCount}</div>
								</div>`;
                    // parms.marker
                    return str;
                } else {
                    var str = `<div style = "background:url( ${getImageUrl("textBg.png")}) no-repeat center center;background-size:100% 100%;padding:24px;width:263px;box-sizing:border-box">
								<div style = "fonts-size:18px;font-weight:600;color:#29F1FA">${params.name}</div>
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 设备总数：0</div>
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 在线数：0</div> 
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 故障数：0</div>
								<div style="padding-top:10px;fonts-size:14px;color:#fff"> 运行数：0</div>
								</div>`;

                    // parms.marker
                    return str;
                }


            },
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            textStyle: {
                color: "#FFF",
            },
        },
        legend: {
            show: false,
        },
        geo: [{
            map: regionCode,
            roam: true,
            selectedMode: false, //是否允许选中多个区域
            zoom: zoom,
            top: top,
            show: false,
            // aspectScale: 0.78,
            // 倾斜设置
            left: '10%',
            right: '10%',
            bottom: '10%',
            // 视角倾斜
            viewControl: {
                projection: 'perspective', // 透视投影
                distance: 200,
                alpha: 105,
                beta: 100,
                rotateSensitivity: 2
            }
        },],
        series: [
            {
                name: "MAP",
                type: "map",
                map: regionCode,
                // aspectScale: 0.78,
                data: list,
                selectedMode: false, //是否允许选中多个区域
                zoom: zoom,
                geoIndex: 1,
                top: top,

                label: {
                    show: true,
                    color: "#fff",
                    // position: [-10, 0],
                    formatter: function (val: any) {
                        // console.log(val)
                    },
                    rich: {},
                },
                emphasis: {
                    label: {
                        show: true,
                        formatter: [
                            '{b|}'
                        ].join('\n'),
                        rich: {
                            b: {
                                backgroundColor: {
                                    image: getImageUrl("vector .png")
                                },
                                height: 20,
                                widht: 20,
                            },
                        }
                    },
                    itemStyle: {
                        areaColor: 'rgba(52, 134, 231, 0.6)',
                        borderColor: "#77f5f5",
                        borderWidth: '3'
                    },
                },
                itemStyle: {
                    borderColor: "rgba(147, 235, 248, .8)",
                    borderWidth: 1,
                    areaColor: 'rgba(52, 134, 231, 0.03)',
                    shadowColor: "rgba(128, 217, 248, .3)",
                    shadowOffsetX: -2,
                    shadowOffsetY: 2,
                    shadowBlur: 10,
                },
            },
            //             {
            //                 data: mapData,
            //                 type: "effectScatter",
            //                 coordinateSystem: "geo",
            //                 symbolSize: function (val: any) {
            //                     return 4;
            //                     // return val[2] / 50;
            //                 },
            //                 legendHoverLink: true,
            //                 showEffectOn: "render",
            //                 rippleEffect: {
            //                     // period: 4,
            //                     scale: 6,
            //                     color: "rgba(255,255,255, 1)",
            //                     brushType: "fill",
            //                 },
            //                 tooltip: {
            //                     show: true,
            //                     formatter: function (params: any) {
            //                         if (params.data) {
            //                             return params.name + "：" + params.data["value"][2];
            //                         } else {
            //                             return params.name;
            //                         }
            //                     },
            //                     backgroundColor: "rgba(0,0,0,.6)",
            //                     borderColor: "rgba(147, 235, 248, .8)",
            //                     textStyle: {
            //                         color: "#FFF",
            //                     },
            //                 },
            //                 label: {
            //                     formatter: (param: any) => {
            //                         return param.name.slice(0, 2);
            //                     },
            //
            //                     fontSize: 11,
            //                     offset: [0, 2],
            //                     position: "bottom",
            //                     textBorderColor: "#fff",
            //                     textShadowColor: "#000",
            //                     textShadowBlur: 10,
            //                     textBorderWidth: 0,
            //                     color: "#FFF",
            //                     show: true,
            //                 },
            //                 // colorBy: "data",
            //                 itemStyle: {
            //                     color: "rgba(255,255,255,1)",
            //                     borderColor: "rgba(2255,255,255,2)",
            //                     borderWidth: 4,
            //                     shadowColor: "#000",
            //                     shadowBlur: 10,
            //                 },
            //             },
        ],
        //动画效果
        // animationDuration: 1000,
        // animationEasing: 'linear',
        // animationDurationUpdate: 1000
    };
}



export const regionCodes: any = {
    "中国": {
        "adcode": "100000",
        "level": "country",
        "name": "中华人民共和国"
    },
    "新疆维吾尔自治区": {
        "adcode": "650000",
        "level": "province",
        "name": "新疆维吾尔自治区"
    },
    "湖北省": {
        "adcode": "420000",
        "level": "province",
        "name": "湖北省"
    },
    "辽宁省": {
        "adcode": "210000",
        "level": "province",
        "name": "辽宁省"
    },
    "广东省": {
        "adcode": "440000",
        "level": "province",
        "name": "广东省"
    },
    "内蒙古自治区": {
        "adcode": "150000",
        "level": "province",
        "name": "内蒙古自治区"
    },
    "黑龙江省": {
        "adcode": "230000",
        "level": "province",
        "name": "黑龙江省"
    },
    "河南省": {
        "adcode": "410000",
        "level": "province",
        "name": "河南省"
    },
    "山东省": {
        "adcode": "370000",
        "level": "province",
        "name": "山东省"
    },
    "陕西省": {
        "adcode": "610000",
        "level": "province",
        "name": "陕西省"
    },
    "贵州省": {
        "adcode": "520000",
        "level": "province",
        "name": "贵州省"
    },
    "上海市": {
        "adcode": "310000",
        "level": "province",
        "name": "上海市"
    },
    "重庆市": {
        "adcode": "500000",
        "level": "province",
        "name": "重庆市"
    },
    "西藏自治区": {
        "adcode": "540000",
        "level": "province",
        "name": "西藏自治区"
    },
    "安徽省": {
        "adcode": "340000",
        "level": "province",
        "name": "安徽省"
    },
    "福建省": {
        "adcode": "350000",
        "level": "province",
        "name": "福建省"
    },
    "湖南省": {
        "adcode": "430000",
        "level": "province",
        "name": "湖南省"
    },
    "海南省": {
        "adcode": "460000",
        "level": "province",
        "name": "海南省"
    },
    "江苏省": {
        "adcode": "320000",
        "level": "province",
        "name": "江苏省"
    },
    "青海省": {
        "adcode": "630000",
        "level": "province",
        "name": "青海省"
    },
    "广西壮族自治区": {
        "adcode": "450000",
        "level": "province",
        "name": "广西壮族自治区"
    },
    "宁夏回族自治区": {
        "adcode": "640000",
        "level": "province",
        "name": "宁夏回族自治区"
    },
    "浙江省": {
        "adcode": "330000",
        "level": "province",
        "name": "浙江省"
    },
    "河北省": {
        "adcode": "130000",
        "level": "province",
        "name": "河北省"
    },
    "香港特别行政区": {
        "adcode": "810000",
        "level": "province",
        "name": "香港特别行政区"
    },
    "台湾省": {
        "adcode": "710000",
        "level": "province",
        "name": "台湾省"
    },
    "澳门特别行政区": {
        "adcode": "820000",
        "level": "province",
        "name": "澳门特别行政区"
    },
    "甘肃省": {
        "adcode": "620000",
        "level": "province",
        "name": "甘肃省"
    },
    "四川省": {
        "adcode": "510000",
        "level": "province",
        "name": "四川省"
    },
    "天津市": {
        "adcode": "120000",
        "level": "province",
        "name": "天津市"
    },
    "江西省": {
        "adcode": "360000",
        "level": "province",
        "name": "江西省"
    },
    "云南省": {
        "adcode": "530000",
        "level": "province",
        "name": "云南省"
    },
    "山西省": {
        "adcode": "140000",
        "level": "province",
        "name": "山西省"
    },
    "北京市": {
        "adcode": "110000",
        "level": "province",
        "name": "北京市"
    },
    "吉林省": {
        "adcode": "220000",
        "level": "province",
        "name": "吉林省"
    }
}
