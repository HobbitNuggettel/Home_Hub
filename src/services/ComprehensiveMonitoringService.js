/**
 * Comprehensive Monitoring Service
 * Integrates logging, performance monitoring, and system health tracking
 */

import loggingService from './LoggingService';
import performanceMonitoringService from './PerformanceMonitoringService';

class ComprehensiveMonitoringService {
  constructor() {
    this.isInitialized = false;
    this.healthChecks = new Map();
    this.alerts = [];
    this.metrics = new Map();
    this.thresholds = {
      responseTime: 2000, // 2 seconds
      errorRate: 0.05,    // 5%
      memoryUsage: 0.8,   // 80%
      cpuUsage: 0.8,      // 80%
      diskUsage: 0.9      // 90%
    };
  }

  /**
   * Initialize comprehensive monitoring
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize logging service
      await loggingService.initialize();
      
      // Start performance monitoring
      performanceMonitoringService.startMonitoring();
      
      // Set up health checks
      this.setupHealthChecks();
      
      // Set up alerting
      this.setupAlerting();
      
      this.isInitialized = true;
      
      loggingService.info('Comprehensive monitoring initialized successfully');
    } catch (error) {
      console.error('Failed to initialize comprehensive monitoring:', error);
      throw error;
    }
  }

  /**
   * Set up health checks
   */
  setupHealthChecks() {
    // API health check
    this.healthChecks.set('api', {
      name: 'API Health',
      check: this.checkApiHealth.bind(this),
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
      enabled: true
    });

    // Database health check
    this.healthChecks.set('database', {
      name: 'Database Health',
      check: this.checkDatabaseHealth.bind(this),
      interval: 60000, // 1 minute
      timeout: 10000,  // 10 seconds
      enabled: true
    });

    // Memory health check
    this.healthChecks.set('memory', {
      name: 'Memory Health',
      check: this.checkMemoryHealth.bind(this),
      interval: 30000, // 30 seconds
      timeout: 1000,   // 1 second
      enabled: true
    });

    // Start health check intervals
    this.startHealthChecks();
  }

  /**
   * Set up alerting system
   */
  setupAlerting() {
    // Set up performance alerts
    this.setupPerformanceAlerts();
    
    // Set up error alerts
    this.setupErrorAlerts();
    
    // Set up system alerts
    this.setupSystemAlerts();
  }

  /**
   * Set up performance alerts
   */
  setupPerformanceAlerts() {
    // Monitor response times
    setInterval(() => {
      const metrics = performanceMonitoringService.getMetrics();
      if (metrics.responseTime) {
        const avgResponseTime = metrics.responseTime.average || 0;
        if (avgResponseTime > this.thresholds.responseTime) {
          this.createAlert('performance', 'High response time detected', {
            metric: 'responseTime',
            value: avgResponseTime,
            threshold: this.thresholds.responseTime
          });
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Set up error alerts
   */
  setupErrorAlerts() {
    // Monitor error rates
    setInterval(async () => {
      try {
        const logs = await loggingService.getLogs({ level: 'error', limit: 100 });
        const totalLogs = await loggingService.getLogs({ level: 'all', limit: 100 });
        
        if (totalLogs.length > 0) {
          const errorRate = logs.length / totalLogs.length;
          if (errorRate > this.thresholds.errorRate) {
            this.createAlert('error', 'High error rate detected', {
              metric: 'errorRate',
              value: errorRate,
              threshold: this.thresholds.errorRate
            });
          }
        }
      } catch (error) {
        console.error('Failed to check error rates:', error);
      }
    }, 60000); // Check every minute
  }

  /**
   * Set up system alerts
   */
  setupSystemAlerts() {
    // Monitor system resources
    setInterval(() => {
      this.checkSystemResources();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Start health checks
   */
  startHealthChecks() {
    this.healthChecks.forEach((healthCheck, key) => {
      if (healthCheck.enabled) {
        setInterval(async () => {
          try {
            const result = await Promise.race([
              healthCheck.check(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout)
              )
            ]);
            
            this.recordHealthCheck(key, result);
          } catch (error) {
            this.recordHealthCheck(key, { status: 'error', error: error.message });
          }
        }, healthCheck.interval);
      }
    });
  }

  /**
   * Check API health
   */
  async checkApiHealth() {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          responseTime: Date.now() - performance.now(),
          data
        };
      } else {
        return {
          status: 'unhealthy',
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      // This would be a real database health check
      // For now, we'll simulate it
      const startTime = performance.now();
      
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        status: 'healthy',
        responseTime: performance.now() - startTime,
        connectionCount: Math.floor(Math.random() * 10) + 1
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Check memory health
   */
  async checkMemoryHealth() {
    try {
      if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        
        return {
          status: usage < this.thresholds.memoryUsage ? 'healthy' : 'warning',
          usage: usage,
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize
        };
      }
      
      return {
        status: 'unknown',
        message: 'Memory API not available'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Check system resources
   */
  checkSystemResources() {
    // This would check actual system resources
    // For now, we'll simulate it
    const memoryUsage = Math.random() * 0.9; // 0-90%
    const cpuUsage = Math.random() * 0.8;    // 0-80%
    const diskUsage = Math.random() * 0.95;  // 0-95%

    if (memoryUsage > this.thresholds.memoryUsage) {
      this.createAlert('system', 'High memory usage detected', {
        metric: 'memoryUsage',
        value: memoryUsage,
        threshold: this.thresholds.memoryUsage
      });
    }

    if (cpuUsage > this.thresholds.cpuUsage) {
      this.createAlert('system', 'High CPU usage detected', {
        metric: 'cpuUsage',
        value: cpuUsage,
        threshold: this.thresholds.cpuUsage
      });
    }

    if (diskUsage > this.thresholds.diskUsage) {
      this.createAlert('system', 'High disk usage detected', {
        metric: 'diskUsage',
        value: diskUsage,
        threshold: this.thresholds.diskUsage
      });
    }
  }

  /**
   * Record health check result
   * @param {string} key - Health check key
   * @param {object} result - Health check result
   */
  recordHealthCheck(key, result) {
    const healthCheck = this.healthChecks.get(key);
    if (!healthCheck) return;

    healthCheck.lastCheck = Date.now();
    healthCheck.lastResult = result;

    // Log health check result
    if (result.status === 'healthy') {
      loggingService.debug(`Health check passed: ${healthCheck.name}`, result);
    } else {
      loggingService.warn(`Health check failed: ${healthCheck.name}`, result);
    }

    // Create alert if unhealthy
    if (result.status === 'unhealthy' || result.status === 'error') {
      this.createAlert('health', `Health check failed: ${healthCheck.name}`, {
        healthCheck: key,
        result
      });
    }
  }

  /**
   * Create an alert
   * @param {string} type - Alert type
   * @param {string} message - Alert message
   * @param {object} metadata - Alert metadata
   */
  createAlert(type, message, metadata = {}) {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      metadata,
      timestamp: Date.now(),
      status: 'active'
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.splice(0, this.alerts.length - 100);
    }

    // Log alert
    loggingService.warn(`Alert: ${message}`, { alert });

    // Emit alert event (if using event system)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('monitoring-alert', { detail: alert }));
    }
  }

  /**
   * Get system health status
   * @returns {object} - System health status
   */
  getSystemHealth() {
    const healthChecks = {};
    let overallStatus = 'healthy';

    this.healthChecks.forEach((healthCheck, key) => {
      healthChecks[key] = {
        name: healthCheck.name,
        status: healthCheck.lastResult?.status || 'unknown',
        lastCheck: healthCheck.lastCheck,
        result: healthCheck.lastResult
      };

      if (healthCheck.lastResult?.status === 'unhealthy' || healthCheck.lastResult?.status === 'error') {
        overallStatus = 'unhealthy';
      }
    });

    return {
      overallStatus,
      healthChecks,
      alerts: this.alerts.filter(alert => alert.status === 'active'),
      metrics: this.getMetrics()
    };
  }

  /**
   * Get monitoring metrics
   * @returns {object} - Monitoring metrics
   */
  getMetrics() {
    const performanceMetrics = performanceMonitoringService.getMetrics();
    const systemHealth = this.getSystemHealth();

    return {
      performance: performanceMetrics,
      health: systemHealth,
      alerts: this.alerts,
      thresholds: this.thresholds
    };
  }

  /**
   * Get monitoring dashboard data
   * @returns {object} - Dashboard data
   */
  getDashboardData() {
    return {
      systemHealth: this.getSystemHealth(),
      performanceMetrics: performanceMonitoringService.getSummary(),
      recentLogs: [], // Will be populated by logging service
      alerts: this.alerts.filter(alert => alert.status === 'active'),
      uptime: this.getUptime()
    };
  }

  /**
   * Get system uptime
   * @returns {number} - Uptime in milliseconds
   */
  getUptime() {
    if (typeof window !== 'undefined' && window.performance) {
      return window.performance.now();
    }
    return Date.now() - (this.startTime || Date.now());
  }

  /**
   * Clear all alerts
   */
  clearAlerts() {
    this.alerts = [];
    loggingService.info('All alerts cleared');
  }

  /**
   * Acknowledge alert
   * @param {string} alertId - Alert ID
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      loggingService.info(`Alert acknowledged: ${alert.message}`, { alertId });
    }
  }

  /**
   * Set monitoring thresholds
   * @param {object} thresholds - New thresholds
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
    loggingService.info('Monitoring thresholds updated', { thresholds });
  }

  /**
   * Export monitoring data
   * @param {string} format - Export format (json, csv)
   * @returns {string} - Exported data
   */
  exportData(format = 'json') {
    const data = {
      systemHealth: this.getSystemHealth(),
      performanceMetrics: performanceMonitoringService.getMetrics(),
      alerts: this.alerts,
      thresholds: this.thresholds,
      exportTime: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvRows = [];
      csvRows.push(['Metric', 'Value', 'Timestamp']);
      
      // Add performance metrics
      Object.entries(data.performanceMetrics).forEach(([name, metric]) => {
        if (metric.values) {
          metric.values.forEach(value => {
            csvRows.push([name, value.value, new Date(value.timestamp).toISOString()]);
          });
        }
      });
      
      return csvRows.map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Stop monitoring
   */
  stop() {
    performanceMonitoringService.stopMonitoring();
    this.isInitialized = false;
    loggingService.info('Comprehensive monitoring stopped');
  }
}

// Create singleton instance
const comprehensiveMonitoringService = new ComprehensiveMonitoringService();

export default comprehensiveMonitoringService;
