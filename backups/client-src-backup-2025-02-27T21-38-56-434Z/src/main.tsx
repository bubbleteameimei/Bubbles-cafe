import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[Client] Starting application...");

const root = document.getElementById("root");
if (!root) {
  console.error("[Client] Root element not found");
  throw new Error("Root element not found");
}

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
              // You could show a refresh prompt to the user here
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

console.log("[Client] Mounting React application...");
createRoot(root).render(<App />);
console.log("[Client] React application mounted successfully");