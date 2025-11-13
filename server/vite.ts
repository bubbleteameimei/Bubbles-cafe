import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
// Use a lightweight cache-busting token without external deps
const cacheBust = () => Math.random().toString(36).slice(2);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

function isLikelyAssetRequest(urlPath: string): boolean {
  try {
    const pathname = new URL(urlPath, 'http://internal').pathname;
    // Treat paths with a file extension as asset requests, ignore Vite internal paths
    return /\.[a-zA-Z0-9]+$/.test(pathname) && !pathname.startsWith('/@');
  } catch {
    return false;
  }
}

export async function setupVite(app: Express, server: Server) {
  // Import Vite only when running in development to avoid requiring it in production
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteLogger = createLogger();

  // Dynamically import the Vite config only in development
  const rawViteConfig = (await import("../vite.config")).default;

  const serverOptions = {
    middlewareMode: true as const,
    hmr: { server },
    allowedHosts: true as true,
  } as const;

  // Resolve vite config if it's a function (defineConfig callback)
  const resolvedConfig = typeof (rawViteConfig as any) === 'function'
    ? (rawViteConfig as any)({ mode: process.env.NODE_ENV || 'development', command: 'serve' })
    : rawViteConfig;

  const vite = await createViteServer({
    ...resolvedConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Do not SPA-fallback for likely asset requests: return 404
      if (isLikelyAssetRequest(url)) {
        res.status(404).end('Not Found');
        return;
      }

      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${cacheBust()}"`,
      );
      // Inject Google Search Console verification meta when configured
      const gsc = process.env.GOOGLE_SITE_VERIFICATION || process.env.GSC_VERIFICATION;
      if (gsc && !template.includes('name="google-site-verification"')) {
        template = template.replace(
          '</head>',
          `  <meta name="google-site-verification" content="${gsc}"/>\\n</head>`
        );
      }
      // Inject preconnects to speed up initial network handshakes
      try {
        const preconnects: string[] = [];
        const apiBase = (process.env.BACKEND_BASE_URL || '').trim();
        const wpBase = (process.env.VITE_WORDPRESS_API_URL || '').trim();
        const addPreconnect = (u: string) => {
          if (!u) return;
          try {
            const url = new URL(u);
            const origin = `${url.protocol}//${url.host}`;
            const tag = `<link rel="preconnect" href="${origin}" crossorigin>`;
            if (!template.includes(tag)) preconnects.push(tag);
          } catch {
            // ignore invalid URLs
          }
        };
        addPreconnect(apiBase);
        addPreconnect(wpBase);
        if (preconnects.length > 0) {
          template = template.replace('</head>', `  ${preconnects.join('\\n  ')}\\n</head>`);
        }
      } catch {}
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

function resolveStaticRoot(): string {
  const candidates = [
    // Standard build output
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(__dirname, "..", "dist", "public"),
    // Fallbacks when running from source
    path.resolve(process.cwd(), "server", "public"),
    path.resolve(__dirname, "public"),
    // Project-level public if used
    path.resolve(process.cwd(), "public"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore filesystem errors and continue
    }
  }
  throw new Error(
    `Could not find any build directory. Tried: ${candidates.join(
      ", "
    )}. Make sure to run 'npm run build' before starting the server in production.`
  );
}

export function serveStatic(app: Express) {
  const staticRoot = resolveStaticRoot();

  // Serve static assets with sensible caching
  app.use(
    express.static(staticRoot, {
      setHeaders: (res, filePath) => {
        try {
          // Never cache HTML documents
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            return;
          }
          // Long cache for versioned assets
          if (/\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|json|txt|map)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        } catch {
          // ignore
        }
      },
    })
  );

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const url = req.originalUrl;
    if (isLikelyAssetRequest(url)) {
      res.status(404).end('Not Found');
      return;
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const indexPath = path.resolve(staticRoot, "index.html");
    const gsc = process.env.GOOGLE_SITE_VERIFICATION || process.env.GSC_VERIFICATION;
    try {
      let html = fs.readFileSync(indexPath, 'utf-8');
      // Inject Google site verification if missing
      if (gsc && !html.includes('name="google-site-verification"')) {
        html = html.replace('</head>', `  <meta name="google-site-verification" content="${gsc}"/>\\n</head>`);
      }
      // Inject preconnects to speed up initial handshakes
      try {
        const preconnects: string[] = [];
        const apiBase = (process.env.BACKEND_BASE_URL || '').trim();
        const wpBase = (process.env.VITE_WORDPRESS_API_URL || '').trim();
        const addPreconnect = (u: string) => {
          if (!u) return;
          try {
            const url = new URL(u);
            const origin = `${url.protocol}//${url.host}`;
            const tag = `<link rel="preconnect" href="${origin}" crossorigin>`;
            if (!html.includes(tag)) preconnects.push(tag);
          } catch {
            // ignore invalid URLs
          }
        };
        addPreconnect(apiBase);
        addPreconnect(wpBase);
        if (preconnects.length > 0) {
          html = html.replace('</head>', `  ${preconnects.join('\\n  ')}\\n</head>`);
        }
      } catch {}
      res.type('html').send(html);
      return;
    } catch {
      // fall through to sendFile on error
    }
    res.sendFile(indexPath);
  });
}
