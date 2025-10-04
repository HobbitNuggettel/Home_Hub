class PerformanceOptimizationService {
  constructor() {
    this.observers = new Map();
    this.metrics = {
      renderTime: [],
      memoryUsage: [],
      networkRequests: [],
      bundleSize: 0
    };
    this.isMonitoring = false;
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.observeRenderPerformance();
    this.observeMemoryUsage();
    this.observeNetworkRequests();
    this.measureBundleSize();
  }

  // Stop performance monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // Observe render performance
  observeRenderPerformance() {
    if (!window.performance || !window.performance.mark) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'measure') {
          this.metrics.renderTime.push({
            name: entry.name,
            duration: entry.duration,
            timestamp: Date.now()
          });
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.set('render', observer);
  }

  // Observe memory usage
  observeMemoryUsage() {
    if (!window.performance || !window.performance.memory) return;

    const checkMemory = () => {
      const memory = window.performance.memory;
      this.metrics.memoryUsage.push({
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
    };

    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    this.observers.set('memory', { disconnect: () => clearInterval(interval) });
  }

  // Observe network requests
  observeNetworkRequests() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          this.metrics.networkRequests.push({
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize || 0,
            timestamp: Date.now()
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('network', observer);
  }

  // Measure bundle size
  measureBundleSize() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.bundleSize = navigation.transferSize || 0;
      }
    }
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      averageRenderTime: this.calculateAverage(this.metrics.renderTime, 'duration'),
      averageMemoryUsage: this.calculateAverage(this.metrics.memoryUsage, 'used'),
      totalNetworkRequests: this.metrics.networkRequests.length,
      averageNetworkTime: this.calculateAverage(this.metrics.networkRequests, 'duration')
    };
  }

  // Calculate average from array of objects
  calculateAverage(array, property) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, item) => acc + (item[property] || 0), 0);
    return sum / array.length;
  }

  // Optimize images
  optimizeImage(imageUrl, options = {}) {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // If using Cloudinary
    if (imageUrl.includes('cloudinary.com')) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`, `f_${format}`);
      
      return imageUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
    
    return imageUrl;
  }

  // Preload critical resources
  preloadResource(href, as = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  // Lazy load images
  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Debounce function calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function calls
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Clear old metrics to prevent memory leaks
  clearOldMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    this.metrics.renderTime = this.metrics.renderTime.filter(
      metric => metric.timestamp > oneHourAgo
    );
    this.metrics.memoryUsage = this.metrics.memoryUsage.filter(
      metric => metric.timestamp > oneHourAgo
    );
    this.metrics.networkRequests = this.metrics.networkRequests.filter(
      metric => metric.timestamp > oneHourAgo
    );
  }

  // Get performance recommendations
  getRecommendations() {
    const metrics = this.getMetrics();
    const recommendations = [];

    if (metrics.averageRenderTime > 16) {
      recommendations.push({
        type: 'performance',
        message: 'Consider optimizing component rendering - average render time is high',
        priority: 'high'
      });
    }

    if (metrics.averageMemoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push({
        type: 'memory',
        message: 'Memory usage is high - consider implementing cleanup strategies',
        priority: 'medium'
      });
    }

    if (metrics.bundleSize > 1024 * 1024) { // 1MB
      recommendations.push({
        type: 'bundle',
        message: 'Bundle size is large - consider code splitting and lazy loading',
        priority: 'high'
      });
    }

    if (metrics.totalNetworkRequests > 100) {
      recommendations.push({
        type: 'network',
        message: 'High number of network requests - consider batching or caching',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

export default new PerformanceOptimizationService();





