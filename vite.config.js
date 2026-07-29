

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Loads .env.local for local development
  // .env.local is gitignored — backend IP stays off GitHub
  const env = loadEnv(mode, process.cwd(), "");

  // In dev:  reads VITE_PROXY_TARGET from your .env.local file
  // In prod: this proxy block is never used (only npm run dev uses it)
  const BACKEND = env.VITE_PROXY_TARGET || "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],

    // ── Development proxy ──────────────────────────────────────
    // ONLY active when you run: npm run dev
    // In production build (npm run build) this section is ignored
    server: {
      proxy: {
        "/dashboard": { target: BACKEND, changeOrigin: true },
        "/search":     { target: BACKEND, changeOrigin: true },
        "/cve":        { target: BACKEND, changeOrigin: true },
        "/export":     { target: BACKEND, changeOrigin: true },
        "/api":        { target: BACKEND, changeOrigin: true },
      },
    },

    // ── Production build settings ──────────────────────────────
    build: {
      outDir: "dist",
      sourcemap: false,
      // minify handled automatically by Vite — no esbuild needed
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") ||
                id.includes("node_modules/react-dom") ||
                id.includes("node_modules/react-router")) {
              return "vendor";
            }
            if (id.includes("node_modules/recharts")) {
              return "charts";
            }
          },
        },
      },
    },
  };
});
