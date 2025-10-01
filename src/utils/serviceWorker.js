/**
 * Service Worker Registration and Management
 * Handles PWA installation and offline capabilities
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

const PUBLIC_URL = process.env.PUBLIC_URL || '';

// Service Worker registration
export function register(config) {
  // Skip service worker registration in development mode
  if (isDevelopment()) {
    console.log('Service Worker registration skipped in development mode');
    return;
  }

  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker === null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://cra.link/PWA.'
              );
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType !== null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// PWA Installation and Management Functions

// Check if app is installable
export function isAppInstallable() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Check if app is already installed
export function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

// Show install prompt
export async function showInstallPrompt() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

// Update app
export async function updateApp() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

// Clear cache
export async function clearCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
}

// Get cache status
export async function getCacheStatus() {
  if (!('caches' in window)) return {};
  
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

// Send notification
export function sendNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    // eslint-disable-next-line no-new
    new Notification(title, {
      icon: '/logo.svg',
      badge: '/logo.svg',
      ...options
    });
  }
}

// Initialize PWA features
export function initializePWA() {
  // Skip PWA initialization in development mode
  if (isDevelopment()) {
    console.log('PWA initialization skipped in development mode');
    return;
  }

  // Register service worker
  register({
    onSuccess: () => {
      console.log('PWA initialized successfully');
    },
    onUpdate: (registration) => {
      console.log('PWA update available');
      // Dispatch custom event for update notification
      window.dispatchEvent(new CustomEvent('sw-update-available', { 
        detail: { registration } 
      }));
    }
  });

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    // Store the event for later use
    window.deferredPrompt = e;
  });

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    // Clear the deferred prompt
    window.deferredPrompt = null;
  });

  // Listen for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

// Background sync
export function registerBackgroundSync(tag, callback) {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(tag);
    }).then(() => {
      console.log('Background sync registered:', tag);
      if (callback) callback();
    }).catch((error) => {
      console.error('Background sync registration failed:', error);
    });
  }
}

// Push notification subscription
export async function subscribeToPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });
      
      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
  return null;
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push unsubscription successful');
        return true;
      }
    } catch (error) {
      console.error('Push unsubscription failed:', error);
    }
  }
  return false;
}

// Get push subscription
export async function getPushSubscription() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Get push subscription failed:', error);
      return null;
    }
  }
  return null;
}

// Check if push notifications are supported
export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Check if background sync is supported
export function isBackgroundSyncSupported() {
  return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
}

// Check if notifications are supported
export function isNotificationSupported() {
  return 'Notification' in window;
}

// Get notification permission status
export function getNotificationPermission() {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

// Check if app is running in standalone mode
export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Check if app is running on mobile
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if app is running on iOS
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Check if app is running on Android
export function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

// Get device type
export function getDeviceType() {
  if (isMobile()) {
    return 'mobile';
  } else if (window.innerWidth <= 768) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// Get connection status
export function getConnectionStatus() {
  if ('navigator' in window && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

// Listen for connection changes
export function onConnectionChange(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}

// Get storage quota
export async function getStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage
      };
    } catch (error) {
      console.error('Get storage quota failed:', error);
      return null;
    }
  }
  return null;
}

// Request persistent storage
export async function requestPersistentStorage() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const persistent = await navigator.storage.persist();
      console.log('Persistent storage granted:', persistent);
      return persistent;
    } catch (error) {
      console.error('Persistent storage request failed:', error);
      return false;
    }
  }
  return false;
}

// Check if persistent storage is available
export async function isPersistentStorageAvailable() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      return await navigator.storage.persisted();
    } catch (error) {
      console.error('Check persistent storage failed:', error);
      return false;
    }
  }
  return false;
}

// Get app version
export function getAppVersion() {
  return process.env.REACT_APP_VERSION || '1.0.0';
}

// Get build date
export function getBuildDate() {
  return process.env.REACT_APP_BUILD_DATE || new Date().toISOString();
}

// Get environment
export function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

// Check if running in development
export function isDevelopment() {
  return getEnvironment() === 'development';
}

// Check if running in production
export function isProduction() {
  return getEnvironment() === 'production';
}

// Check if running in test
export function isTest() {
  return getEnvironment() === 'test';
}

// Get app name
export function getAppName() {
  return process.env.REACT_APP_NAME || 'Home Hub';
}

// Get app description
export function getAppDescription() {
  return process.env.REACT_APP_DESCRIPTION || 'Smart Home Management Platform';
}

// Get app URL
export function getAppUrl() {
  return process.env.REACT_APP_URL || window.location.origin;
}

// Get API URL
export function getApiUrl() {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
}

// Get Firebase config
export function getFirebaseConfig() {
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };
}

// Check if Firebase is configured
export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Object.values(config).every(value => value && value !== 'undefined');
}

// Get VAPID public key
export function getVapidPublicKey() {
  return process.env.REACT_APP_VAPID_PUBLIC_KEY;
}

// Check if VAPID is configured
export function isVapidConfigured() {
  return !!getVapidPublicKey();
}

// Get app theme
export function getAppTheme() {
  return localStorage.getItem('theme') || 'light';
}

// Set app theme
export function setAppTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

// Get app language
export function getAppLanguage() {
  return localStorage.getItem('language') || 'en';
}

// Set app language
export function setAppLanguage(language) {
  localStorage.setItem('language', language);
  document.documentElement.setAttribute('lang', language);
}

// Get user preferences
export function getUserPreferences() {
  const preferences = localStorage.getItem('userPreferences');
  return preferences ? JSON.parse(preferences) : {};
}

// Set user preferences
export function setUserPreferences(preferences) {
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Get app settings
export function getAppSettings() {
  const settings = localStorage.getItem('appSettings');
  return settings ? JSON.parse(settings) : {};
}

// Set app settings
export function setAppSettings(settings) {
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

// Clear all app data
export function clearAppData() {
  localStorage.clear();
  sessionStorage.clear();
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
}

// Export all functions
export default {
  register,
  unregister,
  isAppInstallable,
  isAppInstalled,
  showInstallPrompt,
  updateApp,
  clearCache,
  getCacheStatus,
  requestNotificationPermission,
  sendNotification,
  initializePWA,
  registerBackgroundSync,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
  isPushNotificationSupported,
  isBackgroundSyncSupported,
  isNotificationSupported,
  getNotificationPermission,
  isStandalone,
  isMobile,
  isIOS,
  isAndroid,
  getDeviceType,
  getConnectionStatus,
  onConnectionChange,
  getStorageQuota,
  requestPersistentStorage,
  isPersistentStorageAvailable,
  getAppVersion,
  getBuildDate,
  getEnvironment,
  isDevelopment,
  isProduction,
  isTest,
  getAppName,
  getAppDescription,
  getAppUrl,
  getApiUrl,
  getFirebaseConfig,
  isFirebaseConfigured,
  getVapidPublicKey,
  isVapidConfigured,
  getAppTheme,
  setAppTheme,
  getAppLanguage,
  setAppLanguage,
  getUserPreferences,
  setUserPreferences,
  getAppSettings,
  setAppSettings,
  clearAppData
};