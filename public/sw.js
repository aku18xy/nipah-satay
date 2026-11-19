// Nipah Satay Service Worker for Offline PWA Resilience
const CACHE_NAME = 'nipah-satay-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/satay_skewer.jpg',
  '/images/soto.jpg',
  '/images/set_nasi_lemak.jpg',
  '/images/karipap.jpg',
  '/images/mi_rebus.jpg',
  '/images/lai_chee_kang.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate for network resilience
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback
            return cachedResponse;
          });
        return cachedResponse || fetchPromise;
      })
    );
  }
});
