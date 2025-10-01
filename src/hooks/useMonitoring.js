/**
 * Custom hook for monitoring functionality
 * Provides easy access to logging and performance monitoring services
 */

import { useCallback, useEffect, useState } from 'react';
import loggingService from '../services/LoggingService';
import performanceMonitoringService from '../services/PerformanceMonitoringService';

const useMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [error, setError] = useState(null);

  // Initialize monitoring
  const initializeMonitoring = useCallback(async () => {
    try {
      setError(null);
      
      // Start performance monitoring
      performanceMonitoringService.startMonitoring();
      setIsMonitoring(true);
      
      // Load initial data
      await loadLogs();
      await loadPerformanceMetrics();
      
      loggingService.info('Monitoring initialized successfully');
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to initialize monitoring', { error: err.message });
    }
  }, []);

  // Load logs
  const loadLogs = useCallback(async (options = {}) => {
    try {
      const logData = await loggingService.getLogs({
        limit: options.limit || 50,
        level: options.level || 'all',
        ...options
      });
      setLogs(logData);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to load logs', { error: err.message });
    }
  }, []);

  // Load performance metrics
  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const metrics = performanceMonitoringService.getMetrics();
      setPerformanceMetrics(metrics);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to load performance metrics', { error: err.message });
    }
  }, []);

  // Log message
  const log = useCallback((level, message, metadata = {}) => {
    try {
      loggingService[level](message, metadata);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Log info
  const logInfo = useCallback((message, metadata = {}) => {
    log('info', message, metadata);
  }, [log]);

  // Log warning
  const logWarning = useCallback((message, metadata = {}) => {
    log('warn', message, metadata);
  }, [log]);

  // Log error
  const logError = useCallback((message, metadata = {}) => {
    log('error', message, metadata);
  }, [log]);

  // Log debug
  const logDebug = useCallback((message, metadata = {}) => {
    log('debug', message, metadata);
  }, [log]);

  // Start performance measurement
  const startMeasure = useCallback((name) => {
    try {
      performanceMonitoringService.startMeasure(name);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to start performance measurement', { error: err.message });
    }
  }, []);

  // End performance measurement
  const endMeasure = useCallback((name) => {
    try {
      performanceMonitoringService.endMeasure(name);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to end performance measurement', { error: err.message });
    }
  }, []);

  // Record custom metric
  const recordMetric = useCallback((name, value, metadata = {}) => {
    try {
      performanceMonitoringService.recordMetric(name, value, metadata);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to record metric', { error: err.message });
    }
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    try {
      return performanceMonitoringService.getSummary();
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to get performance summary', { error: err.message });
      return null;
    }
  }, []);

  // Export logs
  const exportLogs = useCallback((format = 'json') => {
    try {
      return loggingService.exportLogs(format);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to export logs', { error: err.message });
      return null;
    }
  }, []);

  // Export performance metrics
  const exportMetrics = useCallback((format = 'json') => {
    try {
      return performanceMonitoringService.exportMetrics(format);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to export metrics', { error: err.message });
      return null;
    }
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    try {
      loggingService.clearLogs();
      setLogs([]);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to clear logs', { error: err.message });
    }
  }, []);

  // Clear performance metrics
  const clearMetrics = useCallback(() => {
    try {
      performanceMonitoringService.clearMetrics();
      setPerformanceMetrics({});
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to clear metrics', { error: err.message });
    }
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    try {
      performanceMonitoringService.stopMonitoring();
      setIsMonitoring(false);
      loggingService.info('Monitoring stopped');
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to stop monitoring', { error: err.message });
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(async () => {
      await loadLogs();
      await loadPerformanceMetrics();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, loadLogs, loadPerformanceMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isMonitoring, stopMonitoring]);

  return {
    // State
    isMonitoring,
    logs,
    performanceMetrics,
    error,
    
    // Actions
    initializeMonitoring,
    loadLogs,
    loadPerformanceMetrics,
    logInfo,
    logWarning,
    logError,
    logDebug,
    startMeasure,
    endMeasure,
    recordMetric,
    getPerformanceSummary,
    exportLogs,
    exportMetrics,
    clearLogs,
    clearMetrics,
    stopMonitoring,
    
    // Utilities
    log
  };
};

export default useMonitoring;



