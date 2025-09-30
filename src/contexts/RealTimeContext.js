import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import realTimeService from '../services/RealTimeService';

const RealTimeContext = createContext();

/**
 * Real-time Context Provider for Home Hub Phase 2
 * Manages real-time collaboration state and provides real-time functionality
 */
export const RealTimeProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize real-time service
  useEffect(() => {
    const initRealTime = async () => {
      try {
        // Set initialized immediately to prevent loading screen
        setIsInitialized(true);
        
        // Monitor connection status
        const checkConnection = () => {
          const status = realTimeService.getConnectionStatus();
          setConnectionStatus(status);
        };

        // Check connection immediately and then every 5 seconds
        checkConnection();
        const interval = setInterval(checkConnection, 5000);

        console.log('🚀 Real-time context initialized successfully');

        return () => clearInterval(interval);
      } catch (error) {
        console.error('❌ Failed to initialize real-time context:', error);
        setIsInitialized(true); // Mark as initialized even if failed
      }
    };

    // Initialize immediately without delay
    initRealTime();
  }, []);

  // Subscribe to real-time updates
  const subscribeToUpdates = useCallback((path, listenerId, onUpdate) => {
    if (!isInitialized) {
      // Only warn once to reduce noise
      if (!window.realTimeWarningShown) {
        console.warn('⚠️ Real-time context not yet initialized');
        window.realTimeWarningShown = true;
      }
      return null;
    }

    return realTimeService.subscribe(path, (data, key) => {
      setRealTimeData(prev => ({
        ...prev,
        [path]: { data, key, lastUpdated: Date.now() }
      }));
      
      if (onUpdate) {
        onUpdate(data, key);
      }
    }, listenerId);
  }, [isInitialized]);

  // Unsubscribe from updates
  const unsubscribeFromUpdates = useCallback((listenerId) => {
    realTimeService.unsubscribe(listenerId);
  }, []);

  // Set data with real-time updates
  const setData = useCallback(async (path, data) => {
    try {
      await realTimeService.setData(path, data);
      return true;
    } catch (error) {
      console.error('❌ Failed to set real-time data:', error);
      throw error;
    }
  }, []);

  // Push data to a list with real-time updates
  const pushData = useCallback(async (path, data) => {
    try {
      const key = await realTimeService.pushData(path, data);
      return key;
    } catch (error) {
      console.error('❌ Failed to push real-time data:', error);
      throw error;
    }
  }, []);

  // Update data with real-time updates
  const updateData = useCallback(async (path, updates) => {
    try {
      await realTimeService.updateData(path, updates);
      return true;
    } catch (error) {
      console.error('❌ Failed to update real-time data:', error);
      throw error;
    }
  }, []);

  // Remove data with real-time updates
  const removeData = useCallback(async (path) => {
    try {
      await realTimeService.removeData(path);
      return true;
    } catch (error) {
      console.error('❌ Failed to remove real-time data:', error);
      throw error;
    }
  }, []);

  // Get real-time data for a specific path
  const getRealTimeData = useCallback((path) => {
    return realTimeData[path] || null;
  }, [realTimeData]);

  // Get all real-time data
  const getAllRealTimeData = useCallback(() => {
    return realTimeData;
  }, [realTimeData]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return connectionStatus;
  }, [connectionStatus]);

  // Check if real-time is available
  const isRealTimeAvailable = useCallback(() => {
    // Consider mock mode as available for development
    return isInitialized && (connectionStatus === 'connected' || realTimeService.isMockMode());
  }, [isInitialized, connectionStatus]);

  // Get mock mode status
  const isMockMode = useCallback(() => {
    return realTimeService.isMockMode();
  }, []);

  // Get active listener count
  const getActiveListenerCount = useCallback(() => {
    return realTimeService.getActiveListenerCount();
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    realTimeService.cleanup();
  }, []);

  const value = {
    // State
    connectionStatus,
    activeCollaborators,
    isInitialized,
    isRealTimeAvailable: isRealTimeAvailable(),
    isMockMode: isMockMode(),
    
    // Methods
    subscribeToUpdates,
    unsubscribeFromUpdates,
    setData,
    pushData,
    updateData,
    removeData,
    getRealTimeData,
    getAllRealTimeData,
    getConnectionStatus,
    getActiveListenerCount,
    cleanup
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

RealTimeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to use real-time context
 * @returns {Object} Real-time context value
 */
export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

/**
 * Hook to subscribe to real-time updates for a specific path
 * @param {string} path - Database path to subscribe to
 * @param {Function} onUpdate - Callback function for updates
 * @returns {Object} Real-time data and subscription methods
 */
export const useRealTimeSubscription = (path, onUpdate) => {
  const { subscribeToUpdates, unsubscribeFromUpdates, getRealTimeData } = useRealTime();
  const [listenerId] = useState(`subscription-${path}-${Date.now()}`);

  useEffect(() => {
    if (path) {
      const unsubscribe = subscribeToUpdates(path, listenerId, onUpdate);
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        unsubscribeFromUpdates(listenerId);
      };
    }
  }, [path, listenerId, subscribeToUpdates, unsubscribeFromUpdates, onUpdate]);

  return {
    data: getRealTimeData(path),
    listenerId
  };
};

export default RealTimeContext;
