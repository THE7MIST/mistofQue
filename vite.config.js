import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { env } from "node:process";

const dataVersion = env.VITE_DATA_VERSION || String(Date.now());

export default defineConfig({
  plugins: [react()],
  base: env.VITE_BASE_PATH || "/",
  define: {
    __DATA_VERSION__: JSON.stringify(dataVersion)
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});
