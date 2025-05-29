// Service Worker untuk Peta Bicara PWA
const CACHE_NAME = 'peta-bicara-v1.2.0';
const RUNTIME_CACHE = 'peta-bicara-runtime-v1.2.0';

// Application Shell - static assets yang akan di-cache
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/scripts/styles/main.css',
  '/src/scripts/styles/home.css',
  '/src/scripts/styles/add-story.css',
  '/src/scripts/styles/auth.css',
  '/src/scripts/styles/components.css',
  '/src/scripts/app.js',
  '/src/scripts/utils/router.js',
  '/src/scripts/utils/camera-helper.js',
  '/src/scripts/api/api-service.js',
  '/src/scripts/model/story-model.js',
  '/src/scripts/view/app-view.js',
  '/src/scripts/view/pages/home-view.js',
  '/src/scripts/view/pages/add-story-view.js',
  '/src/scripts/view/pages/login-view.js',
  '/src/scripts/view/pages/register-view.js',
  '/src/scripts/view/pages/map-view.js',
  '/src/scripts/view/components/navbar.js',
  '/src/scripts/view/components/footer.js',
  '/src/scripts/view/components/story-card.js',
  '/src/scripts/presenter/app-presenter.js',
  '/src/scripts/presenter/pages/home-presenter.js',
  '/src/scripts/presenter/pages/add-story-presenter.js',
  '/src/scripts/presenter/pages/login-presenter.js',
  '/src/scripts/presenter/pages/register-presenter.js',
  '/src/scripts/presenter/pages/map-presenter.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Playfair+Display:wght@700&display=swap',
  '/offline.html',
  '/404.html'
];

// API endpoints yang akan di-cache
const API_CACHE_PATTERNS = [
  new RegExp('https://story-api\\.dicoding\\.dev/v1/stories.*'),
  new RegExp('https://fonts\\.(googleapis|gstatic)\\.com.*'),
  new RegExp('https://cdnjs\\.cloudflare\\.com.*')
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting())
      .catch((error) => console.error('Failed to cache app shell:', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  if (request.url.includes('/stories')) {
    event.respondWith(networkFirstStrategy(request));
  } else if (APP_SHELL.includes(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isApiCachePattern(request.url)) {
    event.respondWith(networkFirstStrategy(request));
  } else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Cache First Strategy - untuk static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') return caches.match('/offline.html');
    return caches.match(request);
  }
}

// Network First Strategy - untuk dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return caches.match('/404.html');
  }
}

// Check if URL matches API cache patterns
function isApiCachePattern(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: 'Ada cerita baru di Peta Bicara!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    actions: [
      { action: 'explore', title: 'Lihat Cerita' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Peta Bicara';
  }

  event.waitUntil(self.registration.showNotification('Peta Bicara', options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/#/'));
  }
});

// Background sync for offline story submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-story') {
    event.waitUntil(syncOfflineStories());
  }
});

// Sync offline stories when connection is restored
async function syncOfflineStories() {
  // Example: Sync stories from IndexedDB (you would need to implement IndexedDB logic)
  const offlineStories = await getOfflineStories();
  for (const story of offlineStories) {
    const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
      method: 'POST',
      body: story.formData
    });
    if (response.ok) await removeOfflineStory(story.id);
  }
}

// Helper functions for IndexedDB operations (simplified)
async function getOfflineStories() { return []; }
async function removeOfflineStory(id) { }
