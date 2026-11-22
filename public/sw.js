// Service Worker for Patitas del Sur Admin PWA
const CACHE_NAME = 'patitas-pwa-v8';
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/apple-touch-icon.png',
  '/images/logo_patitas_del_sur_amber.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Some static assets failed to pre-cache', err);
      });
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
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo manejar GET http/https
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Nunca interceptar recursos cross-origin (Supabase, Google Maps/Places, fuentes externas) ni dev/API
  if (
    url.origin !== self.location.origin ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.includes('node_modules')
  ) {
    return;
  }

  const isNavigation =
    event.request.mode === 'navigate' ||
    event.request.headers.get('accept')?.includes('text/html') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.startsWith('/admin');

  const isManifest = url.pathname === '/manifest.webmanifest';

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic' &&
            !url.pathname.startsWith('/api')
          ) {
            const contentType = networkResponse.headers.get('content-type') || '';
            // Evitar envenenar caché guardando HTML bajo una URL de chunk JS/CSS
            const isJsOrCssPath = /\.(js|mjs|css)(\?|$)/i.test(url.pathname);
            if (!(isJsOrCssPath && contentType.includes('text/html'))) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          }
          return networkResponse;
        })
        .catch(async () => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (isNavigation) {
            const htmlCache =
              (await caches.match('/index.html')) ||
              (await caches.match('/admin')) ||
              (await caches.match('/'));
            if (htmlCache) return htmlCache;
          }
          return new Response('Sin conexión a internet', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        });

      if (isNavigation || isManifest) {
        return fetchPromise;
      }
      return cachedResponse || fetchPromise;
    })
  );
});

// =========================================================================
// WEB PUSH NOTIFICATIONS (Notificaciones de nuevos pedidos web con app cerrada)
// =========================================================================
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : 'Nuevo pedido recibido en Patitas del Sur' };
  }

  const title = data.title || '🐾 Nuevo pedido web en Patitas del Sur';
  const options = {
    body: data.body || 'Ingresa al panel de administración para revisar el reparto.',
    icon: data.icon || '/pwa-icon-192.png',
    badge: data.badge || '/pwa-icon-192.png',
    tag: data.tag || `patitas-order-${data.orderId || Date.now()}`,
    renotify: true,
    requireInteraction: Boolean(data.requireInteraction),
    vibrate: [160, 80, 160],
    data: {
      url: data.url || '/admin?tab=pedidos',
      orderId: data.orderId || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/admin?tab=pedidos';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.postMessage({
            type: 'PATITAS_NOTIFICATION_CLICK',
            url: targetUrl,
            orderId: event.notification?.data?.orderId || null,
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});
