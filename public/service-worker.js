// A basic service worker for PWA functionality

const CACHE_NAME = 'parish-hall-booking-v1';

// On install, cache some resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  // It's common to pre-cache the app shell here
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  // Clear old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// On fetch, serve from cache if possible
self.addEventListener('fetch', event => {
  // For a SPA, you might want a "network falling back to cache" strategy
  // or an "app-shell" model. This is a simple cache-first example.
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
