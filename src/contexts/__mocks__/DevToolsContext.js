import React from 'react';
import PropTypes from 'prop-types';

// Mock DevToolsContext
export const DevToolsContext = React.createContext({
  isDevMode: false,
  setIsDevMode: jest.fn(),
  showDevTools: false,
  setShowDevTools: jest.fn(),
  devToolsConfig: {
    showStateDebug: false,
    showInstanceTracking: false,
    showPerformanceMetrics: false,
    showNetworkLogs: false,
    enableHotReload: false
  },
  setDevToolsConfig: jest.fn(),
  toggleDevMode: jest.fn(),
  toggleDevTools: jest.fn(),
  updateDevToolsConfig: jest.fn()
});

export const useDevTools = () => {
  const context = React.useContext(DevToolsContext);
  if (!context) {
    throw new Error('useDevTools must be used within a DevToolsProvider');
  }
  return context;
};

export const DevToolsProvider = ({ children }) => {
  const mockValue = {
    isDevMode: false,
    setIsDevMode: jest.fn(),
    showDevTools: false,
    setShowDevTools: jest.fn(),
    devToolsConfig: {
      showStateDebug: false,
      showInstanceTracking: false,
      showPerformanceMetrics: false,
      showNetworkLogs: false,
      enableHotReload: false
    },
    setDevToolsConfig: jest.fn(),
    toggleDevMode: jest.fn(),
    toggleDevTools: jest.fn(),
    updateDevToolsConfig: jest.fn()
  };

  return React.createElement(DevToolsContext.Provider, { value: mockValue }, children);
};
DevToolsProvider.propTypes = {
  children: PropTypes.node.isRequired
};
