import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { imagetools } from "vite-imagetools";
import sitemap from "vite-plugin-sitemap";
import path from "node:path";
import { readFileSync } from "node:fs";
import { offlineManifest } from "./build/offline-manifest";

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
  const siteUrl = (env.VITE_SITE_URL || "https://rabotka.work").replace(/\/+$/, "");

  return {
    server: {
      host: env.VITE_HOST,
      port: Number.parseInt(env.VITE_PORT),
      hmr: { overlay: false },
      proxy: {
        // The public job pages and their sitemap: plain HTML rendered by the
        // API (job-pages.controller.ts), readable by search engines and link
        // previews. The header names this site so their links point here.
        "^/emplois(/|$|\\?)": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: (p) => `/api/v1/public${p}`,
          headers: { "X-Rabotka-Site": siteUrl },
        },
        "/sitemap-emplois.xml": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: () => "/api/v1/public/emplois/sitemap.xml",
          headers: { "X-Rabotka-Site": siteUrl },
        },
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
        // The public job pages and their sitemap: plain HTML rendered by the
        // API (job-pages.controller.ts), readable by search engines and link
        // previews. The header names this site so their links point here.
        "^/emplois(/|$|\\?)": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: (p) => `/api/v1/public${p}`,
          headers: { "X-Rabotka-Site": siteUrl },
        },
        "/sitemap-emplois.xml": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: () => "/api/v1/public/emplois/sitemap.xml",
          headers: { "X-Rabotka-Site": siteUrl },
        },
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
      // The file list the service worker stores, so the app opens offline.
      offlineManifest({ disabled: env.VITE_OFFLINE_DISABLED === "true" }),
      sitemap({
        hostname: siteUrl,
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
