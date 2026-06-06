import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import { VitePWA } from "vite-plugin-pwa";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
	const plugins = [
		react(),
		themePlugin(),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: false,
			includeAssets: ["icons/*", "favicon.ico"],
			manifest: {
				name: "Bubbles Cafe",
				short_name: "BubblesCafe",
				start_url: "/",
				display: "standalone",
				background_color: "#0a0a0a",
				theme_color: "#ff3f6a",
				icons: [
					{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
					{ src: "/icons/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
				]
			},
			workbox: {
				navigateFallback: "/index.html",
				cleanupOutdatedCaches: true,
				// Vercel builds can place artifacts outside workbox's globDirectory; don't fail the build.
				globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json,woff2,woff,ttf,otf}"],
				globIgnores: ["**/*.map"],
				runtimeCaching: [
					{
						// Cache images (same-origin and cross-origin)
						urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/i,
						handler: "CacheFirst",
						options: {
							cacheName: "images",
							expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
							cacheableResponse: { statuses: [0, 200] }
						}
					},
					{
						// Cache WordPress-hosted images and assets
						urlPattern: /^https?:\/\/(?:.*\.)?wordpress\.com\/.*$/i,
						handler: "CacheFirst",
						options: {
							cacheName: "wp-images",
							expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
							cacheableResponse: { statuses: [0, 200] }
						}
					},
					{
						// App assets: JS/CSS/Fonts with SWR
						urlPattern: /\.(?:js|css|woff|woff2|ttf|otf|map)$/i,
						handler: "StaleWhileRevalidate",
						options: { cacheName: "assets" }
					},
					{
						// API requests: network-first; never cache CSRF tokens
						urlPattern: ({ url }) =>
							url.pathname.startsWith("/api/") &&
							!url.pathname.includes("/api/csrf-token"),
						handler: "NetworkFirst",
						options: {
							cacheName: "api",
							networkTimeoutSeconds: 4,
							cacheableResponse: { statuses: [0, 200] }
						}
					}
				]
			}
		})
	];

	if (mode === "development") {
		const require = createRequire(import.meta.url);
		try {
			const mod = require("@replit/vite-plugin-runtime-error-modal");
			const overlay = mod?.default ?? mod;
			if (typeof overlay === "function") {
				plugins.push(overlay());
			}
		} catch {
			// Optional dev-only plugin not available; ignore on CI/Render.
		}
	}

	return {
		plugins,
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "client", "src"),
				"@shared": path.resolve(__dirname, "shared"),
			},
		},
		server: {
			allowedHosts: true,
			// Proxy API requests to local Express server on port 3001
			proxy: {
				"/api": {
					target: "http://localhost:3001",
					changeOrigin: true,
					ws: false,
				},
			},
		},
		root: path.resolve(__dirname, "client"),
		build: {
			outDir: path.resolve(__dirname, "dist/public"),
			emptyOutDir: true,
			sourcemap: true,
			chunkSizeWarningLimit: 1200,
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
			drop: mode === "production" ? ["console", "debugger"] : []
		}
	};
});
