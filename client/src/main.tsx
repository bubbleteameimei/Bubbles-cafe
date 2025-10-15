// Import critical CSS early
import "./styles/preloader.css";
import "./styles/scroll-effects.css";
import "./styles/reader-fixes.css";
import "./index.css";

import { createRoot } from "react-dom/client";
import React from "react";

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

// Add initial loading indicator and setup style preloader via dynamic import
(async () => {
  try {
    const { addInitialLoadingIndicator, setupStylePreloader } = await import("./styles/preloader");
    addInitialLoadingIndicator();
    setupStylePreloader();
  } catch {}
})();

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

// Service worker registration
try {
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    const isLocalhost = ["localhost", "127.0.0.1"].includes(location.hostname);
    if (location.protocol === "https:" || isLocalhost) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }
} catch {}

// Dynamically import and mount the App to keep the entry chunk small
(async () => {
  try {
    const { default: App } = await import("./App");
    const rootElement = createRoot(root);
    rootElement.render(
      <React.StrictMode>
        <App />
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
      document.body.classList.remove("content-hidden");
      // Remove any preloader overlay that might obscure the fallback
      try {
        const overlay = document.querySelector(".initial-loading-overlay") as HTMLElement | null;
        overlay?.classList.add("hidden");
        overlay?.remove();
      } catch {}
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
})();

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