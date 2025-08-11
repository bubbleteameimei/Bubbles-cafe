import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// import { VitePWA } from 'vite-plugin-pwa';
// import { splitVendorChunkPlugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: './',
  plugins: [
    react(),
    // splitVendorChunkPlugin(),
    // VitePWA({
    //   strategies: 'injectManifest',
    //   srcDir: 'src',
    //   filename: 'service-worker.ts',
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     maximumFileSizeToCacheInBytes: 5000000, // 5MB
    //     globPatterns: [
    //       '**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'
    //     ],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\./,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 // 24 hours
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'images-cache',
    //           expiration: {
    //             maxEntries: 200,
    //             maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
    //           }
    //         }
    //       }
    //     ]
    //   },
    //   manifest: {
    //     name: 'Bubbles Cafe - Immersive Storytelling',
    //     short_name: 'Bubbles Cafe',
    //     description: 'An immersive horror storytelling and creative writing platform',
    //     theme_color: '#000000',
    //     background_color: '#121212',
    //     display: 'standalone',
    //     orientation: 'portrait-primary',
    //     scope: '/',
    //     start_url: '/?source=pwa',
    //     categories: ['entertainment', 'books', 'lifestyle'],
    //     lang: 'en-US',
    //     icons: [
    //       {
    //         src: '/icons/icon-72x72.png',
    //         sizes: '72x72',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icons/icon-96x96.png',
    //         sizes: '96x96',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icons/icon-128x128.png',
    //         sizes: '128x128',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icons/icon-144x144.png',
    //         sizes: '144x144',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icons/icon-152x152.png',
    //         sizes: '152x152',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icons/icon-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icons/icon-384x384.png',
    //         sizes: '384x384',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icons/icon-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ],
    //     screenshots: [
    //       {
    //         src: '/screenshots/desktop-1.png',
    //         sizes: '1280x720',
    //         type: 'image/png',
    //         form_factor: 'wide',
    //         label: 'Homepage on desktop'
    //       },
    //       {
    //         src: '/screenshots/mobile-1.png',
    //         sizes: '375x812',
    //         type: 'image/png',
    //         form_factor: 'narrow',
    //         label: 'Homepage on mobile'
    //       }
    //     ]
    //   },
    //   devOptions: {
    //     enabled: true,
    //     type: 'module'
    //   }
    // })
  ],
  define: {
    'import.meta.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY ?? ''),
    'import.meta.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN ?? ''),
    'import.meta.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID ?? ''),
    'import.meta.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET ?? ''),
    'import.meta.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID ?? ''),
    'import.meta.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID ?? '')
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info']
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['wouter'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          utils: ['date-fns', 'class-variance-authority', 'tailwind-merge'],
          markdown: ['react-markdown', 'remark-gfm'],
          animations: ['framer-motion']
        },
        // Optimize asset naming for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      },
      external: (id) => {
        // Don't bundle development dependencies
        return id.includes('node_modules') && (
          id.includes('@types/') ||
          id.includes('eslint') ||
          id.includes('prettier')
        );
      }
    },
    // Source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: parseInt(process.env.CLIENT_PORT || "5173"),
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      port: parseInt(process.env.CLIENT_PORT || "5173"),
      host: '0.0.0.0',
    },
    watch: {
      usePolling: true,
    },
    // Replit-specific optimizations
    cors: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || "3002"}`,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@sharedlib": path.resolve(__dirname, "../shared"),
    },
  },
  // CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query'
    ],
    exclude: [
      'service-worker'
    ]
  }
});