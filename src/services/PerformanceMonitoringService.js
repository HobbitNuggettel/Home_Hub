/**
 * Performance Monitoring Service
 * Tracks and reports performance metrics
 */

import loggingService from './LoggingService';

class PerformanceMonitoringService {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isMonitoring = false;
    this.thresholds = {
      fcp: 1500, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      fid: 100,  // First Input Delay
      cls: 0.1,  // Cumulative Layout Shift
      ttfb: 600  // Time to First Byte
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.observeWebVitals();
    this.observeResourceTiming();
    this.observeNavigationTiming();
    this.observeCustomMetrics();

    loggingService.info('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    loggingService.info('Performance monitoring stopped');
  }

  /**
   * Observe Web Vitals
   */
  observeWebVitals() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('fcp', entry.startTime);
        }
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
    this.observers.set('fcp', fcpObserver);

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('lcp', entry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    this.observers.set('lcp', lcpObserver);

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('fid', entry.processingStart - entry.startTime);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
    this.observers.set('fid', fidObserver);

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.recordMetric('cls', clsValue);
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    this.observers.set('cls', clsObserver);
  }

  /**
   * Observe resource timing
   */
  observeResourceTiming() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = entry.responseEnd - entry.requestStart;
        const size = entry.transferSize || 0;
        
        this.recordMetric('resource_load_time', duration, {
          name: entry.name,
          type: entry.initiatorType,
          size: size
        });
      }
    });
    resourceObserver.observe({ type: 'resource', buffered: true });
    this.observers.set('resource', resourceObserver);
  }

  /**
   * Observe navigation timing
   */
  observeNavigationTiming() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
        this.recordMetric('load_complete', navigation.loadEventEnd - navigation.navigationStart);
      }
    });
  }

  /**
   * Observe custom metrics
   */
  observeCustomMetrics() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    const measureObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('custom_measure', entry.duration, {
          name: entry.name
        });
      }
    });
    measureObserver.observe({ type: 'measure', buffered: true });
    this.observers.set('measure', measureObserver);
  }

  /**
   * Record a performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {object} metadata - Additional metadata
   */
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);

    // Keep only last 100 measurements
    const metrics = this.metrics.get(name);
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }

    // Check thresholds
    this.checkThresholds(name, value);

    // Log performance metric
    loggingService.performance(name, value, 'ms', metadata);
  }

  /**
   * Check if metric exceeds thresholds
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   */
  checkThresholds(name, value) {
    const threshold = this.thresholds[name];
    if (threshold && value > threshold) {
      loggingService.warn(`Performance threshold exceeded: ${name}`, {
        value,
        threshold,
        type: 'performance_threshold'
      });
    }
  }

  /**
   * Start measuring a custom metric
   * @param {string} name - Metric name
   */
  startMeasure(name) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`);
    }
  }

  /**
   * End measuring a custom metric
   * @param {string} name - Metric name
   */
  endMeasure(name) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
    }
  }

  /**
   * Get performance metrics
   * @param {string} name - Specific metric name (optional)
   * @returns {object|Array} - Performance metrics
   */
  getMetrics(name = null) {
    if (name) {
      return this.metrics.get(name) || [];
    }

    const result = {};
    for (const [metricName, values] of this.metrics.entries()) {
      result[metricName] = {
        values,
        average: this.calculateAverage(values),
        min: Math.min(...values.map(v => v.value)),
        max: Math.max(...values.map(v => v.value)),
        count: values.length
      };
    }
    return result;
  }

  /**
   * Calculate average value
   * @param {Array} values - Array of metric values
   * @returns {number} - Average value
   */
  calculateAverage(values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, metric) => acc + metric.value, 0);
    return sum / values.length;
  }

  /**
   * Get performance summary
   * @returns {object} - Performance summary
   */
  getSummary() {
    const summary = {
      webVitals: {},
      customMetrics: {},
      resourceMetrics: {},
      thresholds: this.thresholds
    };

    // Web Vitals
    const webVitalNames = ['fcp', 'lcp', 'fid', 'cls', 'ttfb'];
    webVitalNames.forEach(name => {
      const metrics = this.getMetrics(name);
      if (metrics.length > 0) {
        summary.webVitals[name] = {
          value: metrics[metrics.length - 1].value,
          threshold: this.thresholds[name],
          status: metrics[metrics.length - 1].value <= this.thresholds[name] ? 'good' : 'poor'
        };
      }
    });

    // Custom metrics
    for (const [name, data] of this.metrics.entries()) {
      if (!webVitalNames.includes(name)) {
        summary.customMetrics[name] = {
          average: this.calculateAverage(data.values),
          count: data.values.length,
          latest: data.values[data.values.length - 1]?.value || 0
        };
      }
    }

    return summary;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    loggingService.info('Performance metrics cleared');
  }

  /**
   * Export metrics data
   * @param {string} format - Export format (json, csv)
   * @returns {string} - Exported data
   */
  exportMetrics(format = 'json') {
    const data = this.getMetrics();
    
    if (format === 'csv') {
      const rows = [];
      for (const [name, metrics] of Object.entries(data)) {
        metrics.values.forEach(metric => {
          rows.push([
            name,
            metric.value,
            new Date(metric.timestamp).toISOString(),
            JSON.stringify(metric.metadata)
          ]);
        });
      }
      return [['name', 'value', 'timestamp', 'metadata'], ...rows]
        .map(row => row.join(','))
        .join('\n');
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Set performance thresholds
   * @param {object} thresholds - New thresholds
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
    loggingService.info('Performance thresholds updated', { thresholds });
  }
}

// Create singleton instance
const performanceMonitoringService = new PerformanceMonitoringService();

// Auto-start monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitoringService.startMonitoring();
}

export default performanceMonitoringService;



