import type { UserConfig, ConfigEnv } from 'vite';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      ElementPlus()
    ],
    publicDir: "public",
    base: "./",
    server: {
      host: '0.0.0.0',
      port: 8112,
      open: false,
      strictPort: false,
      proxy: {
        // 代理规则示例
        '/api': {
          target: 'https://www.gxynai.cn/api', // 后端服务器地址
          // target: 'http://localhost:8081', // 后端服务器地址
          // target: 'http://dashboard.aistudy.space:8081', // 后端服务器地址

          changeOrigin: true, // 是否改变请求源
          rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径，去掉/api前缀
          ws: true, // 支持websocket代理
          timeout: 10000 // 请求超时时间
        },
      }
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "components": resolve(__dirname, "./src/components"),
        "api": resolve(__dirname, "./src/api"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "./src/assets/css/variable.scss" as *;`,
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  }
})
