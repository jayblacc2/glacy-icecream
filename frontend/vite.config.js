import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 4000,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
