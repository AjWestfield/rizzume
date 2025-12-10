// Empty service worker - prevents 404 errors
// This file exists to satisfy requests for /sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
