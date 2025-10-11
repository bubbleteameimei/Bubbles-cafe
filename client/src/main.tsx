// Import preloader CSS first to ensure it takes effect immediately
import "./styles/preloader.css";
// Import scroll effects CSS
import "./styles/scroll-effects.css";
// Import reader fixes to ensure proper story content padding
import "./styles/reader-fixes.css";
import { createRoot } from "react-dom/client";
import React from 'react';
import App from "./App";
import "./index.css";
// Import the preloader script
import { setupStylePreloader, addInitialLoadingIndicator } from "./styles/preloader";
import { optimizeImagesForConnection } from "./utils/image-optimization";
// All scroll to top functionality has been completely removed from the application
// We're now using only the standard loading-screen.tsx component directly
// Import CSRF protection
import { initCSRFProtection } from "@/lib/csrf-token";
import logger from "./utils/secure-client-logger";
import './lib/fetch-csrf';
import { startWebVitals, trackPageView, schedulePerformanceSummary } from '@/lib/metrics';
import { enableAxeInDev } from '@/lib/a11y-dev';
import { lazyLoadImages } from '@/lib/image-lazy';

// Dynamically initialize Google Identity Services onload dataset from env when available
(() => {
  try {
    const el = document.getElementById('g_id_onload') as HTMLDivElement | null;
    if (!el) return;
    const env: Record<string, any> = (import.meta as any)?.env || {};
    const clientId = env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    const loginUri = env.VITE_GOOGLE_LOGIN_URI as string | undefined;
    const uxMode = env.VITE_GOOGLE_UX_MODE as string | undefined;
    const autoPrompt = env.VITE_GOOGLE_AUTO_PROMPT as string | undefined;

    if (clientId) el.dataset.clientId = clientId;
    if (loginUri) el.dataset.loginUri = loginUri;
    if (uxMode) el.dataset.uxMode = uxMode;
    el.dataset.autoPrompt = autoPrompt ?? el.dataset.autoPrompt ?? 'false';
  } catch (e) {
    // Non-fatal; GIS will still initialize with defaults
  }
})();

logger.info("Starting application...");

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  try {
    const msg = event?.reason instanceof Error ? event.reason.message : String(event?.reason ?? 'Unknown');
    // Reduce noise in Replit preview by not logging to console
    fetch('/api/errors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'unhandledrejection', message: msg }) }).catch(() => {});
  } catch {}
});

const root = document.getElementById("root");
if (!root) {
  logger.error("Root element not found");
  throw new Error("Root element not found");
}

// Log CSS loading status
logger.debug("Loading CSS styles...");
const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
linkElements.forEach(link => {
  logger.debug("Found stylesheet:", { href: link.getAttribute('href') });
});

// Add initial loading indicator to prevent FOUC
addInitialLoadingIndicator();

// Optimize images based on connection speed
optimizeImagesForConnection();
// Force lazy loading + decode hints for images to reduce CLS
lazyLoadImages();

// Initialize style preloader
setupStylePreloader();

// Initialize CSRF protection - async but we don't block rendering on it
logger.debug("Initializing CSRF protection...");
initCSRFProtection().then(() => {
  logger.debug("CSRF protection initialized successfully");
}).catch(error => {
  logger.error("Error initializing CSRF protection:", error);
});

// Service worker registration
try {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
    if (location.protocol === 'https:' || isLocalhost) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }
} catch {}

logger.debug("CSS styles loaded");
logger.info("Mounting React application...");

// Add performance markers for debugging
performance.mark('react-init-start');

// Initialize React with error handling and performance tracking
const renderApp = () => {
  try {
    performance.mark('react-render-start');
    const rootElement = createRoot(root);
    rootElement.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    performance.mark('react-render-end');
    performance.measure('React Render Time', 'react-render-start', 'react-render-end');
    logger.info("React application mounted successfully");

    // Log performance metrics
    const measurements = performance.getEntriesByType('measure');
    measurements.forEach(measurement => {
      logger.debug(`Performance: ${measurement.name}: ${measurement.duration.toFixed(2)}ms`);
    });
  } catch (error) {
    logger.error("Error mounting React application:", error);
  }
};

renderApp();
// Enable a11y checks in development without affecting production
try { enableAxeInDev(); } catch {}

// Start analytics + performance monitoring (non-blocking)
try {
  trackPageView();
  schedulePerformanceSummary();
  // Delay web-vitals a bit to avoid impacting TTI
  setTimeout(() => { startWebVitals().catch(() => {}); }, 0);
} catch {}