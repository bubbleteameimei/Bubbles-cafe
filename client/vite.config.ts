import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorModalPlugin from "@replit/vite-plugin-runtime-error-modal";
import shadcnThemeJsonPlugin from "@replit/vite-plugin-shadcn-theme-json";

export default defineConfig({
  plugins: [react(), runtimeErrorModalPlugin(), shadcnThemeJsonPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
});