/**
 * Monitoring Context
 * Provides monitoring data and functionality throughout the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import comprehensiveMonitoringService from '../services/ComprehensiveMonitoringService';
import loggingService from '../services/LoggingService';

const MonitoringContext = createContext();

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};

export const MonitoringProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load monitoring data
  const loadMonitoringData = useCallback(async () => {
    try {
      // Load system health
      const health = comprehensiveMonitoringService.getSystemHealth();
      setSystemHealth(health);

      // Load performance metrics
      const metrics = comprehensiveMonitoringService.getMetrics();
      setPerformanceMetrics(metrics);

      // Load alerts
      const activeAlerts = comprehensiveMonitoringService.alerts.filter(alert => alert.status === 'active');
      setAlerts(activeAlerts);

      // Load recent logs
      const logs = await loggingService.getLogs({ limit: 20, level: 'all' });
      setRecentLogs(logs);

    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to load monitoring data', { error: err.message });
    }
  }, []);

  // Initialize monitoring
  const initializeMonitoring = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await comprehensiveMonitoringService.initialize();
      setIsInitialized(true);

      // Load initial data
      await loadMonitoringData();

      loggingService.info('Monitoring context initialized successfully');
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to initialize monitoring context', { error: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [loadMonitoringData]);


  // Refresh monitoring data
  const refreshData = useCallback(async () => {
    if (!isInitialized) return;
    await loadMonitoringData();
  }, [isInitialized, loadMonitoringData]);

  // Create alert
  const createAlert = useCallback((type, message, metadata = {}) => {
    comprehensiveMonitoringService.createAlert(type, message, metadata);
    loadMonitoringData(); // Refresh to show new alert
  }, [loadMonitoringData]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId) => {
    comprehensiveMonitoringService.acknowledgeAlert(alertId);
    loadMonitoringData(); // Refresh to update alert status
  }, [loadMonitoringData]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    comprehensiveMonitoringService.clearAlerts();
    setAlerts([]);
  }, []);

  // Export monitoring data
  const exportData = useCallback((format = 'json') => {
    return comprehensiveMonitoringService.exportData(format);
  }, []);

  // Set refresh interval
  const updateRefreshInterval = useCallback((interval) => {
    setRefreshInterval(interval);
  }, []);

  // Toggle auto refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    return comprehensiveMonitoringService.getDashboardData();
  }, []);

  // Log message
  const logMessage = useCallback((level, message, metadata = {}) => {
    loggingService[level](message, metadata);
  }, []);

  // Start performance measurement
  const startMeasure = useCallback((name) => {
    comprehensiveMonitoringService.performanceMonitoringService?.startMeasure(name);
  }, []);

  // End performance measurement
  const endMeasure = useCallback((name) => {
    comprehensiveMonitoringService.performanceMonitoringService?.endMeasure(name);
  }, []);

  // Record custom metric
  const recordMetric = useCallback((name, value, metadata = {}) => {
    comprehensiveMonitoringService.performanceMonitoringService?.recordMetric(name, value, metadata);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !isInitialized) return;

    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData, isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initializeMonitoring();
  }, [initializeMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        comprehensiveMonitoringService.stop();
      }
    };
  }, [isInitialized]);

  const value = {
    // State
    isInitialized,
    isLoading,
    error,
    systemHealth,
    performanceMetrics,
    alerts,
    recentLogs,
    refreshInterval,
    autoRefresh,

    // Actions
    initializeMonitoring,
    loadMonitoringData,
    refreshData,
    createAlert,
    acknowledgeAlert,
    clearAlerts,
    exportData,
    updateRefreshInterval,
    toggleAutoRefresh,
    getPerformanceSummary,
    logMessage,
    startMeasure,
    endMeasure,
    recordMetric,

    // Utilities
    logInfo: (message, metadata) => logMessage('info', message, metadata),
    logWarning: (message, metadata) => logMessage('warn', message, metadata),
    logError: (message, metadata) => logMessage('error', message, metadata),
    logDebug: (message, metadata) => logMessage('debug', message, metadata)
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
};

MonitoringProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default MonitoringContext;
