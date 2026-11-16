const CACHE_NAME = 'hypertracker-v3';
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
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
// NUEVO: Funciones Avanzadas PWA
// ==========================================

// 1. Sincronización en Segundo Plano (Background Sync)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-entrenamientos') {
        console.log('Sincronización en segundo plano ejecutada');
        // Aquí iría el código para enviar datos a una base de datos cuando vuelva el internet
        event.waitUntil(Promise.resolve()); 
    }
});

// 2. Sincronización Periódica
self.addEventListener('periodicsync', event => {
    if (event.tag === 'actualizar-rutinas') {
        console.log('Sincronización periódica ejecutada');
        event.waitUntil(Promise.resolve());
    }
});

// 3. Notificaciones Push
self.addEventListener('push', event => {
    const title = 'HyperTracker';
    const options = {
        body: event.data ? event.data.text() : '¡Es hora de registrar tu entrenamiento!',
        icon: 'https://dummyimage.com/192x192/3b82f6/ffffff.png&text=HT',
        badge: 'https://dummyimage.com/192x192/3b82f6/ffffff.png&text=HT'
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
