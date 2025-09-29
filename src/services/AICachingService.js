/**
 * AI Response Caching Service
 * Provides intelligent caching for AI responses with multiple storage strategies
 * Optimizes performance and reduces API calls for free tier compliance
 */

class AICachingService {
  constructor() {
    // Cache storage strategies
    this.storageStrategies = {
      memory: new Map(), // In-memory cache (fastest)
      localStorage: 'localStorage', // Persistent browser storage
      sessionStorage: 'sessionStorage', // Session-based storage
      indexedDB: null // Advanced browser storage (if available)
    };

    // Cache configuration
    this.config = {
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours default
      maxMemorySize: 100, // Maximum items in memory cache
      maxLocalStorageSize: 5 * 1024 * 1024, // 5MB localStorage limit
      compressionThreshold: 1024, // Compress responses larger than 1KB
      enableCompression: true,
      enableFallback: true
    };

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      evictions: 0,
      compressionSavings: 0
    };

    this.initializeStorage();
  }

  /**
   * Initialize storage strategies
   */
  async initializeStorage() {
    try {
      // Check if IndexedDB is available
      if ('indexedDB' in window) {
        this.storageStrategies.indexedDB = await this.createIndexedDB();
      }

      // Initialize localStorage size monitoring
      this.monitorLocalStorageSize();

      console.log('AI Caching Service initialized with strategies:', 
        Object.keys(this.storageStrategies).filter(key => this.storageStrategies[key] !== null)
      );
    } catch (error) {
      console.warn('Failed to initialize advanced storage:', error);
    }
  }

  /**
   * Create IndexedDB for advanced caching
   */
  async createIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AICache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('responses')) {
          const store = db.createObjectStore('responses', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  /**
   * Generate cache key from request parameters
   */
  generateCacheKey(service, method, params, userId = null) {
    const keyData = {
      service,
      method,
      params: this.normalizeParams(params),
      userId
    };
    
    // Create deterministic hash
    const keyString = JSON.stringify(keyData);
    return this.hashString(keyString);
  }

  /**
   * Normalize parameters for consistent caching
   */
  normalizeParams(params) {
    if (!params) return {};
    
    // Sort object keys for consistent hashing
    const sorted = {};
    Object.keys(params).sort().forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        sorted[key] = typeof value === 'string' ? value.toLowerCase() : value;
      }
    });
    
    return sorted;
  }

  /**
   * Simple hash function for cache keys
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `ai_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Cache AI response with intelligent storage selection
   */
  async cacheResponse(key, response, options = {}) {
    const cacheItem = {
      key,
      response: this.compressResponse(response),
      timestamp: Date.now(),
      ttl: options.ttl || this.config.defaultTTL,
      size: this.calculateSize(response),
      metadata: {
        service: options.service || 'unknown',
        method: options.method || 'unknown',
        userId: options.userId || null,
        compressed: this.isCompressed(response)
      }
    };

    try {
      // Store in memory cache first (fastest access)
      await this.storeInMemory(key, cacheItem);
      
      // Store in persistent storage for durability
      await this.storePersistent(key, cacheItem);
      
      this.stats.writes++;
      this.cleanupIfNeeded();
      
      return true;
    } catch (error) {
      console.warn('Failed to cache response:', error);
      return false;
    }
  }

  /**
   * Retrieve cached response
   */
  async getCachedResponse(key) {
    try {
      // Try memory cache first (fastest)
      let cached = this.getFromMemory(key);
      
      if (cached && !this.isExpired(cached)) {
        this.stats.hits++;
        return this.decompressResponse(cached.response);
      }

      // Try persistent storage
      cached = await this.getFromPersistent(key);
      
      if (cached && !this.isExpired(cached)) {
        // Update memory cache
        await this.storeInMemory(key, cached);
        this.stats.hits++;
        return this.decompressResponse(cached.response);
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.warn('Failed to retrieve cached response:', error);
      return null;
    }
  }

  /**
   * Store in memory cache
   */
  async storeInMemory(key, cacheItem) {
    this.storageStrategies.memory.set(key, cacheItem);
    
    // Enforce memory cache size limit
    if (this.storageStrategies.memory.size > this.config.maxMemorySize) {
      this.evictOldestFromMemory();
    }
  }

  /**
   * Store in persistent storage
   */
  async storePersistent(key, cacheItem) {
    try {
      // Try localStorage first
      if (this.canUseLocalStorage()) {
        this.storeInLocalStorage(key, cacheItem);
        return;
      }

      // Fallback to IndexedDB
      if (this.storageStrategies.indexedDB) {
        await this.storeInIndexedDB(key, cacheItem);
        return;
      }

      // Fallback to sessionStorage
      this.storeInSessionStorage(key, cacheItem);
    } catch (error) {
      console.warn('Failed to store in persistent storage:', error);
    }
  }

  /**
   * Store in localStorage
   */
  storeInLocalStorage(key, cacheItem) {
    try {
      const serialized = JSON.stringify(cacheItem);
      
      // Check size before storing
      if (serialized.length > this.config.maxLocalStorageSize) {
        console.warn('Cache item too large for localStorage:', serialized.length);
        return;
      }
      
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  /**
   * Store in IndexedDB
   */
  async storeInIndexedDB(key, cacheItem) {
    if (!this.storageStrategies.indexedDB) return;
    
    try {
      const transaction = this.storageStrategies.indexedDB.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');
      await store.put(cacheItem);
    } catch (error) {
      console.warn('Failed to store in IndexedDB:', error);
    }
  }

  /**
   * Store in sessionStorage
   */
  storeInSessionStorage(key, cacheItem) {
    try {
      sessionStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to store in sessionStorage:', error);
    }
  }

  /**
   * Get from memory cache
   */
  getFromMemory(key) {
    return this.storageStrategies.memory.get(key);
  }

  /**
   * Get from persistent storage
   */
  async getFromPersistent(key) {
    try {
      // Try localStorage first
      if (this.canUseLocalStorage()) {
        const cached = localStorage.getItem(key);
        if (cached) return JSON.parse(cached);
      }

      // Try IndexedDB
      if (this.storageStrategies.indexedDB) {
        const cached = await this.getFromIndexedDB(key);
        if (cached) return cached;
      }

      // Try sessionStorage
      const cached = sessionStorage.getItem(key);
      if (cached) return JSON.parse(cached);
      
    } catch (error) {
      console.warn('Failed to retrieve from persistent storage:', error);
    }
    
    return null;
  }

  /**
   * Get from IndexedDB
   */
  async getFromIndexedDB(key) {
    if (!this.storageStrategies.indexedDB) return null;
    
    try {
      const transaction = this.storageStrategies.indexedDB.transaction(['responses'], 'readonly');
      const store = transaction.objectStore('responses');
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to retrieve from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Check if cache item is expired
   */
  isExpired(cacheItem) {
    return Date.now() - cacheItem.timestamp > cacheItem.ttl;
  }

  /**
   * Compress response if needed
   */
  compressResponse(response) {
    if (!this.config.enableCompression || !response) return response;
    
    const responseStr = JSON.stringify(response);
    
    if (responseStr.length < this.config.compressionThreshold) {
      return response;
    }

    try {
      // Simple compression for text-based responses
      const compressed = this.simpleCompress(responseStr);
      this.stats.compressionSavings += responseStr.length - compressed.length;
      return { compressed: true, data: compressed };
    } catch (error) {
      console.warn('Compression failed:', error);
      return response;
    }
  }

  /**
   * Decompress response if needed
   */
  decompressResponse(response) {
    if (!response || !response.compressed) return response;
    
    try {
      const decompressed = this.simpleDecompress(response.data);
      return JSON.parse(decompressed);
    } catch (error) {
      console.warn('Decompression failed:', error);
      return response;
    }
  }

  /**
   * Simple text compression (can be enhanced with better algorithms)
   */
  simpleCompress(text) {
    // Basic compression: remove extra whitespace and common patterns
    return text
      .replace(/\s+/g, ' ')
      .replace(/"([^"]+)":/g, (match, key) => {
        // Shorten common keys
        const shortKeys = { description: 'd', amount: 'a', category: 'c', date: 'dt' };
        return `"${shortKeys[key] || key}":`;
      });
  }

  /**
   * Simple text decompression
   */
  simpleDecompress(text) {
    // Reverse the compression
    return text
      .replace(/"d":/g, '"description":')
      .replace(/"a":/g, '"amount":')
      .replace(/"c":/g, '"category":')
      .replace(/"dt":/g, '"date":');
  }

  /**
   * Calculate response size
   */
  calculateSize(response) {
    return JSON.stringify(response).length;
  }

  /**
   * Check if response is compressed
   */
  isCompressed(response) {
    return response && typeof response === 'object' && response.compressed === true;
  }

  /**
   * Check if localStorage can be used
   */
  canUseLocalStorage() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Monitor localStorage size
   */
  monitorLocalStorageSize() {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalSize += localStorage[key].length;
        }
      }
      
      if (totalSize > this.config.maxLocalStorageSize * 0.8) {
        console.warn('localStorage usage high:', totalSize);
        this.cleanupOldest();
      }
    } catch (error) {
      console.warn('Failed to monitor localStorage size:', error);
    }
  }

  /**
   * Cleanup oldest cache items
   */
  cleanupOldest() {
    try {
      // Cleanup memory cache
      this.evictOldestFromMemory();
      
      // Cleanup localStorage
      this.cleanupLocalStorage();
      
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }

  /**
   * Evict oldest items from memory cache
   */
  evictOldestFromMemory() {
    const entries = Array.from(this.storageStrategies.memory.entries());
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of items
    const toRemove = Math.ceil(sorted.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.storageStrategies.memory.delete(sorted[i][0]);
      this.stats.evictions++;
    }
  }

  /**
   * Cleanup localStorage
   */
  cleanupLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('ai_'));
      
      if (cacheKeys.length === 0) return;
      
      // Get cache items and sort by timestamp
      const items = cacheKeys.map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, ...item };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      const sorted = items.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest items until under limit
      let totalSize = 0;
      for (let i = 0; i < sorted.length; i++) {
        totalSize += sorted[i].size || 0;
        if (totalSize > this.config.maxLocalStorageSize * 0.7) {
          localStorage.removeItem(sorted[i].key);
          this.stats.evictions++;
        }
      }
    } catch (error) {
      console.warn('localStorage cleanup failed:', error);
    }
  }

  /**
   * Cleanup if needed
   */
  cleanupIfNeeded() {
    // Cleanup every 100 operations
    if ((this.stats.writes + this.stats.hits) % 100 === 0) {
      this.cleanupOldest();
    }
  }

  /**
   * Clear all caches
   */
  async clearAll() {
    try {
      // Clear memory cache
      this.storageStrategies.memory.clear();
      
      // Clear localStorage
      if (this.canUseLocalStorage()) {
        const keys = Object.keys(localStorage);
        keys.filter(key => key.startsWith('ai_')).forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.filter(key => key.startsWith('ai_')).forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Clear IndexedDB
      if (this.storageStrategies.indexedDB) {
        const transaction = this.storageStrategies.indexedDB.transaction(['responses'], 'readwrite');
        const store = transaction.objectStore('responses');
        await store.clear();
      }
      
      // Reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        writes: 0,
        evictions: 0,
        compressionSavings: 0
      };
      
      console.log('All AI caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memorySize: this.storageStrategies.memory.size,
      compressionSavingsKB: Math.round(this.stats.compressionSavings / 1024)
    };
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      service: 'AI Caching Service',
      status: 'active',
      strategies: Object.keys(this.storageStrategies).filter(key => this.storageStrategies[key] !== null),
      config: this.config,
      stats: this.getStats()
    };
  }
}

export default new AICachingService();

