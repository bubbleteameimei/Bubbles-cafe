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
// We're now using only the standard loading-screen.tsx component directly
// Import CSRF protection
import { initCSRFProtection } from "@/lib/csrf-token";

console.log("[Client] Starting application...");

const root = document.getElementById("root");
if (!root) {
  console.error("[Client] Root element not found");
  throw new Error("Root element not found");
}

// Log CSS loading status
console.log("[Client] Loading CSS styles...");
const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
linkElements.forEach(link => {
  console.log("[Client] Found stylesheet:", link.getAttribute('href'));
});

// Add initial loading indicator to prevent FOUC
addInitialLoadingIndicator();

// Optimize images based on connection speed
optimizeImagesForConnection();

// Initialize style preloader
setupStylePreloader();

// Initialize CSRF protection - async but we don't block rendering on it
console.log("[Client] Initializing CSRF protection...");
initCSRFProtection().then(() => {
  console.log("[Client] CSRF protection initialized successfully");
}).catch(error => {
  console.error("[Client] Error initializing CSRF protection:", error);
});

console.log("[Client] CSS styles loaded");
console.log("[Client] Mounting React application...");

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
    console.log("[Client] React application mounted successfully");

    // Log performance metrics
    const measurements = performance.getEntriesByType('measure');
    measurements.forEach(measurement => {
      console.log(`[Performance] ${measurement.name}: ${measurement.duration.toFixed(2)}ms`);
    });
  } catch (error) {
    console.error("[Client] Error mounting React application:", error);
  }
};

renderApp();