import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// PWA removed

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig(async ({ mode }) => {
	const devPlugins = [];
	if (mode === "development") {
		const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
		devPlugins.push(runtimeErrorOverlay());
	}

	return {
		plugins: [
			react(),
			...devPlugins,
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
			// Proxy API requests to the mock server during client-only development
			proxy: {
				"/api": {
					target: "http://localhost:4000",
					changeOrigin: true,
					ws: false,
				},
			},
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
			drop: mode === "production" ? ["console", "debugger"] : []
		}
	};
});