/* RECOMP STUDIO v3.2: offline UI shell; videos are streamed and never cached. */
const CACHE = 'recomp-studio-shell-v6';
const CORE = ['./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('recomp-studio-shell-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
 const request = event.request;
 if(request.method !== 'GET')return;
 const url = new URL(request.url);
 if(url.origin !== self.location.origin)return; // never intercept or store third-party videos
 if(request.mode === 'navigate' || url.pathname.endsWith('/index.html')){
  event.respondWith(fetch(request).then(response => {
   if(response.ok){const saved=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',saved)).catch(()=>{});}
   return response;
  }).catch(()=>caches.match('./index.html')));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone())).catch(()=>{});
  return response;
 })));
});
