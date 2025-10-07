/**
 * Offline Indicator Component
 * Shows offline status and sync information
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Cloud,
  CloudOff,
  Smartphone,
  Monitor,
  Home,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useOffline } from '../../contexts/OfflineContext.js';
import deviceService from '../../services/DeviceService.js';

const OfflineIndicator = ({ 
  position = 'top-right',
  showDetails = false,
  className = ''
}) => {
  const { isOnline, syncStatus, syncOfflineData } = useOffline();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [errorState, setErrorState] = useState(null);
  const [deviceCount, setDeviceCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [syncOverdue, setSyncOverdue] = useState(false);

  // Update last sync time and check for issues
  useEffect(() => {
    if (syncStatus.lastSync) {
      const syncTime = new Date(syncStatus.lastSync);
      setLastSyncTime(syncTime);

      // Check if sync is overdue (more than 1 hour)
      const now = new Date();
      const timeDiff = now - syncTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      setSyncOverdue(hoursDiff > 1);
    }
  }, [syncStatus.lastSync]);

  // Initialize device service and calculate real device count
  useEffect(() => {
    const initializeDeviceTracking = async () => {
      try {
        // Initialize device service
        await deviceService.initialize();

        // Get real device count
        const deviceCount = deviceService.getActiveDeviceCount();
        setDeviceCount(deviceCount);
      } catch (error) {
        console.error('Failed to initialize device tracking:', error);
        // Fallback to showing current device
        setDeviceCount(isOnline ? 1 : 0);
      }
    };

    initializeDeviceTracking();

    // Set up periodic device count updates for real-time detection
    const deviceUpdateInterval = setInterval(() => {
      try {
        const currentCount = deviceService.getActiveDeviceCount();
        setDeviceCount(currentCount);
      } catch (error) {
        console.error('Failed to update device count:', error);
      }
    }, 5000); // Update every 5 seconds for real-time detection

    // Simulate conflicts only when there are actual pending items
    setConflictCount(syncStatus.queueSize > 5 ? Math.floor(Math.random() * 2) : 0);

    // Simulate sync progress
    if (syncStatus.syncInProgress) {
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setSyncProgress(0);
    }

    // Cleanup function
    return () => {
      clearInterval(deviceUpdateInterval);
    };
  }, [syncStatus.syncInProgress, syncStatus.offlineDataSize, syncStatus.queueSize, isOnline]);

  // Check for error states
  useEffect(() => {
    if (!isOnline && syncStatus.queueSize > 0) {
      setErrorState('offline_with_pending');
    } else if (syncStatus.queueSize > 10) {
      setErrorState('large_queue');
    } else if (conflictCount > 0) {
      setErrorState('conflicts');
    } else if (syncOverdue) {
      setErrorState('sync_overdue');
    } else {
      setErrorState(null);
    }
  }, [isOnline, syncStatus.queueSize, conflictCount, syncOverdue]);

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get status color with enhanced error states
  const getStatusColor = () => {
    if (errorState === 'offline_with_pending') return 'bg-red-600';
    if (errorState === 'conflicts') return 'bg-purple-500';
    if (errorState === 'sync_overdue') return 'bg-orange-600';
    if (errorState === 'large_queue') return 'bg-yellow-600';
    if (!isOnline) return 'bg-red-500';
    if (syncStatus.syncInProgress) return 'bg-blue-500';
    if (syncStatus.queueSize > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Get status icon with enhanced states
  const getStatusIcon = () => {
    if (errorState === 'offline_with_pending') return <XCircle className="h-4 w-4" />;
    if (errorState === 'conflicts') return <AlertCircle className="h-4 w-4" />;
    if (errorState === 'sync_overdue') return <AlertTriangle className="h-4 w-4" />;
    if (errorState === 'large_queue') return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (syncStatus.syncInProgress) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (syncStatus.queueSize > 0) return <Clock className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  // Get status text with enhanced messaging
  const getStatusText = () => {
    if (errorState === 'offline_with_pending') return 'Offline + Pending';
    if (errorState === 'conflicts') return `${conflictCount} Conflicts`;
    if (errorState === 'sync_overdue') return 'Sync Overdue';
    if (errorState === 'large_queue') return `${syncStatus.queueSize} Queued`;
    if (!isOnline) return 'Offline';
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (syncStatus.queueSize > 0) return `${syncStatus.queueSize} pending`;
    return 'Online';
  };

  // Handle manual sync
  const handleSync = async () => {
    if (isOnline && !syncStatus.syncInProgress) {
      await syncOfflineData();
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-40 ${className}`}>
      {/* Main indicator */}
      <button
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg text-white text-sm font-medium
          ${getStatusColor()} cursor-pointer transition-all duration-200 hover:scale-105
          ${errorState && errorState !== 'large_queue' ? 'animate-pulse' : ''}
          ${errorState === 'offline_with_pending' ? 'ring-2 ring-red-300' : ''}
          ${errorState === 'conflicts' ? 'ring-2 ring-purple-300' : ''}
          ${errorState === 'sync_overdue' ? 'ring-2 ring-orange-300' : ''}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-label="Toggle offline status details"
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        {showDetails && (
          <span className="text-xs opacity-75">
            ({syncStatus.offlineDataSize} offline)
          </span>
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Offline Status
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            {/* Connection status */}
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isOnline ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline ? 'Internet connection active' : 'No internet connection'}
                </p>
              </div>
            </div>

            {/* Sync status */}
            <div className="flex items-center space-x-3">
              {syncStatus.syncInProgress ? (
                <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
              ) : syncStatus.queueSize > 0 ? (
                <Clock className="h-5 w-5 text-orange-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {syncStatus.syncInProgress ? 'Syncing...' : 
                   syncStatus.queueSize > 0 ? 'Pending sync' : 'Up to date'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {syncStatus.queueSize > 0 ? `${syncStatus.queueSize} items pending` : 
                   'All data synchronized'}
                </p>
              </div>
            </div>

            {/* Offline data status with device count */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Offline Data
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {syncStatus.offlineDataSize} items stored locally
                  </p>
                </div>
              </div>

              {/* Active device count - more prominent */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Connected Devices
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {deviceCount}
                  </span>
                </div>
                {deviceCount > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {deviceCount === 1 ? 'This device is connected' : `Syncing data across ${deviceCount} devices`}
                  </p>
                )}
              </div>
            </div>

            {/* Device breakdown */}
            {deviceCount > 0 && (() => {
              try {
                const breakdown = deviceService.getDeviceBreakdown();
                const devices = Array.from(deviceService.activeDevices?.values() || []);

                return (
                  <div className="ml-8 space-y-2">
                    {breakdown.mobile > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Smartphone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {breakdown.mobile} mobile device{breakdown.mobile !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {breakdown.tablet > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {breakdown.tablet} tablet{breakdown.tablet !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {breakdown.desktop > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {breakdown.desktop} computer{breakdown.desktop !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Show browser breakdown if multiple browsers */}
                    {devices.length > 1 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active browsers:</div>
                        {devices.map((device, index) => (
                          <div key={device.id || index} className="flex items-center space-x-2 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">
                              {device.browser || 'Unknown'} {device.isMobile ? '(Mobile)' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } catch (error) {
                console.error('Device breakdown error:', error);
                // Fallback placeholder
                return (
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {deviceCount} device{deviceCount !== 1 ? 's' : ''} connected
                      </span>
                    </div>
                  </div>
                );
              }
            })()}

            {/* No devices message */}
            {deviceCount === 0 && (
              <div className="ml-8 text-sm text-gray-500 dark:text-gray-400 italic">
                Offline - no devices connected
              </div>
            )}

            {/* Sync progress indicator */}
            {syncStatus.syncInProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sync Progress</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {Math.round(syncProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error states and warnings */}
            {errorState && (
              <div className="p-3 rounded-lg border-l-4 bg-red-50 dark:bg-red-900/20 border-red-500">
                <div className="flex items-start space-x-2">
                  {errorState === 'offline_with_pending' && (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Offline with Pending Changes
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300">
                          {syncStatus.queueSize} changes will sync when connection is restored
                        </p>
                      </div>
                    </>
                  )}
                  {errorState === 'conflicts' && (
                    <>
                      <AlertCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Data Conflicts Detected
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-300">
                          {conflictCount} conflicts need manual resolution
                        </p>
                      </div>
                    </>
                  )}
                  {errorState === 'sync_overdue' && (
                    <>
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Sync Overdue
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-300">
                          Last sync was {formatTimeAgo(lastSyncTime)} - sync recommended
                        </p>
                      </div>
                    </>
                  )}
                  {errorState === 'large_queue' && (
                    <>
                      <Loader2 className="h-5 w-5 text-yellow-500 mt-0.5 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Large Sync Queue
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-300">
                          {syncStatus.queueSize} items queued - sync may take longer
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Last sync time */}
            {lastSyncTime && (
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Last Sync
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatTimeAgo(lastSyncTime)}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                {/* Primary action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleSync}
                    disabled={!isOnline || syncStatus.syncInProgress}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                      ${isOnline && !syncStatus.syncInProgress
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    <RefreshCw className={`h-4 w-4 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
                    <span>
                      {syncStatus.syncInProgress ? 'Syncing...' :
                        errorState === 'conflicts' ? 'Resolve Conflicts' :
                          errorState === 'sync_overdue' ? 'Sync Now' : 'Sync Now'}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsExpanded(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {/* Error-specific actions */}
                {errorState === 'conflicts' && (
                  <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-300 dark:border-purple-700 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>View Conflicts</span>
                  </button>
                )}

                {errorState === 'offline_with_pending' && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Changes will sync automatically when connection is restored
                    </p>
                  </div>
                )}

                {errorState === 'large_queue' && (
                  <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 border border-yellow-300 dark:border-yellow-700 rounded-md">
                    <Loader2 className="h-4 w-4" />
                    <span>Force Sync</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OfflineIndicator.propTypes = {
  position: PropTypes.string,
  showDetails: PropTypes.bool,
  className: PropTypes.string
};

export default OfflineIndicator;
