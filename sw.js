/* Parlay On Main — service worker */
const VERSION = 'parlay-v1';
const APP_SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

/* Core files needed for the app to boot offline */
const PRECACHE = [
  'app.html',
  'assets/app/app.css',
  'assets/app/app.js',
  'assets/app/menu-data.json',
  'manifest.webmanifest',
  'assets/images/logo-circle.png',
  'assets/images/icon-192.png',
  'assets/images/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (maps, fonts) pass through

  // HTML navigations: network-first so updates show, fall back to cached app shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(APP_SHELL).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('app.html')))
    );
    return;
  }

  // Images: cache-first, then network, and store for next time
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        }).catch(() => cached)
      )
    );
    return;
  }

  // Everything else (css/js/json): stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
