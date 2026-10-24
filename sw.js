/* ---------- service worker: offline play ---------- */
const VER='gambit-v5';
const CORE=['./index.html','./css/style.css','./js/01-config.js','./js/02-rules.js','./js/03-scene.js','./js/04-state.js','./js/05-fx.js','./js/06-moves.js','./js/07-ai.js','./js/08-ui.js','./js/09-boot.js','./js/10-pwa.js','./manifest.json','./icon-192.png','./icon-512.png','./favicon.png','./moki.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=e.request.url;
  /* CDN libs + fonts: cache-first after first successful load */
  if(u.indexOf('https://')===0){
    e.respondWith(caches.match(e.request).then(hit=>{
      const net=fetch(e.request).then(res=>{const cl=res.clone();caches.open(VER).then(c=>c.put(e.request,cl)).catch(()=>{});return res}).catch(()=>hit||Response.error());
      return hit||net}));
    return}
  /* same-origin app shell: pages network-first (fresh updates), baaki cache-first */
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(res=>{const cl=res.clone();caches.open(VER).then(c=>c.put('./index.html',cl)).catch(()=>{});return res}).catch(()=>caches.match('./index.html')));
    return}
  e.respondWith(caches.match(e.request).then(hit=>{
    if(hit)return hit;
    return fetch(e.request).then(res=>{const cl=res.clone();caches.open(VER).then(c=>c.put(e.request,cl)).catch(()=>{});return res}).catch(()=>caches.match('./index.html'))}));
});
