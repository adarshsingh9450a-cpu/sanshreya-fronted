// OPAS Auto-Updating Service Worker
const CACHE_NAME = 'opas-app-cache-v4'; // Version update kar diya (v4)

// 1. Install & Force Takeover
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Purane fawicon/code ko turant maar degi
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // 🚨 SAARE PATHS MEIN DOT (.) LAGA DIYA HAI GITHUB KE LIYE
            return cache.addAll([
                './',
                './index.html',
                './manifest.json',
                './icon-192.png',
                './icon-512.png'
            ]);
        })
    );
});

// 2. Activate & Clean Old Garbage
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Purana cache hamesha ke liye delete
                    }
                })
            );
        }).then(() => self.clients.claim()) // Naye code ko turant activate karo
    );
});

// 3. Network-First Strategy (Always fetch fresh code if online)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Agar net chal raha hai, toh naya code laao aur save karo
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Agar staff offline (bina net) hai, tabhi purana cached code dikhao
                return caches.match(event.request);
            })
    );
});