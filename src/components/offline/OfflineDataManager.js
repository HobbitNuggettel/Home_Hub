/**
 * Offline Data Manager Component
 * Manages offline data download, sync, and storage
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useOffline } from '../../contexts/OfflineContext';
import { useAuth } from '../../contexts/AuthContext';

const OfflineDataManager = () => {
  const { currentUser } = useAuth();
  const {
    isOnline,
    syncStatus,
    offlineData,
    getOfflineDataFromState,
    getOfflineDataCount,
    downloadForOffline,
    syncOfflineData,
    clearAllOfflineData,
    isDataAvailableOffline
  } = useOffline();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [availableCollections] = useState([
    { id: 'inventory', name: 'Inventory Items', description: 'Product inventory and stock levels' },
    { id: 'spending', name: 'Spending Records', description: 'Expense tracking and budget data' },
    { id: 'recipes', name: 'Recipes', description: 'Recipe collection and meal planning' },
    { id: 'shopping', name: 'Shopping Lists', description: 'Shopping lists and items' },
    { id: 'users', name: 'User Data', description: 'User profiles and preferences' }
  ]);

  // Check offline availability for collections
  useEffect(() => {
    const checkAvailability = async () => {
      for (const collection of availableCollections) {
        const isAvailable = await isDataAvailableOffline(collection.id);
        setDownloadProgress(prev => ({
          ...prev,
          [collection.id]: { isAvailable, isDownloading: false }
        }));
      }
    };

    checkAvailability();
  }, [availableCollections, isDataAvailableOffline]);

  // Handle collection selection
  const handleCollectionToggle = (collectionId) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Handle download for offline
  const handleDownloadForOffline = async (collectionId) => {
    if (!isOnline) return;

    setIsLoading(true);
    setDownloadProgress(prev => ({
      ...prev,
      [collectionId]: { ...prev[collectionId], isDownloading: true }
    }));

    try {
      await downloadForOffline(collectionId);
      setDownloadProgress(prev => ({
        ...prev,
        [collectionId]: { isAvailable: true, isDownloading: false }
      }));
    } catch (error) {
      console.error('Failed to download for offline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download all selected
  const handleDownloadAll = async () => {
    if (!isOnline || selectedCollections.length === 0) return;

    setIsLoading(true);
    try {
      for (const collectionId of selectedCollections) {
        setDownloadProgress(prev => ({
          ...prev,
          [collectionId]: { ...prev[collectionId], isDownloading: true }
        }));

        await downloadForOffline(collectionId);
        
        setDownloadProgress(prev => ({
          ...prev,
          [collectionId]: { isAvailable: true, isDownloading: false }
        }));
      }
    } catch (error) {
      console.error('Failed to download all collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sync
  const handleSync = async () => {
    if (!isOnline) return;

    setIsLoading(true);
    try {
      await syncOfflineData();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clear all offline data
  const handleClearAll = async () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await clearAllOfflineData();
        setDownloadProgress({});
      } catch (error) {
        console.error('Failed to clear offline data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get collection status
  const getCollectionStatus = (collectionId) => {
    const progress = downloadProgress[collectionId];
    if (!progress) return 'unknown';
    
    if (progress.isDownloading) return 'downloading';
    if (progress.isAvailable) return 'available';
    return 'not-available';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'downloading':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not-available':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'downloading':
        return 'Downloading...';
      case 'available':
        return 'Available offline';
      case 'not-available':
        return 'Not available offline';
      default:
        return 'Unknown';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">Please log in to manage offline data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Offline Data Manager
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Download and manage data for offline use
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-500" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-500" />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Connection Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline ? 'Connected to internet' : 'Offline mode'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {syncStatus.queueSize} pending sync
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {syncStatus.offlineDataSize} offline items
                </p>
              </div>
              
              <button
                onClick={handleSync}
                disabled={!isOnline || syncStatus.syncInProgress || isLoading}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
                  ${isOnline && !syncStatus.syncInProgress && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <RefreshCw className={`h-4 w-4 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Collections
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadAll}
                disabled={!isOnline || selectedCollections.length === 0 || isLoading}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
                  ${isOnline && selectedCollections.length > 0 && !isLoading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <Download className="h-4 w-4" />
                <span>Download Selected ({selectedCollections.length})</span>
              </button>
              
              <button
                onClick={handleClearAll}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCollections.map((collection) => {
              const status = getCollectionStatus(collection.id);
              const itemCount = getOfflineDataCount(collection.id);
              
              return (
                <button
                  key={collection.id}
                  className={`
                    w-full text-left border rounded-lg p-6 cursor-pointer transition-all duration-200
                    ${selectedCollections.includes(collection.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  onClick={() => handleCollectionToggle(collection.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCollectionToggle(collection.id);
                    }
                  }}
                  aria-label={`Select ${collection.name} for offline download`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Database className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {collection.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collection.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {itemCount} items
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {getStatusText(status)}
                    </p>
                    
                    {status === 'available' && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Available offline
                      </p>
                    )}
                    
                    {status === 'not-available' && isOnline && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadForOffline(collection.id);
                        }}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Offline Data Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Offline Data Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableCollections.map((collection) => {
              const itemCount = getOfflineDataCount(collection.id);
              const status = getCollectionStatus(collection.id);
              
              return (
                <div key={collection.id} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {collection.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {itemCount} items
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineDataManager;
