import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface OfflineData {
  inventory: any[];
  spending: any[];
  analytics: any[];
  lastSync: number;
}

interface OfflineContextType {
  isOnline: boolean;
  offlineData: OfflineData;
  syncData: () => Promise<void>;
  saveOfflineData: (key: keyof OfflineData, data: any) => Promise<void>;
  getOfflineData: (key: keyof OfflineData) => any[];
  isDataStale: (key: keyof OfflineData) => boolean;
  clearOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    inventory: [],
    spending: [],
    analytics: [],
    lastSync: Date.now(),
  });

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      // Auto-sync when coming back online
      if (state.isConnected && !isOnline) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  // Load offline data on mount
  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      const data = await AsyncStorage.getItem('offlineData');
      if (data) {
        setOfflineData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = async (key: keyof OfflineData, data: any) => {
    try {
      const newOfflineData = {
        ...offlineData,
        [key]: data,
        lastSync: Date.now(),
      };
      
      setOfflineData(newOfflineData);
      await AsyncStorage.setItem('offlineData', JSON.stringify(newOfflineData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const getOfflineData = (key: keyof OfflineData): any[] => {
    return offlineData[key] || [];
  };

  const isDataStale = (key: keyof OfflineData): boolean => {
    const lastSync = offlineData.lastSync;
    const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - lastSync > staleThreshold;
  };

  const syncData = async () => {
    if (!isOnline) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last sync time
      const newOfflineData = {
        ...offlineData,
        lastSync: Date.now(),
      };
      
      setOfflineData(newOfflineData);
      await AsyncStorage.setItem('offlineData', JSON.stringify(newOfflineData));
      
      console.log('Data synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const clearOfflineData = async () => {
    try {
      const emptyData: OfflineData = {
        inventory: [],
        spending: [],
        analytics: [],
        lastSync: Date.now(),
      };
      
      setOfflineData(emptyData);
      await AsyncStorage.setItem('offlineData', JSON.stringify(emptyData));
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  };

  const value: OfflineContextType = {
    isOnline,
    offlineData,
    syncData,
    saveOfflineData,
    getOfflineData,
    isDataStale,
    clearOfflineData,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
