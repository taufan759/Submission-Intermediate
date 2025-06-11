// Service Worker untuk Peta Bicara PWA - UPDATED
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
  '/src/scripts/utils/indexeddb-helper.js',
  '/src/scripts/utils/push-notification.js',
  '/src/scripts/utils/service-worker-register.js',
  '/src/scripts/utils/favorites-helper.js',
  '/src/scripts/utils/notification-ui-helper.js',
  '/src/scripts/api/api-service.js',
  '/src/scripts/model/story-model.js',
  '/src/scripts/view/app-view.js',
  '/src/scripts/view/pages/home-view.js',
  '/src/scripts/view/pages/add-story-view.js',
  '/src/scripts/view/pages/login-view.js',
  '/src/scripts/view/pages/register-view.js',
  '/src/scripts/view/pages/map-view.js',
  '/src/scripts/view/pages/favorites-view.js',
  '/src/scripts/view/pages/settings-view.js',
  '/src/scripts/view/components/navbar.js',
  '/src/scripts/view/components/footer.js',
  '/src/scripts/view/components/story-card.js',
  '/src/scripts/presenter/app-presenter.js',
  '/src/scripts/presenter/pages/home-presenter.js',
  '/src/scripts/presenter/pages/add-story-presenter.js',
  '/src/scripts/presenter/pages/login-presenter.js',
  '/src/scripts/presenter/pages/register-presenter.js',
  '/src/scripts/presenter/pages/map-presenter.js',
  '/src/scripts/presenter/pages/favorites-presenter.js',
  '/src/scripts/presenter/pages/settings-presenter.js',
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
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell...');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('App shell cached successfully');
        self.skipWaiting();
      })
      .catch((error) => console.error('Failed to cache app shell:', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      self.clients.claim();
    })
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

// UPDATED Push notification event handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Peta Bicara',
    body: 'Ada cerita baru di Peta Bicara!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      { 
        action: 'open', 
        title: 'Buka App',
        icon: '/favicon.ico'
      },
      { 
        action: 'close', 
        title: 'Tutup' 
      }
    ],
    requireInteraction: false,
    silent: false,
    tag: 'peta-bicara-push'
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData.title = data.title || notificationData.title;
      notificationData.body = data.body || notificationData.body;
      if (data.icon) notificationData.icon = data.icon;
      if (data.url) notificationData.data.url = data.url;
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      tag: notificationData.tag
    }).then(() => {
      console.log('Push notification displayed successfully');
    }).catch((error) => {
      console.error('Error showing push notification:', error);
    })
  );
});

// UPDATED Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';
  
  if (action === 'close') {
    // User clicked close, just close the notification
    console.log('User chose to close notification');
    return;
  }
  
  // For 'open' action or clicking the notification body
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        const currentUrl = new URL(self.location.origin);
        
        if (clientUrl.origin === currentUrl.origin && 'focus' in client) {
          console.log('Focusing existing window');
          // Navigate to target URL if different
          if (targetUrl !== '/') {
            client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl
            });
          }
          return client.focus();
        }
      }
      
      // No existing window found, open a new one
      console.log('Opening new window:', self.location.origin + targetUrl);
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + targetUrl);
      }
    }).catch((error) => {
      console.error('Error handling notification click:', error);
    })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING, calling skipWaiting()');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Background sync for offline story submissions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-story') {
    event.waitUntil(syncOfflineStories());
  }
});

// Sync offline stories when connection is restored
async function syncOfflineStories() {
  console.log('Syncing offline stories...');
  try {
    // Get offline stories from IndexedDB
    const offlineStories = await getOfflineStories();
    console.log('Found offline stories:', offlineStories.length);
    
    for (const story of offlineStories) {
      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${story.token}`
          },
          body: story.formData
        });
        
        if (response.ok) {
          await removeOfflineStory(story.id);
          console.log('Offline story synced successfully:', story.id);
          
          // Show notification about successful sync
          self.registration.showNotification('Cerita Tersinkronisasi', {
            body: 'Cerita offline Anda berhasil diunggah!',
            icon: '/favicon.ico',
            tag: 'sync-success'
          });
        }
      } catch (error) {
        console.error('Failed to sync story:', story.id, error);
      }
    }
  } catch (error) {
    console.error('Error during background sync:', error);
  }
}

// Helper functions for IndexedDB operations (simplified)
async function getOfflineStories() { 
  // This would interface with IndexedDB to get offline stories
  // For now, return empty array
  return []; 
}

async function removeOfflineStory(id) { 
  // This would remove the story from IndexedDB after successful sync
  console.log('Removing offline story:', id);
}