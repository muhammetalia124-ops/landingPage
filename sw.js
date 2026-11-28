const V='portfolyo-v5';
const APP=['./','index.html','style.css','script.js','manifest.json','icon.svg','icon-192.png','icon-512.png'];
const LIB=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js','https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'];
const EXT=/^(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>Promise.all([c.addAll(APP),...LIB.map(u=>c.add(new Request(u,{mode:'cors'})).catch(()=>{}))])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{
const r=e.request;if(r.method!=='GET')return;
const u=new URL(r.url);
if(r.mode==='navigate'){
e.respondWith(fetch(r).then(res=>{if(res.ok&&/\/(index\.html)?$/.test(u.pathname)){const c=res.clone();caches.open(V).then(x=>x.put('index.html',c))}return res}).catch(()=>caches.match('index.html')));return}
if(u.origin===location.origin){
e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>hit);return hit||net}))}
else if(EXT.test(u.hostname)){
e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})))}});
