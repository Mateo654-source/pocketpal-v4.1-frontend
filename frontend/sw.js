const CACHE_NAME = 'ppal-v1';

// ─── INSTALL: sin pre-cache de rutas fijas ────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

// ─── ACTIVATE: limpiar caches viejos ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Eliminando cache viejo:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH: Cache First para assets, Network First para API ──────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar no-GET y URLs que no sean http
  if (!request.url.startsWith('http') || request.method !== 'GET') return;

  // Peticiones a la API → Network First
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Assets estáticos → Cache First (se cachean automáticamente al visitarse)
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});