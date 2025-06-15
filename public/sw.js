// Service Worker untuk Peta Bicara PWA - COMPLETE FIXED VERSION
const CACHE_NAME = 'peta-bicara-v1.3.0';
const RUNTIME_CACHE = 'peta-bicara-runtime-v1.3.0';

// Base path untuk deployment
const BASE_PATH = '/Submission-Intermediate';

// Application Shell - static assets yang akan di-cache
const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/src/scripts/styles/main.css`,
  `${BASE_PATH}/src/scripts/styles/home.css`,
  `${BASE_PATH}/src/scripts/styles/add-story.css`,
  `${BASE_PATH}/src/scripts/styles/auth.css`,
  `${BASE_PATH}/src/scripts/styles/components.css`,
  `${BASE_PATH}/src/scripts/app.js`,
  `${BASE_PATH}/src/scripts/utils/router.js`,
  `${BASE_PATH}/src/scripts/utils/camera-helper.js`,
  `${BASE_PATH}/src/scripts/utils/indexeddb-helper.js`,
  `${BASE_PATH}/src/scripts/utils/push-notification.js`,
  `${BASE_PATH}/src/scripts/utils/service-worker-register.js`,
  `${BASE_PATH}/src/scripts/utils/favorites-helper.js`,
  `${BASE_PATH}/src/scripts/utils/notification-ui-helper.js`,
  `${BASE_PATH}/src/scripts/api/api-service.js`,
  `${BASE_PATH}/src/scripts/model/story-model.js`,
  `${BASE_PATH}/src/scripts/view/app-view.js`,
  `${BASE_PATH}/src/scripts/view/pages/home-view.js`,
  `${BASE_PATH}/src/scripts/view/pages/add-story-view.js`,
  `${BASE_PATH}/src/scripts/view/pages/login-view.js`,
  `${BASE_PATH}/src/scripts/view/pages/register-view.js`,
  `${BASE_PATH}/src/scripts/view/pages/map-view.js`,
  `${BASE_PATH}/src/scripts/view/pages/favorites-view.js`,
  `${BASE_PATH}/src/scripts/view/pages/settings-view.js`,
  `${BASE_PATH}/src/scripts/view/components/navbar.js`,
  `${BASE_PATH}/src/scripts/view/components/footer.js`,
  `${BASE_PATH}/src/scripts/view/components/story-card.js`,
  `${BASE_PATH}/src/scripts/presenter/app-presenter.js`,
  `${BASE_PATH}/src/scripts/presenter/pages/home-presenter.js`,
  `${BASE_PATH}/src/scripts/presenter/pages/add-story-presenter.js`,
  `${BASE_PATH}/src/scripts/presenter/pages/login-presenter.js`,
  `${BASE_PATH}/src/scripts/presenter/pages/register-presenter.js`,
  `${BASE_PATH}/src/scripts/presenter/pages/map-presenter.js`,
  `${BASE_PATH}/src/scripts/presenter/pages/favorites-presenter.js`,
  `${BASE_PATH}/src/scripts/presenter/pages/settings-presenter.js`,
  // External resources
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Playfair+Display:wght@700&display=swap',
  // Offline pages
  `${BASE_PATH}/offline.html`,
  `${BASE_PATH}/404.html`,
  // Icons
  `${BASE_PATH}/favicon.ico`,
  `${BASE_PATH}/icons/icon-72x72.png`,
  `${BASE_PATH}/icons/icon-96x96.png`,
  `${BASE_PATH}/icons/icon-128x128.png`,
  `${BASE_PATH}/icons/icon-144x144.png`,
  `${BASE_PATH}/icons/icon-152x152.png`,
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-384x384.png`,
  `${BASE_PATH}/icons/icon-512x512.png`
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
        // Cache files satu per satu untuk avoid network errors
        return Promise.allSettled(
          APP_SHELL.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
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
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Handle API requests
  if (request.url.includes('/stories')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle app shell resources
  if (isAppShellResource(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle external API patterns
  if (isApiCachePattern(request.url)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default to cache first for everything else
  event.respondWith(cacheFirstStrategy(request));
});

// Check if URL is app shell resource
function isAppShellResource(url) {
  return APP_SHELL.some(shellUrl => {
    // Normalize URLs for comparison
    const normalizedUrl = url.replace(/\/$/, '');
    const normalizedShellUrl = shellUrl.replace(/\/$/, '');
    return normalizedUrl === normalizedShellUrl || normalizedUrl.endsWith(normalizedShellUrl);
  });
}

// Cache First Strategy - untuk static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(`${BASE_PATH}/offline.html`);
    }
    
    // Return 404 page for other requests
    return caches.match(`${BASE_PATH}/404.html`);
  }
}

// Network First Strategy - untuk dynamic content
async function networkFirstStrategy(request) {
  try {
    console.log('Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network first strategy failed:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Returning cached response for:', request.url);
      return cachedResponse;
    }
    
    // Return offline page for failed requests
    return caches.match(`${BASE_PATH}/404.html`);
  }
}

// Handle navigation requests (SPA routing)
async function handleNavigationRequest(request) {
  try {
    console.log('Handling navigation:', request.url);
    
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation failed, returning app shell');
    
    // Return the main app shell (index.html) for SPA routing
    const cachedApp = await caches.match(`${BASE_PATH}/index.html`);
    if (cachedApp) return cachedApp;
    
    // Fallback to offline page
    return caches.match(`${BASE_PATH}/offline.html`);
  }
}

// Check if URL matches API cache patterns
function isApiCachePattern(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Peta Bicara',
    body: 'Ada cerita baru di Peta Bicara!',
    icon: `${BASE_PATH}/icons/icon-192x192.png`,
    badge: `${BASE_PATH}/icons/icon-72x72.png`,
    data: {
      url: `${BASE_PATH}/`,
      timestamp: Date.now()
    },
    actions: [
      { 
        action: 'open', 
        title: 'Buka App',
        icon: `${BASE_PATH}/icons/icon-72x72.png`
      },
      { 
        action: 'close', 
        title: 'Tutup' 
      }
    ],
    requireInteraction: false,
    silent: false,
    tag: 'peta-bicara-push',
    vibrate: [100, 50, 100]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData.title = data.title || notificationData.title;
      notificationData.body = data.body || notificationData.body;
      if (data.icon) notificationData.icon = `${BASE_PATH}${data.icon}`;
      if (data.url) notificationData.data.url = `${BASE_PATH}${data.url}`;
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
      tag: notificationData.tag,
      vibrate: notificationData.vibrate
    }).then(() => {
      console.log('Push notification displayed successfully');
    }).catch((error) => {
      console.error('Error showing push notification:', error);
    })
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || `${BASE_PATH}/`;
  
  if (action === 'close') {
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
        const baseUrl = new URL(self.location.origin + BASE_PATH);
        
        if (clientUrl.pathname.startsWith(baseUrl.pathname) && 'focus' in client) {
          console.log('Focusing existing window');
          
          // Navigate to target URL if different
          if (targetUrl !== `${BASE_PATH}/`) {
            client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl
            });
          }
          return client.focus();
        }
      }
      
      // No existing window found, open a new one
      console.log('Opening new window:', targetUrl);
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
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
            icon: `${BASE_PATH}/icons/icon-192x192.png`,
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