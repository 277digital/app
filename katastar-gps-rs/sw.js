const CACHE = 'katastar-gps-rs-v1';
const ASSETS = ['./', 'index.html', 'style.css', 'js/app.js', 'js/geo.js', 'vendor/leaflet.js', 'vendor/leaflet.css',
  'vendor/images/marker-icon.png', 'vendor/images/layers.png', 'manifest.webmanifest', 'icons/icon.svg'];

self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))));
self.addEventListener('activate', (e) =>
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // mapne plocice i WMS uvijek sa mreze
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
