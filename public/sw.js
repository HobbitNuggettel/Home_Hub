// Service Worker for Home Hub PWA
const CACHE_NAME = 'home-hub-v1.3.0';
const STATIC_CACHE = 'home-hub-static-v1.0.0';
const DYNAMIC_CACHE = 'home-hub-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg'
];

// API endpoints to cache
const API_CACHE = [
  '/api/inventory',
  '/api/spending',
  '/api/users',
  '/api/households'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static files - serve from cache first
    if (STATIC_FILES.includes(url.pathname)) {
      event.respondWith(
        caches.match(request)
          .then((response) => {
            return response || fetch(request);
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('/offline.html');
          })
      );
    }
    // API requests - network first, then cache
    else if (API_CACHE.some(api => url.pathname.startsWith(api))) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Clone the response to cache it
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return response;
          })
          .catch(() => {
            // Return cached response if available
            return caches.match(request);
          })
      );
    }
    // Other requests - network first
    else {
      event.respondWith(
        fetch(request)
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          })
      );
    }
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Process any pending offline actions
      processOfflineActions()
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Home Hub',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Home Hub', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_DATA') {
    event.waitUntil(
      cacheData(event.data.key, event.data.value)
    );
  }
});

// Cache data for offline use
async function cacheData(key, value) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(value), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(key, response);
    console.log('Service Worker: Data cached:', key);
  } catch (error) {
    console.error('Service Worker: Error caching data:', error);
  }
}

// Process offline actions when back online
async function processOfflineActions() {
  try {
    // Get pending offline actions from IndexedDB or localStorage
    const pendingActions = await getPendingOfflineActions();
    
    for (const action of pendingActions) {
      try {
        // Process the action
        await processOfflineAction(action);
        // Remove from pending list
        await removePendingOfflineAction(action.id);
      } catch (error) {
        console.error('Service Worker: Error processing offline action:', error);
      }
    }
    
    console.log('Service Worker: Offline actions processed');
  } catch (error) {
    console.error('Service Worker: Error processing offline actions:', error);
  }
}

// Get pending offline actions (mock implementation)
async function getPendingOfflineActions() {
  // In a real app, this would read from IndexedDB
  return [];
}

// Process a single offline action (mock implementation)
async function processOfflineAction(action) {
  // In a real app, this would make API calls
  console.log('Service Worker: Processing offline action:', action);
}

// Remove pending offline action (mock implementation)
async function removePendingOfflineAction(actionId) {
  // In a real app, this would remove from IndexedDB
  console.log('Service Worker: Removing offline action:', actionId);
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
      event.waitUntil(
        // Sync data periodically
        syncData()
      );
    }
  });
}

// Sync data with server
async function syncData() {
  try {
    console.log('Service Worker: Syncing data with server...');
    
    // In a real app, this would sync local changes with the server
    // For now, just log the sync attempt
    
    console.log('Service Worker: Data sync completed');
  } catch (error) {
    console.error('Service Worker: Error syncing data:', error);
  }
}

// Handle offline/online status changes
self.addEventListener('online', () => {
  console.log('Service Worker: App is online');
  // Trigger background sync when back online
  self.registration.sync.register('background-sync');
});

self.addEventListener('offline', () => {
  console.log('Service Worker: App is offline');
});

console.log('Service Worker: Loaded successfully'); 