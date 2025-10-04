import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  // Mock WebSocket functionality
  useEffect(() => {
    // Simulate WebSocket connection
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = (message) => {
    // Mock sending message
    console.log('Mock WebSocket message sent:', message);
    setLastMessage({ type: 'sent', content: message, timestamp: new Date() });
  };

  const value = {
    isConnected,
    lastMessage,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired
};
