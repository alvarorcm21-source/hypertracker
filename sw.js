const CACHE_NAME = 'hypertracker-v7.0';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './sticker_3141-192x192.png',
    './sticker_3141-512x512.png'
];

// Instalación y Caché
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

// Limpieza de Caché antigua
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    self.clients.claim();
});

// Interceptar Peticiones (Modo Offline)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => caches.match('./index.html'))
    );
});

// ==========================================
// Funciones Avanzadas PWA
// ==========================================

self.addEventListener('sync', event => {
    if (event.tag === 'sync-entrenamientos') {
        console.log('Sincronización en segundo plano ejecutada');
        event.waitUntil(Promise.resolve()); 
    }
});

self.addEventListener('periodicsync', event => {
    if (event.tag === 'actualizar-rutinas') {
        console.log('Sincronización periódica ejecutada');
        event.waitUntil(Promise.resolve());
    }
});

self.addEventListener('push', event => {
    const title = 'HyperTracker';
    const options = {
        body: event.data ? event.data.text() : '¡Es hora de registrar tu entrenamiento!',
        icon: './sticker_3141-192x192.png',
        badge: './sticker_3141-192x192.png'
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
