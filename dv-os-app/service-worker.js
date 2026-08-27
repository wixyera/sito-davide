/* Service worker minimale per D.V. Personal OS.
   Mette in cache solo la "shell" statica (HTML, CSS, JS, manifest, icone)
   così l'app si apre anche offline o con connessione instabile. Le
   richieste ai dati (Supabase ecc.) passano sempre in rete: qui non va
   mai messa in cache roba che cambia (eventi, contatti), altrimenti
   l'utente vede dati vecchi.

   Se aggiorni i file dell'app e vuoi che il cambiamento arrivi SUBITO
   alla prima riapertura (invece che alla seconda), alza il numero qui
   sotto (v1 -> v2 -> v3...). */
const CACHE_NAME = 'dv-os-shell-v6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/config.js',
  './js/auth.js',
  './js/ui-core.js',
  './js/calendar.js',
  './js/career.js',
  './js/contacts.js',
  './js/wishlist.js',
  './js/ics.js',
  './js/init.js',
  './js/theme.js',
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
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Solo richieste dello stesso dominio (la shell). Tutto il resto
  // (API Supabase, font esterni, ecc.) va diretto in rete.
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
