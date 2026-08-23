const CACHE_NAME = 'manasse-ia-v1';
const assetsToCache = [
  '/',
  'index.html',
  'logo.png',
  'mnl.png',
  '22510.jpg',
  '22601.jpg'
];

// Installation du Service Worker et mise en cache des fichiers principaux
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert avec succès');
        return cache.addAll(assetsToCache);
      })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache :', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseau pour un accès fluide
self.addEventListener('fetch', (event) => {
  // Pour les appels API vers Groq, on privilégie toujours le réseau en direct
  if (event.request.url.includes('api.groq.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Pour le reste du site, stratégie "Cache d'abord, puis réseau"
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si l'utilisateur est hors ligne et charge la page principale
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});

