/**
 * Global Error Handler Service
 * Centralized error handling and reporting
 */

class ErrorHandlerService {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.reportingEnabled = true;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.init();
  }

  init() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    // Handle global errors
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    // Handle console errors
    this.interceptConsoleErrors();
  }

  // Handle unhandled promise rejections
  handleUnhandledRejection(event) {
    const error = {
      type: 'unhandledRejection',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.handleError(error);
    event.preventDefault(); // Prevent default browser behavior
  }

  // Handle global errors
  handleGlobalError(event) {
    const error = {
      type: 'globalError',
      message: event.message || 'Global Error',
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.handleError(error);
  }

  // Intercept console errors
  interceptConsoleErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      this.handleError({
        type: 'consoleError',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.handleError({
        type: 'consoleWarn',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      originalWarn.apply(console, args);
    };
  }

  // Handle any error
  handleError(error) {
    // Add error to queue
    this.errorQueue.push({
      ...error,
      id: this.generateErrorId(),
      severity: this.determineSeverity(error)
    });

    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Report error if reporting is enabled
    if (this.reportingEnabled) {
      this.reportError(error);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Handler');
      console.error('Error:', error);
      console.groupEnd();
    }
  }

  // Generate unique error ID
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Determine error severity
  determineSeverity(error) {
    if (error.type === 'unhandledRejection' || error.type === 'globalError') {
      return 'high';
    }
    if (error.type === 'consoleError') {
      return 'medium';
    }
    if (error.type === 'consoleWarn') {
      return 'low';
    }
    return 'medium';
  }

  // Report error to external service
  async reportError(error) {
    try {
      // Simulate API call to error reporting service
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...error,
          userId: this.getCurrentUserId(),
          sessionId: this.getSessionId(),
          environment: process.env.NODE_ENV
        })
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.status}`);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      // Store error locally for retry
      this.storeErrorForRetry(error);
    }
  }

  // Store error for retry
  storeErrorForRetry(error) {
    const retryKey = `error_retry_${Date.now()}`;
    localStorage.setItem(retryKey, JSON.stringify({
      ...error,
      retryCount: 0,
      nextRetry: Date.now() + this.retryDelay
    }));
  }

  // Retry failed error reports
  async retryFailedReports() {
    const retryKeys = Object.keys(localStorage).filter(key => key.startsWith('error_retry_'));
    
    for (const key of retryKeys) {
      try {
        const errorData = JSON.parse(localStorage.getItem(key));
        
        if (errorData.retryCount < this.retryAttempts && Date.now() >= errorData.nextRetry) {
          await this.reportError(errorData);
          localStorage.removeItem(key);
        } else if (errorData.retryCount >= this.retryAttempts) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Failed to retry error report:', error);
        localStorage.removeItem(key);
      }
    }
  }

  // Get current user ID
  getCurrentUserId() {
    // Implement based on your auth system
    return localStorage.getItem('userId') || 'anonymous';
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateErrorId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get error statistics
  getErrorStats() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentErrors = this.errorQueue.filter(error => 
      new Date(error.timestamp).getTime() > last24Hours
    );

    const severityCounts = recentErrors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      total: recentErrors.length,
      bySeverity: severityCounts,
      mostCommon: this.getMostCommonErrors(recentErrors),
      lastError: recentErrors[recentErrors.length - 1]
    };
  }

  // Get most common errors
  getMostCommonErrors(errors) {
    const errorCounts = errors.reduce((acc, error) => {
      const key = error.message || error.type;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = [];
  }

  // Enable/disable reporting
  setReportingEnabled(enabled) {
    this.reportingEnabled = enabled;
  }

  // Get error queue
  getErrors() {
    return [...this.errorQueue];
  }

  // Start retry process
  startRetryProcess() {
    setInterval(() => {
      this.retryFailedReports();
    }, 30000); // Retry every 30 seconds
  }
}

// Create singleton instance
const errorHandlerService = new ErrorHandlerService();

// Start retry process
errorHandlerService.startRetryProcess();

// Make it available globally for debugging
if (process.env.NODE_ENV === 'development') {
  window.errorHandlerService = errorHandlerService;
}

export default errorHandlerService;
