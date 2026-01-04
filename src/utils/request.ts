import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tansParams, blobValidate } from '@/utils/gf';
import { HttpStatus } from '@/utils/RespEnum';
import { errorCode } from '@/utils/errorCode';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import router from '@/router'; // 你的路由实例
import { ElMessage } from 'element-plus';
import { getLocalStorage } from '@/utils';
import { StorageEnum } from '@/enums';
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
    // console.log('进入了拦截器，可以进行拦截操作了');

    // 对应国际化资源文件后缀
    const isToken = config.headers?.isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = config.headers?.repeatSubmit === false;

    // 从localStorage获取token并添加到请求头
    if (!isToken) {
      const token = getLocalStorage(StorageEnum.GB_TOKEN_STORE);
      if (token && typeof token === 'string' && token.trim()) {
        config.headers['Authorization'] = `Bearer ${token.trim()}`;
        // console.log('Token已添加到请求头');
      }
    }


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
        console.log('进入了request响应器（仅2xx状态码执行）');
        console.log('完整响应对象:', res);

        // 安全访问 res.data
        if (!res || !res.data) {
            console.log('响应数据为空');
            return Promise.reject('响应数据为空');
        }

        // 使用可选链获取code
        const code = res.data?.code || HttpStatus.SUCCESS;
        console.log('响应结果:', res);

        // 获取错误信息
        const msg = errorCode[code] || res.data.message || errorCode['default'];

        // 二进制数据则直接返回
        if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
            return res.data;
        }

        // 这里处理的是「业务码」非HTTP状态码（比如200但业务码401）
        if (code === 401 || code === "401") {
            console.log('业务码401，要跳转了');
            if (!isRelogin.show) {
                router.push('/login');
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
        console.log('进入响应错误拦截器（4xx/5xx状态码执行）');
        let { message } = error;

        // 解析Axios错误对象，获取响应数据
        const response = error.response;
        // 1. 处理HTTP 401状态码（核心修复点）
        if (response && response.status === 401) {
            console.log('HTTP状态码401，要跳转登录页了');
            // 解析后端返回的错误信息（{"code":401,"message":"Token 不存在或格式错误"}）
            const errMsg = '登录凭证已过期，请重新登录';
            if (!isRelogin.show) {
                isRelogin.show = true; // 防止重复跳转
                ElMessage.error(errMsg);
                // 跳转登录页，可附加来源页面地址以便登录后返回
                router.push({
                    path: '/login',
                    query: { redirect: router.currentRoute.fullPath },
                }).finally(() => {
                    isRelogin.show = false; // 重置标志
                });
            }
            return Promise.reject(new Error(errMsg));
        }

        // 2. 处理其他网络错误
        if (message === 'Network Error') {
            message = '后端接口连接异常';
        } else if (message.includes('timeout')) {
            message = '系统接口请求超时';
        } else if (message.includes('Request failed with status code')) {
            const statusCode = message.substr(message.length - 3);
            message = `系统接口${statusCode}异常`;
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
 * 不使用baseURL的GET请求(用于获取本地静态资源)
 */
export const GETNOBASE = async (url: string, params: any = {}) => {
  return service.get(url, {
    baseURL: '',
    params
  });
};


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
