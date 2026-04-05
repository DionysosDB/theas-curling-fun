const CACHE = 'theas-curling-v1';
const FILES = [
  'https://dionysosdb.github.io/theas-curling-fun/index.html',
  'https://dionysosdb.github.io/theas-curling-fun/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        fetch(e.request).then(fresh => {
          if (fresh && fresh.status === 200)
            caches.open(CACHE).then(c => c.put(e.request, fresh.clone()));
        }).catch(() => {});
        return cached;
      }
      return fetch(e.request).then(response => {
        if (response && response.status === 200)
          caches.open(CACHE).then(c => c.put(e.request, response.clone()));
        return response;
      }).catch(() =>
        caches.match('https://dionysosdb.github.io/theas-curling-fun/index.html')
      );
    })
  );
});
