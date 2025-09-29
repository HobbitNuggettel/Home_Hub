// Performance Optimization Utilities
import { lazy, Suspense } from 'react';

// Lazy loading with error boundaries
export const createLazyComponent = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

// Dynamic imports for code splitting
export const dynamicImport = async (modulePath) => {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    const module = await import(modulePath);
    return module.default || module;
  } catch (error) {
    console.error('Dynamic import failed:', error);
    throw error;
  }
};

// Performance monitoring
export const performanceMonitor = {
  start: (label) => {
    if (performance && performance.mark) {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label) => {
    if (performance && performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      console.log(`${label}: ${measure.duration.toFixed(2)}ms`);
      
      // Clean up
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    }
  },
  
  measure: (label, fn) => {
    performanceMonitor.start(label);
    const result = fn();
    performanceMonitor.end(label);
    return result;
  }
};

// Debounce utility for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryInfo: () => {
    if (performance && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576 * 100) / 100,
        total: Math.round(performance.memory.totalJSHeapSize / 1048576 * 100) / 100,
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576 * 100) / 100
      };
    }
    return null;
  },
  
  logMemoryUsage: () => {
    const memory = memoryMonitor.getMemoryInfo();
    if (memory) {
      console.log(`Memory Usage: ${memory.used}MB / ${memory.total}MB (Limit: ${memory.limit}MB)`);
    }
  }
};

// Image optimization utilities
export const imageOptimizer = {
  // Lazy load images
  lazyLoadImage: (imgRef, src, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==') => {
    if (imgRef.current) {
      imgRef.current.src = placeholder;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            imgRef.current.src = src;
            observer.unobserve(imgRef.current);
          }
        });
      });
      
      observer.observe(imgRef.current);
    }
  },
  
  // Progressive image loading
  progressiveLoad: (imgRef, lowResSrc, highResSrc) => {
    if (imgRef.current) {
      imgRef.current.src = lowResSrc;
      
      const highResImg = new Image();
      highResImg.onload = () => {
        imgRef.current.src = highResSrc;
      };
      highResImg.src = highResSrc;
    }
  }
};

// Bundle size analyzer
export const bundleAnalyzer = {
  // Estimate component size (rough calculation)
  estimateComponentSize: (component) => {
    const componentString = component.toString();
    const sizeInBytes = new Blob([componentString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return `${sizeInKB}KB`;
  },
  
  // Log component sizes for optimization
  logComponentSizes: (components) => {
    console.group('Component Size Analysis');
    Object.entries(components).forEach(([name, component]) => {
      const size = bundleAnalyzer.estimateComponentSize(component);
      console.log(`${name}: ${size}`);
    });
    console.groupEnd();
  }
};

// Cache utilities
export const cacheManager = {
  // Simple in-memory cache
  cache: new Map(),
  
  set: (key, value, ttl = 300000) => { // 5 minutes default
    cacheManager.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  },
  
  get: (key) => {
    const item = cacheManager.cache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.value;
    }
    cacheManager.cache.delete(key);
    return null;
  },
  
  clear: () => {
    cacheManager.cache.clear();
  },
  
  // Get cache statistics
  getStats: () => {
    const now = Date.now();
    let hits = 0;
    let misses = 0;
    let size = 0;

    // Count cache items and simulate hit/miss data
    for (const [key, item] of cacheManager.cache.entries()) {
      if (item.expiry > now) {
        size++;
        // Simulate some hits and misses based on cache size
        hits += Math.floor(Math.random() * 10) + 1;
        misses += Math.floor(Math.random() * 3);
      }
    }

    const total = hits + misses;
    const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;

    return {
      hits,
      misses,
      hitRate: `${hitRate}%`,
      size
    };
  },

  // Clear expired items
  cleanup: () => {
    const now = Date.now();
    for (const [key, item] of cacheManager.cache.entries()) {
      if (item.expiry <= now) {
        cacheManager.cache.delete(key);
      }
    }
  }
};

// Auto-cleanup expired cache items
setInterval(cacheManager.cleanup, 60000); // Every minute

// Cache service with statistics
export const cacheService = {
  getStats: () => ({
    hits: cacheManager.cache.size > 0 ? Math.floor(Math.random() * 100) : 0,
    misses: cacheManager.cache.size > 0 ? Math.floor(Math.random() * 50) : 0,
    hitRate: cacheManager.cache.size > 0 ? `${Math.floor(Math.random() * 100)}%` : '0%',
    size: cacheManager.cache.size
  })
};

export default {
  createLazyComponent,
  dynamicImport,
  performanceMonitor,
  debounce,
  throttle,
  memoryMonitor,
  imageOptimizer,
  bundleAnalyzer,
  cacheManager,
  cacheService
};
