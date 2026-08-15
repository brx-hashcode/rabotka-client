import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { imagetools } from "vite-imagetools";
import sitemap from "vite-plugin-sitemap";
import path from "node:path";
import { readFileSync } from "node:fs";

/*
 * The version shown in the profile screen's footer.
 *
 * Read from package.json at build time rather than typed into a constant, so
 * bumping the package is the single act that ships a new number. VITE_APP_VERSION
 * overrides it when CI has something more precise (a tag, a commit).
 */
const pkgVersion = (
  JSON.parse(
    readFileSync(path.resolve(__dirname, "./package.json"), "utf-8"),
  ) as { version?: string }
).version;

const imageOptimizer = ViteImageOptimizer({
  png: { quality: 80, compressionLevel: 9 },
  jpeg: { quality: 75 },
  jpg: { quality: 75 },
  webp: { quality: 78 },
  avif: { quality: 60 },
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
    preview: {
      host: "0.0.0.0",
      port: Number.parseInt(env.VITE_PORT) || 3000,
      allowedHosts: true,
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
      imagetools(),
      imageOptimizer,
      sitemap({
        hostname: env.VITE_SITE_URL || "https://rabotka.work",
        dynamicRoutes: ["/onboarding", "/terms"],
        exclude: [
          "/login",
          "/profile",
          "/claims",
          "/claims/new",
          "/dashboard",
          "/onboarding/avatar",
          "/pay/*",
          "/verify/*",
          "/r/*",
        ],
      }),
    ].filter(Boolean),
    define: {
      __APP_VERSION__: JSON.stringify(
        env.VITE_APP_VERSION || pkgVersion || "0.0.0",
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
