/* Vemply – service worker: aplikacja działa w 100% offline. */
const CACHE = 'vemply-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/favicon-64.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

// `cache: 'reload'` omija cache HTTP przeglądarki (GitHub Pages serwuje
// index.html z max-age=600, przez co bez tego po wdrożeniu wpadały stare pliki).
const fresh = url => new Request(url, { cache: 'reload' });

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(fresh)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // nawigacja: najpierw sieć (świeża wersja, z pominięciem cache HTTP), offline → cache
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(fresh(req.url))
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // reszta: najpierw cache
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
