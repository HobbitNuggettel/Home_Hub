import React, { createContext, useContext } from 'react';

const mockRealTimeContext = {
  isConnected: true,
  connectionStatus: 'connected',
  subscribe: jest.fn(() => jest.fn()), // Returns unsubscribe function
  unsubscribe: jest.fn(),
  stats: {
    totalListeners: 0,
    activeConnections: 1,
    lastUpdate: new Date().toISOString(),
  },
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

const RealTimeContext = createContext(mockRealTimeContext);

export const useRealTime = () => {
  return useContext(RealTimeContext);
};

export const RealTimeProvider = ({ children }) => {
  return (
    <RealTimeContext.Provider value={mockRealTimeContext}>
      {children}
    </RealTimeContext.Provider>
  );
};

export default mockRealTimeContext;