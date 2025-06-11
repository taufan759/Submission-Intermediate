// Workbox configuration for build process
module.exports = {
  globDirectory: './',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,gif,svg,ico,webp,json,woff,woff2,ttf,eot}'
  ],
  globIgnores: [
    'node_modules/**/*',
    'sw.js',
    'workbox-config.js',
    'package*.json',
    '.git/**/*',
    '.gitignore',
    'README.md',
    'STUDENT.txt',
    '**/*.map'
  ],
  swDest: 'sw-generated.js',
  
  // Define runtime caching rules
  runtimeCaching: [
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    
    // Cache CDN resources
    {
      urlPattern: /^https:\/\/cdnjs\.cloudflare\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cdn-resources',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    
    // Cache story API responses
    {
      urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/stories/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'story-api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    
    // Cache images from API
    {
      urlPattern: /^https:\/\/story-api\.dicoding\.dev\/images/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'story-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ],
  
  // Skip waiting and claim clients
  skipWaiting: true,
  clientsClaim: true,
  
  // Navigation fallback for SPA
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
};