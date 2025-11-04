// Import critical CSS early
import "./styles/scroll-effects.css";
import "./styles/reader-fixes.css";
import "./index.css";

import { createRoot } from "react-dom/client";
import React from "react";

// Vercel Speed Insights (React) - production only
import { SpeedInsights } from "@vercel/speed-insights/react";

// Patch window.fetch to auto-apply CSRF to non-GET requests
import "@/lib/fetch-csrf";

// Minimal runtime bootstrap without debug logs
import { getApiBaseUrl } from "@/lib/asset-path";

// Global unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  try {
    const msg = event?.reason instanceof Error ? event.reason.message : String(event?.reason ?? "Unknown");
    const API_BASE = getApiBaseUrl();
    const url = API_BASE ? `${API_BASE}/api/errors` : "/api/errors";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "unhandledrejection", message: msg }),
      credentials: "include",
    }).catch(() => {});
  } catch {}
});

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

// Optimize images and enable lazy hints via dynamic import
(async () => {
  try {
    const [{ optimizeImagesForConnection }, { lazyLoadImages }] = await Promise.all([
      import("./utils/image-optimization"),
      import("@/lib/image-lazy"),
    ]);
    optimizeImagesForConnection();
    lazyLoadImages();
  } catch {}
})();

// Initialize CSRF protection lazily without blocking render
(async () => {
  try {
    const { initCSRFProtection } = await import("@/lib/csrf-token");
    await initCSRFProtection();
  } catch {}
})();

// Service worker registration (enabled by default in production)
try {
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    const hostname = location.hostname;
    const isLocalhost = ["localhost", "127.0.0.1"].includes(hostname);
    const isPreviewHost =
      /\.vercel\.app$/.test(hostname) ||
      /\.vercel\.dev$/.test(hostname) ||
      /\.repl\.co$/.test(hostname) ||
      /\.replit\.dev$/.test(hostname) ||
      /\.replit\.app$/.test(hostname);

    // Only register on HTTPS or localhost, and avoid ephemeral preview hosts by default
    if (!isPreviewHost && (location.protocol === "https:" || isLocalhost)) {
      (async () => {
        try {
          const res = await fetch("/sw.js", { method: "HEAD" });
          if (res.ok) {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
          }
        } catch {
          // Silent: no service worker available
        }
      })();
    }
  }
} catch {}

// Background route chunk preloading on idle (Home, Reader, Stories)
(() => {
  const run = async () => {
    try {
      await Promise.allSettled([
        import("./pages/home"),
        import("./pages/reader"),
        import("./pages/index"),
      ]);
    } catch {
      // Silent
    }
  };
  const ric = (window as any).requestIdleCallback as ((cb: () => void, opts?: { timeout?: number }) => void) | undefined;
  if (typeof ric === "function") {
    ric(() => run(), { timeout: 2000 });
  } else {
    setTimeout(run, 800);
  }
})();

// Import and mount the App synchronously for fastest first render
import App from "./App";
try {
  const rootElement = createRoot(root);
  rootElement.render(
    <React.StrictMode>
      <App />
      {import.meta.env.PROD && <SpeedInsights />}
    </React.StrictMode>
  );
} catch (e) {
  // Fail-safe boot fallback so users never see a blank screen
  let msg = "Unknown boot error";
  try {
    msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown boot error";
    const API_BASE = getApiBaseUrl();
    const url = API_BASE ? `${API_BASE}/api/errors` : "/api/errors";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "boot-failure", message: String(msg) }),
      credentials: "include",
    }).catch(() => {});
  } catch {}

  try {
    const fallback = document.createElement("main");
    fallback.setAttribute("id", "main-content");
    fallback.setAttribute("role", "main");
    fallback.style.position = "fixed";
    fallback.style.inset = "0";
    fallback.style.display = "flex";
    fallback.style.alignItems = "center";
    fallback.style.justifyContent = "center";
    fallback.style.background = "#0a0a0a";
    fallback.style.color = "#fff";
    fallback.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif";
    fallback.style.padding = "16px";
    fallback.innerHTML = `
      <div style="max-width:720px;text-align:center;">
        <div style="font-size:18px;line-height:1.6;margin-bottom:12px;">The app failed to load.</div>
        <div style="opacity:.8;font-size:14px;margin-bottom:16px;">Please refresh the page. If the issue persists, check the backend health.</div>
        <div style="opacity:.6;font-size:12px;margin-bottom:16px;"><code>${String(msg).slice(0, 240)}</code></div>
        <div style="display:flex;gap:8px;justify-content:center;">
          <button id="retry-btn" style="appearance:none;border:0;background:#2a2a2a;color:#fff;padding:10px 14px;border-radius:8px;cursor:pointer;">Refresh</button>
          <a id="health-link" href="#" style="display:inline-block;background:#1f2937;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;">Backend health</a>
        </div>
      </div>`;
    const retry = fallback.querySelector("#retry-btn");
    retry?.addEventListener("click", () => location.reload());
    // Set health link to absolute API health endpoint when frontend and backend are split
    try {
      const API_BASE = getApiBaseUrl();
      const healthUrl = API_BASE ? `${API_BASE}/api/health` : "/api/health";
      const healthLink = fallback.querySelector("#health-link") as HTMLAnchorElement | null;
      healthLink?.setAttribute("href", healthUrl);
    } catch {}
    root.replaceChildren(fallback);
  } catch {}
}

// Dev-only accessibility checks via dynamic import
if (import.meta.env.DEV) {
  (async () => {
    try {
      const { enableAxeInDev } = await import("@/lib/a11y-dev");
      await enableAxeInDev();
    } catch {}
  })();
}

// Start analytics + performance monitoring lazily (non-blocking)
(async () => {
  try {
    const { startWebVitals, trackPageView, schedulePerformanceSummary } = await import("@/lib/metrics");
    trackPageView();
    schedulePerformanceSummary();
    setTimeout(() => {
      startWebVitals().catch(() => {});
    }, 0);
  } catch {}
})();