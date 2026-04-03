import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import sitemap from "vite-plugin-sitemap";
import path from "node:path";

const imageOptimizer = ViteImageOptimizer({
  png: { quality: 90, compressionLevel: 9 },
  jpeg: { quality: 85 },
  jpg: { quality: 85 },
  webp: { quality: 85 },
  avif: { quality: 70 },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: env.VITE_HOST,
      port: Number.parseInt(env.VITE_PORT),
      hmr: { overlay: false },
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
        },
        "/payment-status": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          ws: true,
        },
        "/socket.io": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          ws: true,
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      imageOptimizer,
      sitemap({
        hostname: env.VITE_SITE_URL,
        dynamicRoutes: ["/onboarding", "/login"],
        exclude: ["/profile", "/claims", "/claims/new", "/pay/*"],
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
