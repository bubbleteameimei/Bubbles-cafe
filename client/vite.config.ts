import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    // Enable gzip compression for production
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Enable brotli compression for better performance
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
    },
    // Optimize development server
    hmr: {
      overlay: false, // Reduce visual noise
    },
    // Pre-warm frequently requested files
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Enable code splitting for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ['react', 'react-dom'],
          // Router chunk for navigation
          router: ['@tanstack/react-router'],
          // UI chunk for UI components
          ui: ['lucide-react', 'framer-motion'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps for debugging (disable in production for performance)
    sourcemap: false,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets as base64
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      'lucide-react',
      'framer-motion',
    ],
    // Exclude problematic dependencies
    exclude: ['@vite/client', '@vite/env'],
  },
  // CSS optimization
  css: {
    devSourcemap: false, // Disable CSS source maps for better performance
  },
});