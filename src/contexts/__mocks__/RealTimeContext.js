import React, { createContext, useContext } from 'react';

const mockRealTimeContext = {
  isConnected: true,
  connectionStatus: 'connected',
  listeners: {},
  subscribe: jest.fn(() => jest.fn()), // Returns unsubscribe function
  unsubscribe: jest.fn(),
  setData: jest.fn(() => Promise.resolve()),
  pushData: jest.fn(() => Promise.resolve()),
  updateData: jest.fn(() => Promise.resolve()),
  removeData: jest.fn(() => Promise.resolve()),
  stats: {
    totalListeners: 0,
    activeConnections: 1,
    dataTransferred: 0,
  },
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