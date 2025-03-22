import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    outDir: "dist", // Specify the output directory
    assetsDir: 'assets',
    copyPublicDir: true
  },
  server: {
    host: "localhost",
    port: 2222,
  },
});
