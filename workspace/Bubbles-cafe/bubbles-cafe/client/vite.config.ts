import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Horror Blog Platform',
        short_name: 'Horror Blog',
        description: 'An immersive horror storytelling experience',
        theme_color: '#000000',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  define: {
    'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
    'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
    'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID),
    'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
    'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
    'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID)
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 443,
      port: 3000,
      host: '0.0.0.0',
    },
    watch: {
      usePolling: true,
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  }
});