import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  // Mirrors vite.config.ts, which vitest does not load — without it any module
  // touching the version constant is a ReferenceError under test.
  define: { __APP_VERSION__: JSON.stringify("test") },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
