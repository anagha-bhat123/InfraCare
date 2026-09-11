import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build to dist on Vercel or backend static directory locally
  build: {
    outDir: process.env.VERCEL ? "dist" : path.resolve(__dirname, "../backend/static"),
    emptyOutDir: true,
  },

  // In dev mode, proxy /api calls to the backend to avoid CORS issues
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
