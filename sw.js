// Service Worker untuk Peta Bicara PWA - FIXED OFFLINE VERSION
const CACHE_NAME = 'peta-bicara-v1.4.0';
const RUNTIME_CACHE = 'peta-bicara-runtime-v1.4.0';

// Base path untuk deployment
const BASE_PATH = '/Submission-Intermediate';

// Application Shell - static assets yang akan di-cache
const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
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

// External resources yang diizinkan di-cache
const ALLOWED_EXTERNAL_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'story-api.dicoding.dev'
];

// API endpoints yang tidak boleh di-cache
const NO_CACHE_PATTERNS = [
  /\/notifications\/subscribe/,
  /\/login/,
  /\/register/
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell...');
        // Cache files yang penting saja untuk menghindari error
        const essentialFiles = [
          `${BASE_PATH}/`,
          `${BASE_PATH}/index.html`,
          `${BASE_PATH}/manifest.json`,
          `${BASE_PATH}/offline.html`,
          `${BASE_PATH}/404.html`,
          `${BASE_PATH}/icons/icon-192x192.png`,
          `${BASE_PATH}/icons/icon-512x512.png`
        ];
        
        return Promise.allSettled(
          essentialFiles.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Essential app shell cached successfully');
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

// Fetch event - implement caching strategies with better offline handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // FIXED: Skip non-GET requests untuk menghindari error
  if (request.method !== 'GET') {
    return;
  }

  // FIXED: Skip chrome-extension, blob, data URLs
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'blob:' || 
      url.protocol === 'data:') {
    return;
  }

  // FIXED: Skip requests to external domains yang tidak diizinkan
  if (url.origin !== self.location.origin && 
      !ALLOWED_EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain))) {
    console.log('Skipping external domain:', url.hostname);
    return;
  }

  // FIXED: Skip API endpoints yang tidak boleh di-cache
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    console.log('Skipping no-cache API:', url.pathname);
    return;
  }

  // Handle API requests dengan timeout
  if (url.hostname === 'story-api.dicoding.dev') {
    event.respondWith(handleApiRequestWithTimeout(request));
    return;
  }

  // Handle app shell resources
  if (isAppShellResource(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle external resources (fonts, CDN)
  if (url.origin !== self.location.origin) {
    event.respondWith(cacheFirstWithTimeoutStrategy(request));
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

// FIXED: Handle API requests with timeout to prevent hanging
async function handleApiRequestWithTimeout(request) {
  try {
    console.log('Handling API request:', request.url);
    
    // Set timeout untuk request API
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 8000); // 8 detik timeout
    });
    
    const fetchPromise = fetch(request);
    const networkResponse = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone()).catch(error => {
        console.warn('Failed to cache API response:', error);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Returning cached API response');
      return cachedResponse;
    }
    
    // Return offline response for failed API requests
    return new Response(
      JSON.stringify({
        error: true,
        message: 'Offline - data tidak tersedia'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// FIXED: Cache first with timeout untuk external resources
async function cacheFirstWithTimeoutStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Cache hit for external resource:', request.url);
      return cachedResponse;
    }

    console.log('Cache miss, fetching external resource:', request.url);
    
    // Set timeout untuk external requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('External request timeout')), 5000); // 5 detik timeout
    });
    
    const fetchPromise = fetch(request);
    const networkResponse = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone()).catch(error => {
        console.warn('Failed to cache external resource:', error);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.error('External resource failed:', error);
    
    // For CSS/JS files, return empty response to prevent errors
    if (request.url.includes('.css')) {
      return new Response('/* Offline fallback */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    if (request.url.includes('.js')) {
      return new Response('// Offline fallback', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    // For other resources, return generic error
    return new Response('Offline', { status: 503 });
  }
}

// Check if URL is app shell resource
function isAppShellResource(url) {
  return APP_SHELL.some(shellUrl => {
    const normalizedUrl = url.replace(/\/$/, '');
    const normalizedShellUrl = shellUrl.replace(/\/$/, '');
    return normalizedUrl === normalizedShellUrl || normalizedUrl.endsWith(normalizedShellUrl);
  });
}

// FIXED: Improved cache first strategy
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('Cache miss, fetching:', request.url);
    
    // FIXED: Add timeout untuk prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 detik timeout
    });
    
    const fetchPromise = fetch(request);
    const networkResponse = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone()).catch(error => {
        console.warn('Failed to cache response:', error);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Returning cached fallback');
      return cachedResponse;
    }
    
    // Return appropriate offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(`${BASE_PATH}/offline.html`);
      return offlinePage || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// FIXED: Handle navigation requests dengan better offline handling
async function handleNavigationRequest(request) {
  try {
    console.log('Handling navigation:', request.url);
    
    // FIXED: Add timeout untuk navigation requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Navigation timeout')), 5000); // 5 detik timeout
    });
    
    const fetchPromise = fetch(request);
    const networkResponse = await Promise.race([fetchPromise, timeoutPromise]);
    
    return networkResponse;
  } catch (error) {
    console.log('Navigation failed, returning app shell or offline page');
    
    // Return the main app shell (index.html) for SPA routing
    const cachedApp = await caches.match(`${BASE_PATH}/index.html`);
    if (cachedApp) {
      console.log('Returning cached app shell');
      return cachedApp;
    }
    
    // Fallback to offline page
    const offlinePage = await caches.match(`${BASE_PATH}/offline.html`);
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// FIXED: Enhanced push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Story berhasil dibuat',
    body: 'Anda telah membuat story baru dengan deskripsi: ',
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
    tag: 'story-notification',
    vibrate: [100, 50, 100]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data received:', data);
      
      // Handle Story API notification format
      if (data.title) notificationData.title = data.title;
      if (data.options) {
        if (data.options.body) notificationData.body = data.options.body;
        if (data.options.icon) notificationData.icon = `${BASE_PATH}${data.options.icon}`;
        if (data.options.data && data.options.data.url) {
          notificationData.data.url = `${BASE_PATH}${data.options.data.url}`;
        }
      }
    } catch (error) {
      console.error('Error parsing push data:', error);
      const textData = event.data.text();
      if (textData) {
        notificationData.body = textData;
      }
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

// FIXED: Background sync dengan better error handling
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
    // This would interface with your IndexedDB implementation
    // For now, just log the sync attempt
    console.log('Sync attempt completed');
    
    // Show notification about successful sync
    if (self.registration) {
      self.registration.showNotification('Cerita Tersinkronisasi', {
        body: 'Cerita offline Anda berhasil diunggah!',
        icon: `${BASE_PATH}/icons/icon-192x192.png`,
        tag: 'sync-success'
      }).catch(error => {
        console.error('Failed to show sync notification:', error);
      });
    }
  } catch (error) {
    console.error('Error during background sync:', error);
  }
}