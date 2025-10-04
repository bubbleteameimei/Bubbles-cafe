import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
// PWA removed

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
	const plugins = [react(), themePlugin()];

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