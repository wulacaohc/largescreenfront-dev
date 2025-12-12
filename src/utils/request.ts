import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tansParams, blobValidate } from '@/utils/gf';
import { HttpStatus } from '@/utils/RespEnum';
import { errorCode } from '@/utils/errorCode';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';

import { ElMessage } from 'element-plus';
const encryptHeader = 'encrypt-key';
let downloadLoadingInstance: LoadingInstance;
// 是否显示重新登录
export const isRelogin = { show: false };
export const globalHeaders = () => {

};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 允许 FormData 自动设置 Content-Type
axios.defaults.headers['Content-Type'] = false;
axios.defaults.transformRequest = [(data) => data];
// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 60*60*1000
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 对应国际化资源文件后缀

    const isToken = config.headers?.isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = config.headers?.repeatSubmit === false;


    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime()
      };

    }

    // FormData数据去请求头Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {

    // 未设置状态码则默认成功状态
    const code = res.data.code || HttpStatus.SUCCESS;
    // 获取错误信息
    const msg = errorCode[code] || res.data.message || errorCode['default'];
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      // prettier-ignore
      if (!isRelogin.show) {

      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
    } else if (code === HttpStatus.SERVER_ERROR) {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === HttpStatus.WARN) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(new Error(msg));
    } else if (code !== HttpStatus.SUCCESS) {
      ElNotification.error({ title: msg });
      return Promise.reject('error');
    } else {
      return Promise.resolve(res.data);
    }
  },
  (error: any) => {
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

// 上传方法
/**
 * 文件上传方法
 * @param url - 上传地址
 * @param file - 文件对象
 * @param params - 额外参数
 * @returns Promise
 */
export function upload(url: string, file: File, params: Record<string, any> = {}) {
  const formData = new FormData();
  formData.append('file', file);

  Object.keys(params).forEach(key => {
    formData.append(key, params[key]);
  });

  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 导出 axios 实例
export default service;

/**
 * 文件下载方法
 * @param url - 下载地址
 * @param params - 请求参数
 * @param fileName - 文件名，可选
 * @returns Promise
 */
export function download(url: string, params: Record<string, any> = {}, fileName?: string, cb: any) {
  return service.get(url, {
    params,
    responseType: 'blob'
  }).then(async (data) => {
    const isLogin = await blobValidate(data);
    if (isLogin) {
      const blob = new Blob([data]);

        cb && cb()
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        window.navigator.msSaveBlob(blob, fileName);
      } else {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'download';
        link.click();
        window.URL.revokeObjectURL(blobUrl);
      }
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      ElMessage.error(rspObj.message);
    }
  }).catch((err) => {
    throw err;
  });
}
