/* DV / SPACE: offline static shell and existing per-user read cache.
   Auth and write requests always use the network. */
const CACHE_NAME = 'dv-os-shell-space-v3';
const DATA_CACHE_NAME = 'dv-os-data-v2';
const APP_SHELL = [
 './','./index.html','./manifest.json','./css/style.css','./css/lab.css',
 './js/config.js','./js/toast.js','./js/auth.js','./js/ui-core.js','./js/calendar.js',
 './js/career.js','./js/contacts.js','./js/wishlist.js','./js/spese.js','./js/ics.js',
 './js/search.js','./js/init.js','./js/theme.js','./js/music.js','./js/experience.js',
 './js/focus-timer.js','./assets/art/chrome-loop.png','./assets/icons/space.svg',
 './assets/icons/space-192.png','./assets/icons/space-512.png'
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
  if(req.mode==='navigate')return await caches.match('./index.html')||Response.error();
  return Response.error();
 }));
});
