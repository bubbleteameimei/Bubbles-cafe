// Import critical CSS early
import "./styles/preloader.css";
import "./styles/scroll-effects.css";
import "./styles/reader-fixes.css";
import "./index.css";

import { createRoot } from "react-dom/client";
import React from "react";

// Minimal runtime bootstrap without debug logs

// Global unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  try {
    const msg = event?.reason instanceof Error ? event.reason.message : String(event?.reason ?? "Unknown");
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "unhandledrejection", message: msg }),
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
  } catch {}
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