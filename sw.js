/* ===================================================================
   FitTracker v1.0.3 - Service Worker (Network-First + Auto-Update)
   - Siempre busca la versión más reciente en GitHub cuando hay red.
   - Si estás sin señal en el gimnasio, carga desde caché local.
   - Al actualizarse, borra automáticamente cachés viejos (HyperTracker/Titan).
   =================================================================== */

// Cambia este número cada vez que publiques una nueva versión en GitHub
const CACHE_NAME = 'fittracker-v1.0.3';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './apple-touch-icon.png',
  './favicon-32x32.png'
];

// 1. Instalación: precarga archivos base y activa de inmediato sin esperar
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// 2. Activación: elimina TODOS los cachés antiguos (incluidos los de HyperTracker)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((oldKey) => caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Intercepción de red: Network-First para evitar quedarse pegado en versiones viejas
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo interceptar peticiones GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Solo cachear archivos propios del mismo dominio (GitHub Pages)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((networkRes) => {
        // Si la red responde bien, actualizamos el caché en segundo plano
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return networkRes;
      })
      .catch(() => {
        // Sin internet (modo gimnasio offline): servir desde caché con respaldo válido
        return caches.match(req).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          if (req.mode === 'navigate') {
            return caches.match('./index.html').then((indexRes) => {
              return indexRes || new Response('Sin conexión', { status: 503, statusText: 'Offline' });
            });
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
