// Import critical CSS early
import "./styles/scroll-effects.css";
import "./styles/content-visibility.css";
import "./index.css";

import { createRoot } from "react-dom/client";
import React from "react";

import { isCategoryAllowed } from "@/lib/cookie-manager";

// Patch window.fetch to auto-apply CSRF to non-GET requests
import "@/lib/fetch-csrf";

// Minimal runtime bootstrap without debug logs
import { getApiBaseUrl } from "@/lib/asset-path";
import { enableViewTransitions } from "@/lib/view-transitions";

// Global unhandled promise rejection handler (gate repeated logs once per session)
window.addEventListener("unhandledrejection", (event) => {
  try {
    const msg = event?.reason instanceof Error ? event.reason.message : String(event?.reason ?? "Unknown");
    const gateKey = `once_unhandled_${btoa(unescape(encodeURIComponent(String(msg))).slice(0, 64))}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(gateKey)) return;
    try { sessionStorage.setItem(gateKey, "1"); } catch {}
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

// Enable progressive SPA View Transitions (no-op when unsupported or reduced motion)
try {
  enableViewTransitions();
} catch {}

// Also sync html.reduce-motion class with user/system preferences (non-blocking)
(() => {
  try {
    import("@/lib/motion")
      .then(({ initReducedMotionClassSync }) => {
        try {
          initReducedMotionClassSync();
        } catch {}
      })
      .catch(() => {});
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

// Service worker: removed. It cached the whole site on visitors' devices and kept serving
// the old version after deploys (fixes looked "not deployed"; the admin menu didn't show).
// Here we unregister any worker left from earlier visits and delete its caches; if one was
// controlling this page, reload once so the page comes fresh from the network. Assets are
// content-hashed and index.html is no-cache on Vercel, so nothing is lost without it.
try {
  if ("serviceWorker" in navigator) {
    const wasControlled = !!navigator.serviceWorker.controller;
    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
        }
        const onAuthPage = /^\/(auth|reset-password)/.test(location.pathname);
        if (wasControlled && regs.length > 0 && !onAuthPage && !sessionStorage.getItem("sw:cleared")) {
          sessionStorage.setItem("sw:cleared", "1");
          location.reload();
        }
      } catch {
        // best effort
      }
    })();
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