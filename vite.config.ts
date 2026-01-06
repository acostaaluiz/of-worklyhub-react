import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@core": path.resolve(__dirname, "src/core"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@modules": path.resolve(__dirname, "src/modules"),
    },
  },
  // Open browser automatically when `npm run dev` starts
  server: {
    open: true,
  },
  // Safe, non-breaking optimizations for faster dev and smaller prod bundles
  optimizeDeps: {
    // pre-bundle common libs used across the app
    include: ["react", "react-dom", "antd", "lucide-react"],
  },
  build: {
    target: "es2019",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // group dependencies into stable chunks for long-term caching
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("antd")) return "vendor_antd";
            if (id.includes("lucide-react")) return "vendor_icons";
            return "vendor";
          }
        },
      },
    },
  },
});
