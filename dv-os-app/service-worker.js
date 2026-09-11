/* DV / SPACE: offline static shell and existing per-user read cache.
   Auth and write requests always use the network. */
const CACHE_NAME = 'dv-os-shell-orbit-v11';
const DATA_CACHE_NAME = 'dv-os-data-v2';
const APP_SHELL = [
 './','./index.html','./manifest.json','./css/style.css','./css/lab.css','./css/aurora.css','./css/kinetic.css','./css/director.css','./css/atelier.css','./css/product-film.css','./css/orbit-experience.css','./js/orbit-experience.js','./assets/brand/orbit-mark.svg','./js/director.js','./js/kinetic.js','./js/entrance-scene.js','./assets/backgrounds/chrome-figure.jpg',
 './js/config.js','./js/toast.js','./js/auth.js','./js/ui-core.js','./js/calendar.js',
 './js/career.js','./js/contacts.js','./js/wishlist.js','./js/spese.js','./js/ics.js',
 './js/search.js','./js/init.js','./js/theme.js','./js/music.js','./js/ambient-fx.js','./js/experience.js',
 './js/focus-timer.js','./js/gallery.js','./js/museum.js','./vendor/three.module.js','./assets/earth.jpg',
 './experiments/test.css','./experiments/test-engine.js','./experiments/test-dna.html','./experiments/test-ritmo.html','./experiments/test-futuro.html',
 './assets/art/chrome-loop.png','./assets/icons/space.svg','./assets/icons/space-192.png','./assets/icons/space-512.png'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dv-os-')&&k!==CACHE_NAME&&k!==DATA_CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{
 if(event.data?.type==='CLEAR_PERSONAL_CACHE') event.waitUntil(caches.delete(DATA_CACHE_NAME));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.cache==='no-store')return;
 const url=new URL(req.url);
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/auth/')||url.pathname.startsWith('/functions/'))return;
 if(url.hostname.endsWith('.supabase.co')){
  if(!url.pathname.startsWith('/rest/v1/')||!url.searchParams.has('user_id'))return;
  event.respondWith(fetch(req).then(res=>{
   if(res.ok){const clone=res.clone();event.waitUntil(caches.open(DATA_CACHE_NAME).then(cache=>cache.put(req,clone)))}
   return res;
  }).catch(async()=>await caches.match(req)||Response.json({message:'Connessione non disponibile.'},{status:503})));
  return;
 }
 if(url.origin!==self.location.origin)return;
 event.respondWith(fetch(req).then(res=>{
  if(res.ok){const clone=res.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(req,clone)))}
  return res;
 }).catch(async()=>{
  const cached=await caches.match(req);
  if(cached)return cached;
  // A missing script or image must never receive HTML as its fallback.
  if(req.mode==='navigate')return new Response('<!doctype html><html lang=it><meta charset=utf-8><meta name=viewport content="width=device-width"><title>Connessione assente</title><body style="background:#090d17;color:#eaf4ff;font:18px system-ui;padding:40px"><h1>Sei offline.</h1><p>Questa pagina non è ancora disponibile offline.</p><a href="/" style="color:#8ce9ff">Torna al tuo spazio</a></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
  return Response.error();
 }));
});
