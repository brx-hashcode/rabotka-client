// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/LENOVO/Documents/projects/rabotka/rabotka-client/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.7_lightningcss@1.30.2/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/LENOVO/Documents/projects/rabotka/rabotka-client/node_modules/.pnpm/@vitejs+plugin-react-swc@3._665ae2409c9b8135d68cd56da701937a/node_modules/@vitejs/plugin-react-swc/index.js";
import tailwindcss from "file:///C:/Users/LENOVO/Documents/projects/rabotka/rabotka-client/node_modules/.pnpm/@tailwindcss+vite@4.1.18_vi_8ef74f22f8f239be17d4baf768ffc294/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "node:path";
var __vite_injected_original_dirname = "C:\\Users\\LENOVO\\Documents\\projects\\rabotka\\rabotka-client";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    server: {
      host: env.VITE_HOST,
      port: Number.parseInt(env.VITE_PORT),
      hmr: { overlay: false },
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true
        }
      }
    },
    plugins: [
      react(),
      tailwindcss()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMRU5PVk9cXFxcRG9jdW1lbnRzXFxcXHByb2plY3RzXFxcXHJhYm90a2FcXFxccmFib3RrYS1jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXExFTk9WT1xcXFxEb2N1bWVudHNcXFxccHJvamVjdHNcXFxccmFib3RrYVxcXFxyYWJvdGthLWNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTEVOT1ZPL0RvY3VtZW50cy9wcm9qZWN0cy9yYWJvdGthL3JhYm90a2EtY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiBlbnYuVklURV9IT1NULFxyXG4gICAgICBwb3J0OiBOdW1iZXIucGFyc2VJbnQoZW52LlZJVEVfUE9SVCksXHJcbiAgICAgIGhtcjogeyBvdmVybGF5OiBmYWxzZSB9LFxyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAwXCIsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICBdLmZpbHRlcihCb29sZWFuKSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUEyVyxTQUFTLGNBQWMsZUFBZTtBQUNqWixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFFdkMsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTSxJQUFJO0FBQUEsTUFDVixNQUFNLE9BQU8sU0FBUyxJQUFJLFNBQVM7QUFBQSxNQUNuQyxLQUFLLEVBQUUsU0FBUyxNQUFNO0FBQUEsTUFDdEIsT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxJQUNkLEVBQUUsT0FBTyxPQUFPO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
