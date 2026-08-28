/* Service worker per D.V. Personal OS.
   Livello 1 — "shell" statica (HTML, CSS, JS, manifest, icone): sempre
   in cache, così l'app si apre anche offline o con connessione instabile.
   Livello 2 — dati (Supabase, GET soli): rete-prima-poi-cache, così se
   l'utente va offline vede comunque l'ultima versione salvata invece di
   uno schermo vuoto. Le scritture (POST/PATCH/DELETE) restano SEMPRE
   dirette in rete, mai gestite dal service worker.

   Se aggiorni i file dell'app e vuoi che il cambiamento arrivi SUBITO
   alla prima riapertura (invece che alla seconda), alza il numero qui
   sotto (v1 -> v2 -> v3...). */
const CACHE_NAME = 'dv-os-shell-v8';
const DATA_CACHE_NAME = 'dv-os-data-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/config.js',
  './js/toast.js',
  './js/auth.js',
  './js/ui-core.js',
  './js/calendar.js',
  './js/career.js',
  './js/contacts.js',
  './js/wishlist.js',
  './js/spese.js',
  './js/ics.js',
  './js/search.js',
  './js/init.js',
  './js/theme.js',
  './js/motion.js',
  './js/music.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== DATA_CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return; // scritture: mai in cache, sempre in rete

  const url = new URL(req.url);

  // Dati Supabase (qualunque progetto): rete-prima, con fallback su
  // cache se la rete non risponde (offline / connessione instabile).
  if (url.hostname.endsWith('.supabase.co')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(DATA_CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Solo richieste dello stesso dominio (la shell). Tutto il resto
  // (font esterni, ecc.) va diretto in rete.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});

