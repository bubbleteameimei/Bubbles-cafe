import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorModalPlugin from "@replit/vite-plugin-runtime-error-modal";
import shadcnThemeJsonPlugin from "@replit/vite-plugin-shadcn-theme-json";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: __dirname,
  publicDir: path.resolve(__dirname, 'public'),
  base: '/',
  plugins: [
    react(),
    runtimeErrorModalPlugin(),
    shadcnThemeJsonPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: "Bubble's Cafe - Horror Stories",
        short_name: "Horror Stories",
        description: "A horror-themed blog platform with advanced customization capabilities",
        theme_color: '#000000',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, '../server/public'),
    emptyOutDir: true,
    copyPublicDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-query',
            'wouter',
            '@radix-ui/react-toast',
            '@radix-ui/react-alert-dialog',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
});