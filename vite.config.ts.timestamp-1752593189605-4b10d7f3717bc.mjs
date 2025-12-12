// vite.config.ts
import { defineConfig } from "file:///D:/work/fanyue/largescreenfront/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/work/fanyue/largescreenfront/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
import AutoImport from "file:///D:/work/fanyue/largescreenfront/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/work/fanyue/largescreenfront/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/work/fanyue/largescreenfront/node_modules/unplugin-vue-components/dist/resolvers.js";
import ElementPlus from "file:///D:/work/fanyue/largescreenfront/node_modules/unplugin-element-plus/dist/vite.mjs";
var __vite_injected_original_dirname = "D:\\work\\fanyue\\largescreenfront";
var vite_config_default = defineConfig(({ command, mode }) => {
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      ElementPlus()
    ],
    publicDir: "public",
    base: "./",
    server: {
      host: "0.0.0.0",
      port: 8112,
      open: false,
      strictPort: false,
      proxy: {
        // 代理规则示例
        "/api": {
          target: "http://dashboard.aistudy.space:8081",
          // 后端服务器地址
          changeOrigin: true,
          // 是否改变请求源
          rewrite: (path) => path.replace(/^\/api/, ""),
          // 重写路径，去掉/api前缀
          ws: true,
          // 支持websocket代理 
          timeout: 1e4
          // 请求超时时间
        }
      }
    },
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src"),
        "components": resolve(__vite_injected_original_dirname, "./src/components"),
        "api": resolve(__vite_injected_original_dirname, "./src/api")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "./src/assets/css/variable.scss" as *;`
        }
      }
    },
    build: {
      outDir: "dist"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXGZhbnl1ZVxcXFxsYXJnZXNjcmVlbmZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3b3JrXFxcXGZhbnl1ZVxcXFxsYXJnZXNjcmVlbmZyb250XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93b3JrL2Zhbnl1ZS9sYXJnZXNjcmVlbmZyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnLCBDb25maWdFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xuaW1wb3J0IEVsZW1lbnRQbHVzIGZyb20gJ3VucGx1Z2luLWVsZW1lbnQtcGx1cy92aXRlJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9OiBDb25maWdFbnYpOiBVc2VyQ29uZmlnID0+IHtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICB2dWUoKSxcbiAgICAgIEF1dG9JbXBvcnQoe1xuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxuICAgICAgfSksXG4gICAgICBDb21wb25lbnRzKHtcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcbiAgICAgIH0pLFxuICAgICAgRWxlbWVudFBsdXMoKVxuICAgIF0sXG4gICAgcHVibGljRGlyOiBcInB1YmxpY1wiLFxuICAgIGJhc2U6IFwiLi9cIixcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICAgIHBvcnQ6IDgxMTIsXG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gXHU0RUUzXHU3NDA2XHU4OUM0XHU1MjE5XHU3OTNBXHU0RjhCXG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9kYXNoYm9hcmQuYWlzdHVkeS5zcGFjZTo4MDgxJywgLy8gXHU1NDBFXHU3QUVGXHU2NzBEXHU1MkExXHU1NjY4XHU1NzMwXHU1NzQwXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLCAvLyBcdTY2MkZcdTU0MjZcdTY1MzlcdTUzRDhcdThCRjdcdTZDNDJcdTZFOTBcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLCAvLyBcdTkxQ0RcdTUxOTlcdThERUZcdTVGODRcdUZGMENcdTUzQkJcdTYzODkvYXBpXHU1MjREXHU3RjAwXG4gICAgICAgICAgd3M6IHRydWUsIC8vIFx1NjUyRlx1NjMwMXdlYnNvY2tldFx1NEVFM1x1NzQwNiBcbiAgICAgICAgICB0aW1lb3V0OiAxMDAwMCAvLyBcdThCRjdcdTZDNDJcdThEODVcdTY1RjZcdTY1RjZcdTk1RjRcbiAgICAgICAgfSwgXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICAgIFwiY29tcG9uZW50c1wiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9jb21wb25lbnRzXCIpLFxuICAgICAgICBcImFwaVwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9hcGlcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIHNjc3M6IHtcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEB1c2UgXCIuL3NyYy9hc3NldHMvY3NzL3ZhcmlhYmxlLnNjc3NcIiBhcyAqO2AsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIH0sXG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFDcEMsT0FBTyxpQkFBaUI7QUFQeEIsSUFBTSxtQ0FBbUM7QUFTekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBNkI7QUFDeEUsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLE1BQ0osV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0FBQUEsTUFDbkMsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0FBQUEsTUFDbkMsQ0FBQztBQUFBLE1BQ0QsWUFBWTtBQUFBLElBQ2Q7QUFBQSxJQUNBLFdBQVc7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLE9BQU87QUFBQTtBQUFBLFFBRUwsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBO0FBQUEsVUFDUixjQUFjO0FBQUE7QUFBQSxVQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxVQUFVLEVBQUU7QUFBQTtBQUFBLFVBQzVDLElBQUk7QUFBQTtBQUFBLFVBQ0osU0FBUztBQUFBO0FBQUEsUUFDWDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLFFBQy9CLGNBQWMsUUFBUSxrQ0FBVyxrQkFBa0I7QUFBQSxRQUNuRCxPQUFPLFFBQVEsa0NBQVcsV0FBVztBQUFBLE1BQ3ZDO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
