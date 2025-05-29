// Build script to generate service worker with Workbox
const workboxBuild = require('workbox-build');

// This will generate a service worker with precaching
async function buildSW() {
  const {count, size, warnings} = await workboxBuild.generateSW({
    globDirectory: './',
    globPatterns: [
      'index.html',
      'manifest.json',
      'offline.html',
      '404.html',
      'src/**/*.{js,css}',
      'icons/*.png',
      'screenshots/*.png'
    ],
    globIgnores: [
      'node_modules/**/*',
      'build/**/*',
      '.git/**/*',
      '**/*.map'
    ],
    swDest: 'sw-generated.js',
    
    // Skip waiting
    skipWaiting: true,
    clientsClaim: true,
    
    // Runtime caching
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets'
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365
          }
        }
      },
      {
        urlPattern: /^https:\/\/cdnjs\.cloudflare\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-resources',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30
          }
        }
      },
      {
        urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/stories/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'story-api-cache',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7
          }
        }
      }
    ],
    
    // Navigation fallback
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
    
    // Manifest transformations
    manifestTransforms: [
      (manifestEntries) => {
        const manifest = manifestEntries.map(entry => {
          // Add cache busting
          const url = new URL(entry.url, 'https://example.com');
          url.searchParams.set('v', Date.now());
          entry.url = url.pathname + url.search;
          return entry;
        });
        return {manifest, warnings: []};
      }
    ]
  });

  console.log(`Generated sw-generated.js:`);
  console.log(`  - ${count} files will be precached`);
  console.log(`  - ${(size / 1024 / 1024).toFixed(2)} MB total`);
  
  if (warnings.length > 0) {
    console.warn('Warnings:', warnings);
  }
}

buildSW();