/**
 * Offline Service
 * Handles offline capabilities, caching, and data synchronization
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import loggingService from './LoggingService.js';

/**
 * IndexedDB schema for offline storage
 */
const DB_NAME = 'HomeHubOffline';
const DB_VERSION = 1;

const stores = {
  CACHE: 'cache',
  SYNC_QUEUE: 'syncQueue',
  OFFLINE_DATA: 'offlineData',
  USER_PREFERENCES: 'userPreferences',
  ASSETS: 'assets'
};

const dbSchema = {
  [stores.CACHE]: '++id, key, data, timestamp, expiresAt',
  [stores.SYNC_QUEUE]: '++id, operation, collection, docId, data, timestamp, retryCount',
  [stores.OFFLINE_DATA]: '++id, collection, docId, data, timestamp, synced',
  [stores.USER_PREFERENCES]: '++id, key, value, timestamp',
  [stores.ASSETS]: '++id, url, data, timestamp, expiresAt'
};

class OfflineService {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncInterval = null;
    this.retryDelay = 5000; // 5 seconds
    this.maxRetries = 3;
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    this.init();
    this.setupEventListeners();
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create stores
          Object.entries(stores).forEach(([key, storeName]) => {
            if (!db.objectStoreNames.contains(storeName)) {
              const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
              
              // Create indexes
              if (storeName === stores.CACHE) {
                store.createIndex('key', 'key', { unique: true });
                store.createIndex('expiresAt', 'expiresAt');
              } else if (storeName === stores.SYNC_QUEUE) {
                store.createIndex('operation', 'operation');
                store.createIndex('collection', 'collection');
                store.createIndex('timestamp', 'timestamp');
              } else if (storeName === stores.OFFLINE_DATA) {
                store.createIndex('collection', 'collection');
                store.createIndex('docId', 'docId');
                store.createIndex('synced', 'synced');
              }
            }
          });
        }
      });

      loggingService.info('Offline service initialized successfully');
      this.startSyncInterval();
    } catch (error) {
      loggingService.error('Failed to initialize offline service', { error: error.message });
    }
  }

  /**
   * Setup event listeners for online/offline status
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      loggingService.info('Connection restored - starting sync');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      loggingService.info('Connection lost - switching to offline mode');
    });

    // Listen for visibility change to sync when tab becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineData();
      }
    });
  }

  /**
   * Cache data with expiration
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  async cacheData(key, data, ttl = this.cacheExpiry) {
    try {
      if (!this.db) return;

      const expiresAt = Date.now() + ttl;
      await this.db.put(stores.CACHE, {
        key,
        data,
        timestamp: Date.now(),
        expiresAt
      });

      loggingService.debug('Data cached', { key, ttl });
    } catch (error) {
      loggingService.error('Failed to cache data', { key, error: error.message });
    }
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any} Cached data or null
   */
  async getCachedData(key) {
    try {
      if (!this.db) return null;

      const cached = await this.db.get(stores.CACHE, key);
      if (!cached) return null;

      // Check if expired
      if (Date.now() > cached.expiresAt) {
        await this.db.delete(stores.CACHE, key);
        return null;
      }

      return cached.data;
    } catch (error) {
      loggingService.error('Failed to get cached data', { key, error: error.message });
      return null;
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache() {
    try {
      if (!this.db) return;

      const now = Date.now();
      const tx = this.db.transaction(stores.CACHE, 'readwrite');
      const store = tx.objectStore(stores.CACHE);
      const index = store.index('expiresAt');
      
      const range = IDBKeyRange.upperBound(now);
      const expired = await index.getAll(range);
      
      for (const item of expired) {
        await store.delete(item.id);
      }

      loggingService.info('Cleared expired cache entries', { count: expired.length });
    } catch (error) {
      loggingService.error('Failed to clear expired cache', { error: error.message });
    }
  }

  /**
   * Add operation to sync queue
   * @param {string} operation - Operation type (create, update, delete)
   * @param {string} collection - Firestore collection
   * @param {string} docId - Document ID
   * @param {any} data - Document data
   */
  async addToSyncQueue(operation, collection, docId, data = null) {
    try {
      if (!this.db) return;

      await this.db.add(stores.SYNC_QUEUE, {
        operation,
        collection,
        docId,
        data,
        timestamp: Date.now(),
        retryCount: 0
      });

      loggingService.debug('Added to sync queue', { operation, collection, docId });

      // Try to sync immediately if online
      if (this.isOnline) {
        this.syncOfflineData();
      }
    } catch (error) {
      loggingService.error('Failed to add to sync queue', { 
        operation, 
        collection, 
        docId, 
        error: error.message 
      });
    }
  }

  /**
   * Store data offline
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {any} data - Document data
   */
  async storeOfflineData(collection, docId, data) {
    try {
      if (!this.db) return;

      await this.db.put(stores.OFFLINE_DATA, {
        collection,
        docId,
        data,
        timestamp: Date.now(),
        synced: false
      });

      loggingService.debug('Data stored offline', { collection, docId });
    } catch (error) {
      loggingService.error('Failed to store offline data', { 
        collection, 
        docId, 
        error: error.message 
      });
    }
  }

  /**
   * Get offline data
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {any} Offline data or null
   */
  async getOfflineData(collection, docId) {
    try {
      if (!this.db) return null;

      const tx = this.db.transaction(stores.OFFLINE_DATA, 'readonly');
      const store = tx.objectStore(stores.OFFLINE_DATA);
      const index = store.index('collection');
      
      const items = await index.getAll(collection);
      const item = items.find(item => item.docId === docId);
      
      return item ? item.data : null;
    } catch (error) {
      loggingService.error('Failed to get offline data', { 
        collection, 
        docId, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Get all offline data for a collection
   * @param {string} collection - Collection name
   * @returns {Array} Array of offline data
   */
  async getAllOfflineData(collection) {
    try {
      if (!this.db) return [];

      const tx = this.db.transaction(stores.OFFLINE_DATA, 'readonly');
      const store = tx.objectStore(stores.OFFLINE_DATA);
      const index = store.index('collection');
      
      const items = await index.getAll(collection);
      return items.map(item => ({
        id: item.docId,
        ...item.data
      }));
    } catch (error) {
      loggingService.error('Failed to get all offline data', { 
        collection, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Sync offline data with Firestore
   */
  async syncOfflineData() {
    if (!this.isOnline || this.syncInProgress || !this.db) return;

    this.syncInProgress = true;
    loggingService.info('Starting offline data sync');

    try {
      // Sync sync queue
      await this.syncQueue();
      
      // Sync offline data
      await this.syncOfflineCollections();
      
      // Clear expired cache
      await this.clearExpiredCache();

      loggingService.info('Offline data sync completed successfully');
    } catch (error) {
      loggingService.error('Failed to sync offline data', { error: error.message });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync sync queue with Firestore
   */
  async syncQueue() {
    try {
      const tx = this.db.transaction(stores.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(stores.SYNC_QUEUE);
      const items = await store.getAll();

      for (const item of items) {
        try {
          await this.processSyncItem(item);
          await store.delete(item.id);
        } catch (error) {
          item.retryCount++;
          if (item.retryCount >= this.maxRetries) {
            loggingService.error('Max retries reached for sync item', { 
              id: item.id, 
              operation: item.operation 
            });
            await store.delete(item.id);
          } else {
            await store.put(item);
          }
        }
      }
    } catch (error) {
      loggingService.error('Failed to sync queue', { error: error.message });
    }
  }

  /**
   * Process individual sync item
   * @param {Object} item - Sync queue item
   */
  async processSyncItem(item) {
    const { operation, collection, docId, data } = item;
    const db = getFirestore();
    const docRef = doc(db, collection, docId);

    switch (operation) {
      case 'create':
        await setDoc(docRef, data);
        break;
      case 'update':
        await updateDoc(docRef, data);
        break;
      case 'delete':
        await deleteDoc(docRef);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    loggingService.debug('Sync item processed', { operation, collection, docId });
  }

  /**
   * Sync offline collections
   */
  async syncOfflineCollections() {
    try {
      const tx = this.db.transaction(stores.OFFLINE_DATA, 'readwrite');
      const store = tx.objectStore(stores.OFFLINE_DATA);
      const items = await store.getAll();

      for (const item of items) {
        if (!item.synced) {
          try {
            await this.processSyncItem({
              operation: 'create',
              collection: item.collection,
              docId: item.docId,
              data: item.data
            });

            item.synced = true;
            await store.put(item);
          } catch (error) {
            loggingService.error('Failed to sync offline item', { 
              collection: item.collection, 
              docId: item.docId, 
              error: error.message 
            });
          }
        }
      }
    } catch (error) {
      loggingService.error('Failed to sync offline collections', { error: error.message });
    }
  }

  /**
   * Start sync interval
   */
  startSyncInterval() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncOfflineData();
      }
    }, 30000); // Sync every 30 seconds
  }

  /**
   * Stop sync interval
   */
  stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Get sync status
   * @returns {Object} Sync status information
   */
  async getSyncStatus() {
    try {
      if (!this.db) return { queueSize: 0, offlineDataSize: 0 };

      const queueTx = this.db.transaction(stores.SYNC_QUEUE, 'readonly');
      const queueSize = await queueTx.objectStore(stores.SYNC_QUEUE).count();

      const offlineTx = this.db.transaction(stores.OFFLINE_DATA, 'readonly');
      const offlineDataSize = await offlineTx.objectStore(stores.OFFLINE_DATA).count();

      return {
        isOnline: this.isOnline,
        syncInProgress: this.syncInProgress,
        queueSize,
        offlineDataSize,
        lastSync: Date.now()
      };
    } catch (error) {
      loggingService.error('Failed to get sync status', { error: error.message });
      return { queueSize: 0, offlineDataSize: 0 };
    }
  }

  /**
   * Clear all offline data
   */
  async clearAllOfflineData() {
    try {
      if (!this.db) return;

      const tx = this.db.transaction([stores.SYNC_QUEUE, stores.OFFLINE_DATA], 'readwrite');
      await tx.objectStore(stores.SYNC_QUEUE).clear();
      await tx.objectStore(stores.OFFLINE_DATA).clear();

      loggingService.info('All offline data cleared');
    } catch (error) {
      loggingService.error('Failed to clear offline data', { error: error.message });
    }
  }

  /**
   * Download data for offline use
   * @param {string} collection - Collection name
   * @param {Object} filters - Query filters
   */
  async downloadForOffline(collection, filters = {}) {
    try {
      if (!this.isOnline) return;

      const db = getFirestore();
      const collectionRef = collection(db, collection);
      
      let q = collectionRef;
      if (filters.where) {
        q = query(collectionRef, where(filters.where.field, filters.where.operator, filters.where.value));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Store in offline data
      for (const item of data) {
        await this.storeOfflineData(collection, item.id, item);
      }

      // Cache the data
      await this.cacheData(`offline_${collection}`, data);

      loggingService.info('Data downloaded for offline use', { collection, count: data.length });
      return data;
    } catch (error) {
      loggingService.error('Failed to download data for offline', { 
        collection, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Check if data is available offline
   * @param {string} collection - Collection name
   * @returns {boolean} True if data is available offline
   */
  async isDataAvailableOffline(collection) {
    try {
      if (!this.db) return false;

      const tx = this.db.transaction(stores.OFFLINE_DATA, 'readonly');
      const store = tx.objectStore(stores.OFFLINE_DATA);
      const index = store.index('collection');
      
      const items = await index.getAll(collection);
      return items.length > 0;
    } catch (error) {
      loggingService.error('Failed to check offline data availability', { 
        collection, 
        error: error.message 
      });
      return false;
    }
  }
}

const offlineService = new OfflineService();
export default offlineService;




