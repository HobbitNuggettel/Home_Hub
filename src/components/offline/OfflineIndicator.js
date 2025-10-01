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
  CloudOff
} from 'lucide-react';
import { useOffline } from '../../contexts/OfflineContext';

const OfflineIndicator = ({ 
  position = 'top-right',
  showDetails = false,
  className = ''
}) => {
  const { isOnline, syncStatus, syncOfflineData } = useOffline();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Update last sync time
  useEffect(() => {
    if (syncStatus.lastSync) {
      setLastSyncTime(new Date(syncStatus.lastSync));
    }
  }, [syncStatus.lastSync]);

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

  // Get status color
  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (syncStatus.syncInProgress) return 'bg-yellow-500';
    if (syncStatus.queueSize > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Get status icon
  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (syncStatus.syncInProgress) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (syncStatus.queueSize > 0) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  // Get status text
  const getStatusText = () => {
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
    <div className={`fixed ${getPositionClasses()} z-50 ${className}`}>
      {/* Main indicator */}
      <button
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg text-white text-sm font-medium
          ${getStatusColor()} cursor-pointer transition-all duration-200 hover:scale-105
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

            {/* Offline data status */}
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Offline Data
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {syncStatus.offlineDataSize} items stored locally
                </p>
              </div>
            </div>

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
                  <span>Sync Now</span>
                </button>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Close
                </button>
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
