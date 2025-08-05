// Service Worker Registration
// This file handles the registration and lifecycle management of the service worker

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
      
      registerValidSW(swUrl);
      
      // Add a listener for when the network status changes
      window.addEventListener('online', () => {
        
        document.dispatchEvent(new CustomEvent('app-online'));
      });
      
      window.addEventListener('offline', () => {
        
        document.dispatchEvent(new CustomEvent('app-offline'));
      });
    });
  }
}

function registerValidSW(swUrl: string) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Check for updates on page load
      registration.update();
      
      // Setup a regular interval for service worker updates
      setInterval(() => {
        registration.update();
        
      }, 60 * 60 * 1000); // Check for updates once per hour
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              
              
              // Dispatch an event for the app to display an update notification
              document.dispatchEvent(new CustomEvent('app-update-available'));
            } else {
              // At this point, everything has been precached.
              
            }
          }
        };
      };
    })
    .catch((error) => {
      
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        
      });
  }
}

// Function to apply the update and reload the application
// Call this when the user confirms they want to update
export function applyUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        // Send message to service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for the service worker to activate
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Reload the page
          window.location.reload();
        });
      }
    });
  }
}