/**
 * Service Worker for Offline Support
 * Provides caching and offline functionality
 */

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Skip service worker in development mode
if (isDevelopment) {
  console.log('Service Worker disabled in development mode');
  self.skipWaiting();
  return;
}

const CACHE_NAME = 'home-hub-v1';
const STATIC_CACHE = 'home-hub-static-v1';
const DYNAMIC_CACHE = 'home-hub-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo.svg',
  '/favicon.ico'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/inventory/,
  /\/api\/spending/,
  /\/api\/recipes/,
  /\/api\/shopping/,
  /\/api\/users/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip HMR (Hot Module Replacement) files in development
  if (url.pathname.includes('hot-update') ||
    url.pathname.includes('webpack-dev-server') ||
    url.pathname.includes('sockjs-node') ||
    url.pathname.includes('__webpack_hmr')) {
    return;
  }

  // Skip development server files
  if (url.hostname === 'localhost' && url.port === '3000') {
    // Only cache static assets, not HMR files
    if (!url.pathname.startsWith('/static/') &&
      !url.pathname.endsWith('.js') &&
      !url.pathname.endsWith('.css') &&
      !url.pathname.endsWith('.json') &&
      !url.pathname.endsWith('.svg') &&
      !url.pathname.endsWith('.ico')) {
      return;
    }
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Determine which cache to use
            let cacheName = DYNAMIC_CACHE;
            if (STATIC_FILES.includes(url.pathname)) {
              cacheName = STATIC_CACHE;
            } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
              cacheName = DYNAMIC_CACHE;
            }

            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                cache.put(request, responseToCache);
                console.log('Cached response:', request.url);
              });

            return response;
          })
          .catch((error) => {
            console.error('Fetch failed:', request.url, error);

            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            }

            // Return cached API response if available
            if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
              return caches.match(request);
            }

            throw error;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-data-sync') {
    event.waitUntil(
      syncOfflineData()
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Home Hub',
    icon: '/logo.svg',
    badge: '/logo.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/logo.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Home Hub', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline data function
async function syncOfflineData() {
  try {
    console.log('Syncing offline data...');

    // Get all clients
    const clients = await self.clients.matchAll();

    // Send sync message to all clients
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_SYNC',
        data: { timestamp: Date.now() }
      });
    });
    
    console.log('Offline data sync completed');
  } catch (error) {
    console.error('Failed to sync offline data:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.addAll(urls))
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'offline-data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

console.log('Service Worker loaded');