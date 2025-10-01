/**
 * Performance Monitoring Service
 * Tracks and optimizes application performance
 */

class PerformanceService {
  constructor() {
    this.metrics = {
      pageLoadTimes: {},
      componentRenderTimes: {},
      bundleSize: 0,
      memoryUsage: 0,
      networkRequests: 0
    };
    this.observers = [];
    this.init();
  }

  init() {
    // Monitor page load performance
    if (typeof window !== 'undefined' && window.performance) {
      this.observePageLoad();
      this.observeMemoryUsage();
      this.observeNetworkRequests();
    }
  }

  // Monitor page load times
  observePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.pageLoadTimes[window.location.pathname] = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        };
        this.notifyObservers('pageLoad', this.metrics.pageLoadTimes[window.location.pathname]);
      }
    });
  }

  // Monitor memory usage (if available)
  observeMemoryUsage() {
    if (performance.memory) {
      setInterval(() => {
        this.metrics.memoryUsage = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
        this.notifyObservers('memory', this.metrics.memoryUsage);
      }, 5000);
    }
  }

  // Monitor network requests
  observeNetworkRequests() {
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      this.metrics.networkRequests++;
      return originalFetch(...args).then(response => {
        this.notifyObservers('network', { count: this.metrics.networkRequests });
        return response;
      });
    };
  }

  // Track component render times
  trackComponentRender(componentName, renderTime) {
    if (!this.metrics.componentRenderTimes[componentName]) {
      this.metrics.componentRenderTimes[componentName] = [];
    }
    this.metrics.componentRenderTimes[componentName].push(renderTime);
    
    // Keep only last 10 render times
    if (this.metrics.componentRenderTimes[componentName].length > 10) {
      this.metrics.componentRenderTimes[componentName].shift();
    }
    
    this.notifyObservers('componentRender', { componentName, renderTime });
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      averageComponentRenderTimes: this.getAverageRenderTimes(),
      performanceScore: this.calculatePerformanceScore()
    };
  }

  // Calculate average render times
  getAverageRenderTimes() {
    const averages = {};
    Object.keys(this.metrics.componentRenderTimes).forEach(component => {
      const times = this.metrics.componentRenderTimes[component];
      averages[component] = times.reduce((a, b) => a + b, 0) / times.length;
    });
    return averages;
  }

  // Calculate overall performance score
  calculatePerformanceScore() {
    const currentPage = window.location.pathname;
    const pageLoadTime = this.metrics.pageLoadTimes[currentPage];
    
    if (!pageLoadTime) return 0;
    
    // Score based on load time (lower is better)
    const loadTimeScore = Math.max(0, 100 - (pageLoadTime.totalTime / 100));
    
    // Score based on memory usage (lower is better)
    const memoryScore = this.metrics.memoryUsage.limit 
      ? Math.max(0, 100 - ((this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100))
      : 100;
    
    // Score based on network requests (fewer is better)
    const networkScore = Math.max(0, 100 - (this.metrics.networkRequests * 2));
    
    return Math.round((loadTimeScore + memoryScore + networkScore) / 3);
  }

  // Subscribe to performance updates
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  // Notify observers
  notifyObservers(type, data) {
    this.observers.forEach(observer => {
      try {
        observer(type, data);
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    });
  }

  // Get performance recommendations
  getRecommendations() {
    const recommendations = [];
    const metrics = this.getMetrics();
    
    // Check page load times
    Object.keys(metrics.pageLoadTimes).forEach(page => {
      const loadTime = metrics.pageLoadTimes[page].totalTime;
      if (loadTime > 3000) {
        recommendations.push({
          type: 'warning',
          category: 'Performance',
          message: `Page ${page} takes ${Math.round(loadTime)}ms to load. Consider code splitting or lazy loading.`
        });
      }
    });
    
    // Check memory usage
    if (metrics.memoryUsage.used > metrics.memoryUsage.limit * 0.8) {
      recommendations.push({
        type: 'error',
        category: 'Memory',
        message: 'High memory usage detected. Consider optimizing component rendering or reducing bundle size.'
      });
    }
    
    // Check component render times
    Object.keys(metrics.averageComponentRenderTimes).forEach(component => {
      const avgTime = metrics.averageComponentRenderTimes[component];
      if (avgTime > 16) { // More than one frame at 60fps
        recommendations.push({
          type: 'warning',
          category: 'Rendering',
          message: `Component ${component} takes ${Math.round(avgTime)}ms to render on average. Consider optimization.`
        });
      }
    });
    
    return recommendations;
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = {
      pageLoadTimes: {},
      componentRenderTimes: {},
      bundleSize: 0,
      memoryUsage: 0,
      networkRequests: 0
    };
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

export default performanceService;

