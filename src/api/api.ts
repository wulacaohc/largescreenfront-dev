/*
 * @LastEditors: 刘嘉威 daidaibg@163.com
 * @LastEditTime: 2024-03-28 16:52:31
 */
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { StorageEnum, RequestEnum } from "@/enums";
import { getLocalStorage } from "@/utils";

import UtilVar from "../config/UtilVar";
let baseUrl = UtilVar.baseUrl;
const CancelToken = axios.CancelToken;

export { baseUrl };
// axios.defaults.withCredentials = true;// 允许跨域请求携带凭证信息（如 cookies），当前已注释表示跨域时不携带凭证
// 添加请求拦截器
axios.interceptors.request.use(
  function (config: AxiosRequestConfig): any {
      // 初始化 headers（确保不为 undefined）
      config.headers = config.headers || {};
      console.log('进入了拦截器，可以进行拦截操作了');
    // 在发送请求之前做些什么 传token
    let token: any = getLocalStorage(StorageEnum.GB_TOKEN_STORE);
      // const token = getLocalStorage(StorageEnum.GB_TOKEN_STORE);
      console.log('Token 原始值:', token);

      // if (token && typeof token === 'string' && token.trim()) {
      //     config.headers.Authorization = `Bearer ${token.trim()}`;
      // }
      console.log('Token 校验结果:', !!token && typeof token === 'string' && token.trim());

      // if (token && typeof token === 'string' && token.trim()) {
      //     // 仅当 token 有效时设置
          // config.headers.common[RequestEnum.GB_TOKEN_KEY] = token.trim();
      //     // config.headers.Authorization = `Bearer ${token.trim()}`;
      //     config.headers['Authorization'] = 'Bearer ' + token// 让每个请求携带自定义token 请根据实际情况自行修改
          config.headers['Authorization'] = `Bearer ${token}`;
      // }
    // if (token) {
    //   // @ts-ignore
    //   // config.headers.common[RequestEnum.GB_TOKEN_KEY] = token;
    //     // 直接设置到 headers，不需要通过 common
    //     config.headers = config.headers || {};
    //     config.headers['Authorization'] = `Bearer ${token}`;
    // }
    // @ts-ignore
      // 仅当 Content-Type 未设置时，默认赋值（避免覆盖自定义配置）
      if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json;charset=utf-8';
      }

    return config;
  },
  function (error: any) {
    // 对请求错误做些什么
    console.log("请求拦截器出错啦，出错啦");
    return Promise.reject(error);
  }
);

// 添加请求拦截器
// axios.interceptors.request.use(
//     function (config: AxiosRequestConfig): any {
//         // 在发送请求之前做些什么 传token
//         let token: any = getLocalStorage(StorageEnum.GB_TOKEN_STORE);
//         if (token) {
//             // @ts-ignore
//             config.headers.common[RequestEnum.GB_TOKEN_KEY] = token;
//         }
//         // @ts-ignore
//         config.headers["Content-Type"] = "application/json;charset=utf-8";
//
//         return config;
//     },
//     function (error: any) {
//         // 对请求错误做些什么
//         console.log(error);
//         return Promise.reject(error);
//     }
// );

export type Params = { [key: string]: string | number };
export type FileConfig = {
  setCancel?: Function;
  onProgress?: Function;
  [key: string]: any;
};
/**
 * @响应拦截
 */
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log("response", response);
      console.log('我是回答，我是回答');
    if (response.status !== 200) {
      return Promise.reject(response);
    }
    /**
     * @code 登录过期 token验证失败 根据后端调
     */
    if (response.data.code == UtilVar.code) {
      // router.push("/login")
      return Promise.resolve(response);
    }
    return Promise.resolve(response);
  },
  (error: any) => {
    console.log("error", error);
    let err = {
      success: false,
      msg: "未知异常，请联系管理员！",
      code: 400,
    };
    if (JSON.stringify(error).indexOf("Network Error") != -1) {
      err.msg = "网络错误或服务错误！";
    }
    if (error.message == "canceled") {
      err.msg = "取消请求";
      err.code = 488;
    }
    // console.log(err);
    return Promise.reject(err);
  }
);

//判断是否是加密参数，是的话处理
let isEncryptionParam = (params: Params) => {
  return params;
};

/**
 * 统一请求方法
 * @param method 请求方法
 * @param url 请求地址
 * @param params 请求参数
 * @param base 是否使用基地址
 */
const request = async (method: string, url: string, params: Params = {}, base: boolean = true): Promise<any> => {
  try {
    const requestUrl = base ? `${baseUrl}${url}` : url;
    const config: AxiosRequestConfig = {
      method,
      url: requestUrl,
    };

    if (method.toUpperCase() === 'GET') {
      config.params = isEncryptionParam(params);
    } else {
      config.data = isEncryptionParam(params);
    }

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    const err = {
      success: false,
      msg: error.message || '未知异常',
      code: error.code || 400,
    };
    return Promise.reject(err);
  }
};

// 登入
export const POST_FORM = async (url: string, params: Params = {}, base: boolean = true): Promise<any> => {
    const requestUrl = base ? `${baseUrl}${url}` : url;
    const formParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        formParams.append(key, params[key].toString());
    });

    const response = await axios.post(requestUrl, formParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
};

/**
 * @description: get 请求方法
 * @param {string} url 请求地址
 * @param {Params} params 请求参数
 * @param {boolean} base 是否使用基地址，默认true
 * @return {*}
 */
export const GET = async (url: string, params: Params = {}, base: boolean = true): Promise<any> => {
  return request('GET', url, params, base);
};

/**
 * @description: post请求方法
 * @param {string} url 请求地址
 * @param {Params} params 请求参数
 * @param {boolean} base 是否使用基地址，默认true
 * @return {*}
 */
export const POST = async (url: string, params: Params = {}, base: boolean = true): Promise<any> => {
  return request('POST', url, params, base);
};

export const POST_LOGIN = async (url: string, params: Params = {}, base: boolean = true): Promise<any> => {
    const requestUrl = base ? `${baseUrl}${url}` : url;

    // 创建完全独立的axios实例
    const loginAxios = axios.create({
        timeout: 10000,
        baseURL: base ? baseUrl : ''  // 确保基础URL正确
    });

    // 将参数转换为查询字符串格式
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        queryParams.append(key, params[key].toString());
    });

    const fullUrl = `${requestUrl}?${queryParams.toString()}`;

    try {
        const response = await loginAxios.post(fullUrl, {}, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    } catch (error: any) {
        // 保持与现有方法一致的错误处理
        const err = {
            success: false,
            msg: error.message || '未知异常',
            code: error.code || 400,
        };
        return Promise.reject(err);
    }
};




/**
 * @description: 没有基地址 访问根目录下文件
 * @param {string} url 请求地址
 * @param {Params} params 请求参数
 * @return {*}
 */
export const GETNOBASE = async (url: string, params: Params = {}): Promise<any> => {
  return GET(url, params, false);
};

// 定义文件类型提交方法
interface fileconfigs {
  [headers: string]: {
    "Content-Type": string;
  };
}
let configs: fileconfigs = {
  headers: { "Content-Type": "multipart/form-data" },
};
/**
 * @description: @文件类型提交方法
 * @param {string} url
 * @param {Params} params
 * @param {FileConfig} config
 * @return {*}
 */
export const FILEPOST = async (url: string, params: Params, config: FileConfig = {}): Promise<any> => {
  try {
    const data = await axios.post(`${baseUrl}${url}`, params, {
      ...configs,
      cancelToken: new CancelToken(function executor(c: any) {
        config.setCancel && config.setCancel(c);
      }),
      // 上传进度
      onUploadProgress: (e: any) => {
        if (e.total > 0) {
          e.percent = (e.loaded / e.total) * 100;
        }
        config.onProgress && config.onProgress(e);
      },
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * 下载文档流
 * @param {config.responseType} 下载文件流根据后端 配置   arraybuffer || blod
 */
export const FILE = async (config: FileConfig = {}) => {
  try {
    const data = await axios({
      method: config.method || "get",
      url: `${baseUrl}${config.url}`,
      data: config.body || {},
      params: config.param || {},
      responseType: config.responseType || "blod",
      onDownloadProgress: (e: any) => {
        // console.log(e,e.currentTarget)
        // if (e.currentTarget.response.size > 0) {
        //     e.percent = e.loaded / e.currentTarget.response.size * 100;
        // }
        // event.srcElement.getResponseHeader('content-length')
        config.onProgress && config.onProgress(e);
      },
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const PUT = async (url: string, params: Params) => {
  try {
    params = isEncryptionParam(params);
    const data = await axios.put(`${baseUrl}${url}`, params);
    return data.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
export const DELETE = async (url: string, params: Params) => {
  // console.log(params)
  try {
    params = isEncryptionParam(params);
    const data = await axios.delete(`${baseUrl}${url}`, { data: params });
    return data.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// 确保模块被导入时执行拦截器注册
export default axios;

// 验证拦截器是否已注册
console.log('请求拦截器:', axios.interceptors.request);
console.log('默认配置:', axios.defaults);

// switch (error.response?.status) {
//     case 400:
//       error.message = '请求错误(400)';
//       break;
//     case 401:
//       error.message = '未授权(401)';
//       break;
//     case 403:
//       error.message = '拒绝访问(403)';
//       break;
//     case 404:
//       error.message = '请求出错(404)';
//       break;
//     case 408:
//       error.message = '请求超时(408)';
//       break;
//     case 500:
//       error.message = '服务器错误(500)';
//       break;
//     case 501:
//       error.message = '服务未实现(501)';
//       break;
//     case 502:
//       error.message = '网络错误(502)';
//       break;
//     case 503:
//       error.message = '服务不可用(503)';
//       break;
//     case 504:
//       error.message = '网络超时(504)';
//       break;
//     case 505:
//       error.message = 'HTTP版本不受支持(505)';
//       break;
//     default:
//       error.message = `连接出错(${error.response?.status})!`;
//   }
