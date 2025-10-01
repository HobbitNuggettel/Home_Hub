import React from 'react';

// Mock RealTimeContext
export const RealTimeContext = React.createContext({
  isOnline: true,
  isConnected: true,
  connectionStatus: 'connected',
  lastSyncTime: null,
  syncInProgress: false,
  syncStatus: {
    offlineDataSize: 0,
    queueSize: 0,
    syncInProgress: false,
    lastSyncTime: null,
    conflicts: []
  },
  deviceCount: 1,
  conflictCount: 0,
  syncProgress: 0,
  errorState: null,
  syncOverdue: false,
  startSync: jest.fn(),
  stopSync: jest.fn(),
  forceSync: jest.fn(),
  resolveConflict: jest.fn(),
  clearConflicts: jest.fn(),
  updateConnectionStatus: jest.fn(),
  addToSyncQueue: jest.fn(),
  removeFromSyncQueue: jest.fn(),
  clearSyncQueue: jest.fn()
});

export const useRealTime = () => {
  const context = React.useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const mockValue = {
    isOnline: true,
    isConnected: true,
    connectionStatus: 'connected',
    lastSyncTime: null,
    syncInProgress: false,
    syncStatus: {
      offlineDataSize: 0,
      queueSize: 0,
      syncInProgress: false,
      lastSyncTime: null,
      conflicts: []
    },
    deviceCount: 1,
    conflictCount: 0,
    syncProgress: 0,
    errorState: null,
    syncOverdue: false,
    startSync: jest.fn(),
    stopSync: jest.fn(),
    forceSync: jest.fn(),
    resolveConflict: jest.fn(),
    clearConflicts: jest.fn(),
    updateConnectionStatus: jest.fn(),
    addToSyncQueue: jest.fn(),
    removeFromSyncQueue: jest.fn(),
    clearSyncQueue: jest.fn()
  };

  return React.createElement(RealTimeContext.Provider, { value: mockValue }, children);
};