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

logger.info("Starting application...");

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

// Initialize style preloader
setupStylePreloader();

// Initialize CSRF protection - async but we don't block rendering on it
logger.debug("Initializing CSRF protection...");
initCSRFProtection().then(() => {
  logger.debug("CSRF protection initialized successfully");
}).catch(error => {
  logger.warn("CSRF protection initialization failed, continuing without it:", error);
  // Don't throw here - the app should work without CSRF initially
});

// Register Service Worker for PWA functionality
// Removed manual registration - VitePWA plugin handles this automatically with autoUpdate
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         logger.info('Service Worker registered successfully');
//       })
//       .catch((error) => {
//         logger.error('Service Worker registration failed:', error);
//       });
//   });
// }

logger.debug("CSS styles loaded");
logger.info("Mounting React application...");

// Add performance markers for debugging (simplified)
try {
  performance.mark('react-init-start');
} catch (e) {
  console.warn('Performance API not available');
}

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