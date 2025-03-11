import { createRoot } from "react-dom/client";
import React from 'react';
import App from "./App";
import "./index.css";
import { optimizeImagesForConnection } from "./utils/image-optimization";
import { ScrollToTop } from "./components/ui/scroll-to-top";

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

// Optimize images based on connection speed
optimizeImagesForConnection();

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
        <>
          <App />
          <ScrollToTop />
        </>
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