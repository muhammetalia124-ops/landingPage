const C = 'ma-v5';
const A = ['/', '/index.html', '/projeler.html', '/mobil.html', '/mobil-projeler.html', '/mobil.css', '/mobil.js', '/style.css', '/script.js', '/icon-192.png', '/icon-512.png', '/manifest.json'];

self.addEventListener('install', e => {
    self.skipWaiting();
    // tek bir dosya eksikse bile kurulum başarısız olmasın
    e.waitUntil(caches.open(C).then(c => Promise.all(A.map(u => c.add(u).catch(() => {})))));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim())
    );
});

// önce ağ (güncel tasarım), olmazsa önbellek; CDN kütüphaneleri (GSAP, Three.js, yazı tipleri) de çevrimdışı için saklanır
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (res && (res.ok || res.type === 'opaque')) {
                    const copy = res.clone();
                    caches.open(C).then(c => c.put(e.request, copy));
                }
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
