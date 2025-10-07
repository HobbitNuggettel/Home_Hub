/**
 * Monitoring Dashboard Component
 * Displays real-time monitoring data and metrics
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download,
  Settings,
  BarChart3,
  Server,
  Database,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Clock
} from 'lucide-react';
import { useMonitoring } from '../../contexts/MonitoringContext.js';
import { useAuth } from '../../contexts/AuthContext.js';

const MonitoringDashboard = () => {
  const { currentUser } = useAuth();
  const {
    isLoading,
    error,
    systemHealth,
    performanceMetrics,
    alerts,
    recentLogs,
    refreshInterval,
    autoRefresh,
    refreshData,
    exportData,
    updateRefreshInterval,
    toggleAutoRefresh,
    acknowledgeAlert,
    clearAlerts
  } = useMonitoring();
  
  const [selectedTab, setSelectedTab] = useState('overview');

  // Handle refresh interval change
  const handleRefreshIntervalChange = (interval) => {
    updateRefreshInterval(interval);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refreshData();
  };

  // Handle export logs
  const handleExportLogs = () => {
    const data = exportData('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monitoring-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle export performance metrics
  const handleExportMetrics = () => {
    const data = exportData('csv');
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Get log level color
  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'warn': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'info': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'debug': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Format uptime
  const formatUptime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Format bytes
  const formatBytes = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Monitoring Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Real-time system monitoring and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExportLogs}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </button>
              <button
                onClick={handleExportMetrics}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Metrics
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={toggleAutoRefresh}
                  className="mr-2"
                />
                Auto-refresh
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'logs', name: 'Logs', icon: Activity },
                { id: 'performance', name: 'Performance', icon: Cpu },
                { id: 'system', name: 'System', icon: Server }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
                    <p className={`text-2xl font-semibold ${getStatusColor(systemHealth?.overallStatus || 'unknown')}`}>
                      {(systemHealth?.overallStatus || 'unknown').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uptime</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatUptime(systemHealth?.uptime || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MemoryStick className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory Usage</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {systemHealth?.memory?.used || 0}GB / {systemHealth?.memory?.total || 0}GB
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Cpu className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CPU Usage</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {systemHealth?.cpu || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Logs</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                    {recentLogs.slice(0, 5).map((log, index) => (
                      <div key={`recent-log-${log.timestamp}-${log.level}`} className="flex items-start space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'logs' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Logs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentLogs.map((log, index) => (
                      <div key={`log-${log.timestamp}-${log.level}`} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(performanceMetrics.performance || {}).map(([name, data]) => (
                <div key={name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {name.toUpperCase()}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Average:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {data.average?.toFixed(2) || 'N/A'}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Min:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {data.min?.toFixed(2) || 'N/A'}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Max:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {data.max?.toFixed(2) || 'N/A'}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Count:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {data.count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Memory Usage */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Memory Usage</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Used</span>
                      <span>{systemHealth?.memory?.used || 0}GB / {systemHealth?.memory?.total || 1}GB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${((systemHealth?.memory?.used || 0) / (systemHealth?.memory?.total || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disk Usage */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Disk Usage</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Used</span>
                      <span>{systemHealth?.disk?.used || 0}GB / {systemHealth?.disk?.total || 1}GB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${((systemHealth?.disk?.used || 0) / (systemHealth?.disk?.total || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MonitoringDashboard.propTypes = {
  className: PropTypes.string
};

export default MonitoringDashboard;