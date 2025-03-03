import { createRoot } from "react-dom/client";
import React from 'react';
import App from "./App";
import "./index.css";

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

console.log("[Client] CSS styles loaded");
console.log("[Client] Mounting React application...");

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      console.log('[ServiceWorker] Attempting registration...');
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[ServiceWorker] Registration successful. Scope:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[ServiceWorker] Update found, installing new version...');

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('[ServiceWorker] New worker state:', newWorker.state);
            if (newWorker.state === 'activated') {
              console.log('[ServiceWorker] New content is available; please refresh.');
            }
          });
        }
      });

      // Check for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[ServiceWorker] New service worker is controlling the page');
      });

    } catch (error) {
      console.error('[ServiceWorker] Registration failed:', error);
    }
  });
}


// Add error boundary for the entire app
const renderApp = () => {
  try {
    const rootElement = createRoot(root);
    rootElement.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("[Client] React application mounted successfully");
  } catch (error) {
    console.error("[Client] Error mounting React application:", error);
  }
};

renderApp();