/**
 * PWA Settings Component
 * Manages PWA-related settings and preferences
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Download, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Database,
  Trash2,
  Info
} from 'lucide-react';
import { 
  isAppInstallable, 
  isAppInstalled, 
  showInstallPrompt,
  updateApp,
  clearCache,
  getCacheStatus,
  requestNotificationPermission,
  sendNotification
} from '../../utils/serviceWorker';

const PWASettings = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState({});
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);

  // Check PWA status
  useEffect(() => {
    const checkStatus = async () => {
      setIsInstalled(isAppInstalled());
      setIsInstallable(isAppInstallable());
      
      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
      
      // Get cache status
      const status = await getCacheStatus();
      setCacheStatus(status);
    };

    checkStatus();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle install
  const handleInstall = async () => {
    setIsLoading(true);
    try {
      await showInstallPrompt();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clear cache
  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all cached data? This will remove offline content.')) {
      setIsLoading(true);
      try {
        await clearCache();
        const status = await getCacheStatus();
        setCacheStatus(status);
      } catch (error) {
        console.error('Clear cache failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle notification permission
  const handleNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        sendNotification('Notifications enabled', {
          body: 'You will now receive notifications from Home Hub.',
          icon: '/logo.svg'
        });
      }
    }
  };

  // Test notification
  const handleTestNotification = () => {
    if (notificationPermission === 'granted') {
      sendNotification('Test Notification', {
        body: 'This is a test notification from Home Hub.',
        icon: '/logo.svg',
        tag: 'test-notification'
      });
    }
  };

  // Get cache size
  const getCacheSize = () => {
    const total = Object.values(cacheStatus).reduce((sum, count) => sum + count, 0);
    return total;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'installed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'installable': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'not-installable': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Get status text
  const getStatusText = () => {
    if (isInstalled) return 'Installed';
    if (isInstallable) return 'Installable';
    return 'Not Installable';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PWA Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage Progressive Web App features and settings
          </p>
        </div>

        {/* PWA Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            PWA Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Installation Status */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Installation Status
              </h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(isInstalled ? 'installed' : isInstallable ? 'installable' : 'not-installable')}`}>
                {getStatusText()}
              </div>
            </div>

            {/* Connection Status */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                {isOnline ? (
                  <Wifi className="h-8 w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Connection Status
              </h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isOnline ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            {/* Cache Status */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Cache Status
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {getCacheSize()} items cached
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Installation Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Installation
            </h3>
            
            <div className="space-y-3">
              {!isInstalled && isInstallable && (
                <button
                  onClick={handleInstall}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Install PWA</span>
                </button>
              )}
              
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Check for Updates</span>
              </button>
            </div>
          </div>

          {/* Cache Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cache Management
            </h3>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Total cached items: {getCacheSize()}</p>
                <p>Cache namespaces: {Object.keys(cacheStatus).length}</p>
              </div>
              
              <button
                onClick={handleClearCache}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Notification Permission
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current status: {notificationPermission}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleNotificationPermission}
                  disabled={isLoading || notificationPermission === 'granted'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {notificationPermission === 'granted' ? 'Granted' : 'Request Permission'}
                </button>
                
                {notificationPermission === 'granted' && (
                  <button
                    onClick={handleTestNotification}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    Test Notification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PWA Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            PWA Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Offline Support
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                App-like Experience
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Background Sync
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Push Notifications
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Home Screen Installation
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Responsive Design
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWASettings;
