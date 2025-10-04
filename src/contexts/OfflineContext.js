/**
 * Offline Context
 * Provides offline capabilities and sync status to React components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import offlineService from '../services/OfflineService';
import loggingService from '../services/LoggingService';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    syncInProgress: false,
    queueSize: 0,
    offlineDataSize: 0,
    lastSync: null
  });
  const [offlineData, setOfflineData] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize offline service
  useEffect(() => {
    const initOffline = async () => {
      try {
        // Wait for offline service to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const status = await offlineService.getSyncStatus();
        setSyncStatus(status);
        setIsInitialized(true);
        
        loggingService.info('Offline context initialized');
      } catch (error) {
        loggingService.error('Failed to initialize offline context', { error: error.message });
      }
    };

    initOffline();
  }, []);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      loggingService.info('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      loggingService.info('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update sync status periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateSyncStatus = async () => {
      try {
        const status = await offlineService.getSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        loggingService.error('Failed to update sync status', { error: error.message });
      }
    };

    const interval = setInterval(updateSyncStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [isInitialized]);

  /**
   * Cache data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  const cacheData = useCallback(async (key, data, ttl) => {
    try {
      await offlineService.cacheData(key, data, ttl);
      loggingService.debug('Data cached via context', { key });
    } catch (error) {
      loggingService.error('Failed to cache data via context', { key, error: error.message });
    }
  }, []);

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any} Cached data or null
   */
  const getCachedData = useCallback(async (key) => {
    try {
      return await offlineService.getCachedData(key);
    } catch (error) {
      loggingService.error('Failed to get cached data via context', { key, error: error.message });
      return null;
    }
  }, []);

  /**
   * Store data offline
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {any} data - Document data
   */
  const storeOfflineData = useCallback(async (collection, docId, data) => {
    try {
      await offlineService.storeOfflineData(collection, docId, data);
      
      // Update local state
      setOfflineData(prev => ({
        ...prev,
        [collection]: {
          ...prev[collection],
          [docId]: data
        }
      }));
      
      loggingService.debug('Data stored offline via context', { collection, docId });
    } catch (error) {
      loggingService.error('Failed to store offline data via context', { 
        collection, 
        docId, 
        error: error.message 
      });
    }
  }, []);

  /**
   * Get offline data
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {any} Offline data or null
   */
  const getOfflineData = useCallback(async (collection, docId) => {
    try {
      return await offlineService.getOfflineData(collection, docId);
    } catch (error) {
      loggingService.error('Failed to get offline data via context', { 
        collection, 
        docId, 
        error: error.message 
      });
      return null;
    }
  }, []);

  /**
   * Get all offline data for a collection
   * @param {string} collection - Collection name
   * @returns {Array} Array of offline data
   */
  const getAllOfflineData = useCallback(async (collection) => {
    try {
      return await offlineService.getAllOfflineData(collection);
    } catch (error) {
      loggingService.error('Failed to get all offline data via context', { 
        collection, 
        error: error.message 
      });
      return [];
    }
  }, []);

  /**
   * Add operation to sync queue
   * @param {string} operation - Operation type
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {any} data - Document data
   */
  const addToSyncQueue = useCallback(async (operation, collection, docId, data) => {
    try {
      await offlineService.addToSyncQueue(operation, collection, docId, data);
      
      // Update sync status
      const status = await offlineService.getSyncStatus();
      setSyncStatus(status);
      
      loggingService.debug('Added to sync queue via context', { operation, collection, docId });
    } catch (error) {
      loggingService.error('Failed to add to sync queue via context', { 
        operation, 
        collection, 
        docId, 
        error: error.message 
      });
    }
  }, []);

  /**
   * Sync offline data
   */
  const syncOfflineData = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      await offlineService.syncOfflineData();
      
      const status = await offlineService.getSyncStatus();
      setSyncStatus(status);
      
      loggingService.info('Offline data synced via context');
    } catch (error) {
      loggingService.error('Failed to sync offline data via context', { error: error.message });
    }
  }, []);

  /**
   * Download data for offline use
   * @param {string} collection - Collection name
   * @param {Object} filters - Query filters
   */
  const downloadForOffline = useCallback(async (collection, filters) => {
    try {
      const data = await offlineService.downloadForOffline(collection, filters);
      
      // Update local state
      setOfflineData(prev => ({
        ...prev,
        [collection]: data.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {})
      }));
      
      loggingService.info('Data downloaded for offline use via context', { collection, count: data.length });
      return data;
    } catch (error) {
      loggingService.error('Failed to download data for offline via context', { 
        collection, 
        error: error.message 
      });
      return [];
    }
  }, []);

  /**
   * Check if data is available offline
   * @param {string} collection - Collection name
   * @returns {boolean} True if data is available offline
   */
  const isDataAvailableOffline = useCallback(async (collection) => {
    try {
      return await offlineService.isDataAvailableOffline(collection);
    } catch (error) {
      loggingService.error('Failed to check offline data availability via context', { 
        collection, 
        error: error.message 
      });
      return false;
    }
  }, []);

  /**
   * Clear all offline data
   */
  const clearAllOfflineData = useCallback(async () => {
    try {
      await offlineService.clearAllOfflineData();
      setOfflineData({});
      
      const status = await offlineService.getSyncStatus();
      setSyncStatus(status);
      
      loggingService.info('All offline data cleared via context');
    } catch (error) {
      loggingService.error('Failed to clear offline data via context', { error: error.message });
    }
  }, []);

  /**
   * Get offline data for a collection from local state
   * @param {string} collection - Collection name
   * @returns {Array} Array of offline data
   */
  const getOfflineDataFromState = useCallback((collection) => {
    return offlineData[collection] ? Object.values(offlineData[collection]) : [];
  }, [offlineData]);

  /**
   * Get offline data count for a collection
   * @param {string} collection - Collection name
   * @returns {number} Number of offline items
   */
  const getOfflineDataCount = useCallback((collection) => {
    return offlineData[collection] ? Object.keys(offlineData[collection]).length : 0;
  }, [offlineData]);

  const value = {
    // Status
    isOnline,
    syncStatus,
    isInitialized,
    
    // Data management
    offlineData,
    getOfflineDataFromState,
    getOfflineDataCount,
    
    // Cache operations
    cacheData,
    getCachedData,
    
    // Offline data operations
    storeOfflineData,
    getOfflineData,
    getAllOfflineData,
    isDataAvailableOffline,
    
    // Sync operations
    addToSyncQueue,
    syncOfflineData,
    downloadForOffline,
    clearAllOfflineData
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

OfflineProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default OfflineContext;




