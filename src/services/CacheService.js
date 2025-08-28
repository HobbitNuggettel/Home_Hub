// Advanced Caching Service with Redis-like Features
import { cacheManager } from '../utils/performance';

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0
    };
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  // Set cache with TTL
  set(key, value, ttl = 300000) { // 5 minutes default
    const expiry = Date.now() + ttl;
    
    this.cache.set(key, value);
    this.ttlMap.set(key, expiry);
    this.stats.sets++;
    this.stats.size = this.cache.size;
    
    // Auto-expire
    setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    return true;
  }

  // Get cache value
  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }
    
    const expiry = this.ttlMap.get(key);
    if (expiry && expiry <= Date.now()) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return this.cache.get(key);
  }

  // Delete cache entry
  delete(key) {
    const existed = this.cache.has(key);
    if (existed) {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return existed;
  }

  // Check if key exists
  has(key) {
    if (!this.cache.has(key)) return false;
    
    const expiry = this.ttlMap.get(key);
    if (expiry && expiry <= Date.now()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache statistics
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Get memory usage
  getMemoryUsage() {
    if (performance && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576 * 100) / 100,
        total: Math.round(performance.memory.totalJSHeapSize / 1048576 * 100) / 100,
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576 * 100) / 100
      };
    }
    return null;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttlMap.clear();
    this.stats.sets = 0;
    this.stats.deletes = 0;
    this.stats.size = 0;
  }

  // Get all keys
  keys() {
    const validKeys = [];
    for (const [key, expiry] of this.ttlMap.entries()) {
      if (expiry > Date.now()) {
        validKeys.push(key);
      }
    }
    return validKeys;
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Start cleanup interval
  startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, expiry] of this.ttlMap.entries()) {
      if (expiry <= now) {
        this.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Cache with intelligent invalidation
  cacheWithInvalidation(key, value, ttl = 300000, invalidationTags = []) {
    const cacheEntry = {
      value,
      timestamp: Date.now(),
      invalidationTags,
      ttl
    };
    
    this.set(key, cacheEntry, ttl);
    
    // Store invalidation tags
    invalidationTags.forEach(tag => {
      if (!this.invalidationMap) this.invalidationMap = new Map();
      if (!this.invalidationMap.has(tag)) {
        this.invalidationMap.set(tag, new Set());
      }
      this.invalidationMap.get(tag).add(key);
    });
  }

  // Invalidate by tag
  invalidateByTag(tag) {
    if (!this.invalidationMap || !this.invalidationMap.has(tag)) return 0;
    
    const keysToInvalidate = this.invalidationMap.get(tag);
    let invalidated = 0;
    
    keysToInvalidate.forEach(key => {
      if (this.delete(key)) {
        invalidated++;
      }
    });
    
    this.invalidationMap.delete(tag);
    return invalidated;
  }

  // Invalidate multiple tags
  invalidateByTags(tags) {
    return tags.reduce((total, tag) => total + this.invalidateByTag(tag), 0);
  }

  // Cache with callback (lazy loading)
  async cacheWithCallback(key, callback, ttl = 300000, invalidationTags = []) {
    // Check if we have a valid cached value
    const cached = this.get(key);
    if (cached) {
      return cached.value;
    }
    
    // Execute callback and cache result
    try {
      const result = await callback();
      this.cacheWithInvalidation(key, result, ttl, invalidationTags);
      return result;
    } catch (error) {
      console.error('Cache callback failed:', error);
      throw error;
    }
  }

  // Cache with fallback
  async cacheWithFallback(key, primaryCallback, fallbackCallback, ttl = 300000) {
    try {
      return await this.cacheWithCallback(key, primaryCallback, ttl);
    } catch (error) {
      console.warn('Primary cache callback failed, using fallback:', error);
      return await fallbackCallback();
    }
  }

  // Batch operations
  mset(entries, ttl = 300000) {
    const results = [];
    entries.forEach(([key, value]) => {
      results.push(this.set(key, value, ttl));
    });
    return results;
  }

  mget(keys) {
    return keys.map(key => this.get(key));
  }

  mdelete(keys) {
    return keys.map(key => this.delete(key));
  }

  // Cache warming
  async warmCache(keys, callback, ttl = 300000) {
    const promises = keys.map(async key => {
      try {
        const value = await callback(key);
        this.set(key, value, ttl);
        return { key, success: true };
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error);
        return { key, success: false, error: error.message };
      }
    });
    
    return Promise.all(promises);
  }

  // Export cache data (for persistence)
  export() {
    const data = {};
    for (const [key, value] of this.cache.entries()) {
      const expiry = this.ttlMap.get(key);
      if (expiry && expiry > Date.now()) {
        data[key] = {
          value,
          expiry: expiry - Date.now() // Convert to relative TTL
        };
      }
    }
    return data;
  }

  // Import cache data
  import(data) {
    const now = Date.now();
    let imported = 0;
    
    for (const [key, entry] of Object.entries(data)) {
      if (entry.expiry > 0) {
        this.set(key, entry.value, entry.expiry);
        imported++;
      }
    }
    
    return imported;
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Export both class and instance
export { CacheService, cacheService };
export default cacheService;
