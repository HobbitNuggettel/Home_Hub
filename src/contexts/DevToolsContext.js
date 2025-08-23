import React, { createContext, useContext, useState, useEffect } from 'react';

const DevToolsContext = createContext();

export const useDevTools = () => {
  const context = useContext(DevToolsContext);
  if (!context) {
    throw new Error('useDevTools must be used within a DevToolsProvider');
  }
  return context;
};

export const DevToolsProvider = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [devToolsConfig, setDevToolsConfig] = useState({
    showStateDebug: false,
    showInstanceTracking: false,
    showPerformanceMetrics: false,
    showNetworkLogs: false,
    enableHotReload: false
  });

  // Load dev mode from localStorage
  useEffect(() => {
    const savedDevMode = localStorage.getItem('homeHub_devMode');
    console.log('🔧 DevToolsContext: Loading from localStorage:', savedDevMode);
    if (savedDevMode === 'true') {
      setIsDevMode(true);
    }
  }, []);

  // Save dev mode to localStorage
  useEffect(() => {
    console.log('🔧 DevToolsContext: Saving to localStorage:', isDevMode);
    localStorage.setItem('homeHub_devMode', isDevMode.toString());
  }, [isDevMode]);

  const toggleDevMode = () => {
    console.log('🔄 toggleDevMode called, current:', isDevMode, '-> new:', !isDevMode);
    setIsDevMode(!isDevMode);
    if (!isDevMode) {
      setShowDevTools(false);
    }
  };

  const toggleDevTools = () => {
    console.log('🔄 toggleDevTools called, isDevMode:', isDevMode, 'current showDevTools:', showDevTools);
    if (isDevMode) {
      setShowDevTools(!showDevTools);
    }
  };

  const updateDevToolsConfig = (key, value) => {
    setDevToolsConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const value = {
    isDevMode: isDevMode || false,
    showDevTools: showDevTools || false,
    devToolsConfig: devToolsConfig || {
      showStateDebug: false,
      showInstanceTracking: false,
      showPerformanceMetrics: false,
      showNetworkLogs: false,
      enableHotReload: false
    },
    toggleDevMode,
    toggleDevTools,
    updateDevToolsConfig
  };

  return (
    <DevToolsContext.Provider value={value}>
      {children}
    </DevToolsContext.Provider>
  );
};
