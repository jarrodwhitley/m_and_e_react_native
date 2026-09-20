const CACHE_NAME = 'm-and-e-v1'
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    )
})

// Cache-first for same-origin GET requests, falling back to the network
// (and refreshing the cache) so the app still opens while offline.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
        return
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            const networkFetch = fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone()
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
                    }
                    return response
                })
                .catch(() => cached)

            return cached || networkFetch
        })
    )
})
