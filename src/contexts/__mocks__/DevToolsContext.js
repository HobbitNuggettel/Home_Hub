import React, { createContext, useContext } from 'react';

const mockDevToolsContext = {
  isDevMode: false,
  toggleDevMode: jest.fn(),
  showDevTools: false,
  toggleDevTools: jest.fn(),
  devStats: {
    renderCount: 0,
    apiCalls: 0,
    cacheHits: 0,
    errorCount: 0,
  },
  logActivity: jest.fn(),
  clearLogs: jest.fn(),
};

const DevToolsContext = createContext(mockDevToolsContext);

export const useDevTools = () => {
  return useContext(DevToolsContext);
};

export const DevToolsProvider = ({ children }) => {
  return (
    <DevToolsContext.Provider value={mockDevToolsContext}>
      {children}
    </DevToolsContext.Provider>
  );
};

export default mockDevToolsContext;
