import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
// PWA removed
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        ...(mode === 'development' ? [runtimeErrorOverlay()] : []),
        themePlugin(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "client", "src"),
            "@shared": path.resolve(__dirname, "shared"),
        },
    },
    server: {
        allowedHosts: true,
    },
    root: path.resolve(__dirname, "client"),
    build: {
        outDir: path.resolve(__dirname, "dist/public"),
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['wouter'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
                    charts: ['chart.js', 'react-chartjs-2'],
                    forms: ['react-hook-form', '@hookform/resolvers'],
                    utils: ['date-fns', 'clsx', 'class-variance-authority'],
                    markdown: ['react-markdown', 'remark-gfm'],
                    animations: ['framer-motion']
                }
            }
        }
    },
    esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : []
    }
}));
