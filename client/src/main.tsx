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

logger.info("Starting application...");

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event.reason instanceof Error ? { message: event.reason.message, stack: event.reason.stack } : { message: String(event.reason) };
    logger.error('Unhandled promise rejection', reason);
  } catch (_) {}
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

// Initialize style preloader
setupStylePreloader();

// Initialize CSRF protection - async but we don't block rendering on it
logger.debug("Initializing CSRF protection...");
initCSRFProtection().then(() => {
  logger.debug("CSRF protection initialized successfully");
}).catch(error => {
  logger.error("Error initializing CSRF protection:", error);
});

// Service worker removed

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