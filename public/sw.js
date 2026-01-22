// OVDJE MIJENJAŠ VERZIJU - Svaki put kad nešto promijeniš u kodu, digni ovaj broj (npr. v1.2)
const CACHE_NAME = 'zgledaj-v1.1.1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/zg-icon.png',
  '/manifest.json' // Dobro je cacheirati i manifest
];

// 1. INSTALACIJA: Spremi nove datoteke
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Ovo tjera novi Service Worker da se odmah aktivira, umjesto da čeka da se svi tabovi zatvore
  self.skipWaiting();
});

// 2. AKTIVACIJA: Obriši stare cacheve (ovo rješava problem da ljudi vide staru app)
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Ako cache ima staro ime (npr. 'zgledaj-store' ili 'zgledaj-v1.0'), obriši ga!
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Odmah preuzmi kontrolu nad stranicom
  return self.clients.claim();
});

// 3. FETCH: Posluži iz cachea, ako nema onda s interneta
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Vrati cache ako postoji, inače idi na mrežu
      return response || fetch(e.request);
    })
  );
});