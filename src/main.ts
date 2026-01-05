import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/assets/css/main.scss'
import '@/assets/css/tailwind.css'

import {registerEcharts} from "@/plugins/echarts"
//不使用mock 请注释掉
// import { mockXHR } from "@/mock/index";
// mockXHR()
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/theme-chalk/dark/css-vars.css'


// === 在这里添加用户活动监听代码 ===
const userActionEvents = ['click', 'keydown', 'scroll', 'touchstart'];
let lastActiveTime = Date.now();

// 初始化
const storedLastActive = localStorage.getItem('lastActiveTime');
if (storedLastActive) {
  lastActiveTime = Number(storedLastActive);
}

// 监听用户操作
userActionEvents.forEach(event => {
  window.addEventListener(event, () => {
    lastActiveTime = Date.now();
    localStorage.setItem('lastActiveTime', lastActiveTime.toString());
  }, { passive: true });
});

// 可选：全局挂载，方便组件访问
(window as any).$lastActiveTime= { get: () => lastActiveTime };

// === 结束 ===
const app = createApp(App)
registerEcharts(app)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')

