
// Disabled legacy service worker to avoid conflicts with VitePWA injected SW.
// This file remains to prevent 404s if referenced anywhere, but it performs no caching.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  // Pass-through
});
