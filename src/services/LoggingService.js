/**
 * Logging Service
 * Comprehensive logging system for production monitoring
 */

class LoggingService {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.logs = [];
    this.maxLogs = 1000;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isInitialized = false;
  }

  /**
   * Initialize logging service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Set up console logging
      this.setupConsoleLogging();
      
      // Set up error handling
      this.setupErrorHandling();
      
      this.isInitialized = true;
      console.log('Logging service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize logging service:', error);
      throw error;
    }
  }

  /**
   * Set up console logging
   */
  setupConsoleLogging() {
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    // Override console methods to use our logging service
    console.log = (...args) => {
      this.debug(...args);
      this.originalConsole.log(...args);
    };

    console.info = (...args) => {
      this.info(...args);
      this.originalConsole.info(...args);
    };

    console.warn = (...args) => {
      this.warn(...args);
      this.originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.error(...args);
      this.originalConsole.error(...args);
    };

    console.debug = (...args) => {
      this.debug(...args);
      this.originalConsole.debug(...args);
    };
  }

  /**
   * Set up error handling
   */
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  /**
   * Check if log level should be logged
   * @param {string} level - Log level
   * @returns {boolean} - Whether to log
   */
  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   * @returns {object} - Formatted log entry
   */
  formatLog(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta: {
        ...meta,
        environment: process.env.NODE_ENV,
        version: process.env.REACT_APP_VERSION || '1.0.0',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      }
    };

    // Add user context if available
    if (typeof window !== 'undefined' && window.user) {
      logEntry.meta.userId = window.user.id;
      logEntry.meta.userEmail = window.user.email;
    }

    return logEntry;
  }

  /**
   * Store log entry
   * @param {object} logEntry - Formatted log entry
   */
  storeLog(logEntry) {
    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Send log to external service
   * @param {object} logEntry - Log entry to send
   */
  async sendToExternalService(logEntry) {
    if (!this.isProduction) return;

    try {
      // Send to logging service (e.g., LogRocket, Sentry, etc.)
      if (window.logRocket) {
        window.logRocket.captureMessage(logEntry.message, {
          level: logEntry.level,
          extra: logEntry.meta
        });
      }

      // Send to analytics service
      if (window.gtag) {
        window.gtag('event', 'log', {
          event_category: 'logging',
          event_label: logEntry.level,
          value: 1
        });
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {object} meta - Additional metadata
   */
  error(message, error = null, meta = {}) {
    if (!this.shouldLog('error')) return;

    const logEntry = this.formatLog('error', message, {
      ...meta,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null
    });

    this.storeLog(logEntry);
    
    // Use original console methods to avoid recursion
    if (this.originalConsole) {
      this.originalConsole.error(`[ERROR] ${message}`, error, meta);
    } else {
      console.error(`[ERROR] ${message}`, error, meta);
    }
    
    this.sendToExternalService(logEntry);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;

    const logEntry = this.formatLog('warn', message, meta);
    this.storeLog(logEntry);
    
    // Use original console methods to avoid recursion
    if (this.originalConsole) {
      this.originalConsole.warn(`[WARN] ${message}`, meta);
    } else {
      console.warn(`[WARN] ${message}`, meta);
    }
    
    this.sendToExternalService(logEntry);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {object} meta - Additional metadata
   */
  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;

    const logEntry = this.formatLog('info', message, meta);
    this.storeLog(logEntry);
    
    // Use original console methods to avoid recursion
    if (this.originalConsole) {
      this.originalConsole.info(`[INFO] ${message}`, meta);
    } else {
      console.info(`[INFO] ${message}`, meta);
    }
    
    this.sendToExternalService(logEntry);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;

    const logEntry = this.formatLog('debug', message, meta);
    this.storeLog(logEntry);
    
    // Use original console methods to avoid recursion
    if (this.originalConsole) {
      this.originalConsole.debug(`[DEBUG] ${message}`, meta);
    } else {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }

  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status
   * @param {number} duration - Request duration in ms
   * @param {object} meta - Additional metadata
   */
  apiRequest(method, url, status, duration, meta = {}) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const message = `${method} ${url} - ${status} (${duration}ms)`;
    
    this[level](message, {
      ...meta,
      type: 'api_request',
      method,
      url,
      status,
      duration
    });
  }

  /**
   * Log user action
   * @param {string} action - User action
   * @param {object} data - Action data
   * @param {object} meta - Additional metadata
   */
  userAction(action, data = {}, meta = {}) {
    this.info(`User action: ${action}`, {
      ...meta,
      type: 'user_action',
      action,
      data
    });
  }

  /**
   * Log performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Metric unit
   * @param {object} meta - Additional metadata
   */
  performance(metric, value, unit = 'ms', meta = {}) {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      ...meta,
      type: 'performance',
      metric,
      value,
      unit
    });
  }

  /**
   * Log security event
   * @param {string} event - Security event
   * @param {object} data - Event data
   * @param {string} severity - Event severity
   */
  security(event, data = {}, severity = 'info') {
    this[severity](`Security event: ${event}`, {
      type: 'security',
      event,
      data,
      severity
    });
  }

  /**
   * Get recent logs
   * @param {string} level - Filter by log level
   * @param {number} limit - Number of logs to return
   * @returns {Array} - Recent logs
   */
  getLogs(level = null, limit = 100) {
    let logs = this.logs;
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-limit);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs
   * @param {string} format - Export format (json, csv)
   * @returns {string} - Exported logs
   */
  exportLogs(format = 'json') {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'meta'];
      const rows = this.logs.map(log => [
        log.timestamp,
        log.level,
        log.message,
        JSON.stringify(log.meta)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set log level
   * @param {string} level - New log level
   */
  setLogLevel(level) {
    if (Object.prototype.hasOwnProperty.call(this.logLevels, level)) {
      this.logLevel = level;
    }
  }

  /**
   * Get log statistics
   * @returns {object} - Log statistics
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byType: {},
      recent: this.logs.slice(-10)
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byType[log.meta.type] = (stats.byType[log.meta.type] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
const loggingService = new LoggingService();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    loggingService.error('Uncaught error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    loggingService.error('Unhandled promise rejection', event.reason);
  });
}

export default loggingService;
