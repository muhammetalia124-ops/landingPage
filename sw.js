// Service worker: ağ öncelikli (güncel içerik), çevrimdışıyken önbellekten sunar.
// Üçüncü taraf kütüphaneler (GSAP, Three.js, yazı tipleri) de ilk başarılı yüklemede önbelleğe alınır.
const C = 'ma-v4';
const A = ['/', '/index.html', '/projeler.html', '/style.css', '/script.js', '/scene.js', '/icon.svg', '/icon-192.png', '/icon-512.png', '/manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then((c) => c.addAll(A)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== C).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.status === 200) {
          const copy = res.clone();
          caches.open(C).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('/index.html') : Response.error())))
  );
});
