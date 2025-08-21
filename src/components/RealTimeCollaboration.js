import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  MessageCircle, 
  Bell, 
  Activity,
  Eye,
  Edit,
  Save,
  X,
  Check,
  AlertCircle,
  Clock,
  User,
  Zap,
  DollarSign
} from 'lucide-react';
// Removed useAuth dependency for demo purposes

// Create WebSocket Context
const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Mock WebSocket implementation for demo purposes
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 1000);
  }
  
  send(data) {
    if (this.readyState === WebSocket.OPEN) {
      // Simulate echo for demo
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: 'echo',
              data: JSON.parse(data),
              timestamp: new Date().toISOString()
            })
          });
        }
      }, 100);
    }
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
}

// WebSocket Provider
export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [collaborativeEdits, setCollaborativeEdits] = useState({});

  // Initialize with mock data for demo
  useEffect(() => {
    // Set mock data for demo
    setActivities([
      {
        id: '1',
        type: 'user_joined',
        action: 'joined the session',
        user: { name: 'Demo User' },
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '2',
        type: 'item_added',
        action: 'added a new inventory item',
        details: 'Added "Sample Item" to Food',
        user: { name: 'Demo User' },
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ]);
    setOnlineUsers([
      { id: '1', name: 'Demo User', role: 'owner', lastSeen: new Date().toISOString() }
    ]);
    setNotifications([
      {
        id: '1',
        type: 'info',
        message: 'Welcome to Home Hub! Start by adding some inventory items.',
        timestamp: new Date().toISOString(),
        read: false
      }
    ]);
    
    // Simulate connection
    setIsConnected(true);
  }, []);

  // Mock functions for demo purposes
  const handleWebSocketMessage = useCallback((message) => {
    // This would handle real WebSocket messages in production
    console.log('Mock WebSocket message:', message);
  }, []);

  // Mock handler functions for demo purposes
  const handleUserPresence = (message) => {
    console.log('Mock user presence:', message);
  };

  const handleActivityUpdate = (message) => {
    console.log('Mock activity update:', message);
  };

  const handleNotification = (message) => {
    console.log('Mock notification:', message);
  };

  const handleCollaborativeEdit = (message) => {
    console.log('Mock collaborative edit:', message);
  };

  const handleDataSync = (message) => {
    console.log('Mock data sync:', message);
  };

  // Mock send functions for demo purposes
  const sendMessage = useCallback((message) => {
    console.log('Mock send message:', message);
  }, []);

  // Broadcast activity
  const broadcastActivity = useCallback((activity) => {
    console.log('Mock broadcast activity:', activity);
  }, []);

  // Send notification
  const sendNotification = useCallback((notification) => {
    console.log('Mock send notification:', notification);
  }, []);

  // Broadcast collaborative edit
  const broadcastEdit = useCallback((itemId, field, value) => {
    console.log('Mock broadcast edit:', { itemId, field, value });
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    isConnected,
    onlineUsers,
    activities,
    notifications,
    collaborativeEdits,
    sendMessage,
    broadcastActivity,
    sendNotification,
    broadcastEdit,
    markNotificationRead,
    clearAllNotifications
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Real-time Activity Feed
export const ActivityFeed = () => {
  const { activities, onlineUsers, isConnected } = useWebSocket();
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll ? activities : activities.slice(0, 10);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'item_added': return <Save className="text-green-500" size={16} />;
      case 'item_updated': return <Edit className="text-blue-500" size={16} />;
      case 'expense_added': return <DollarSign className="text-purple-500" size={16} />;
      case 'user_joined': return <User className="text-blue-500" size={16} />;
      default: return <Activity className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Live Activity</h3>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Wifi size={16} />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <WifiOff size={16} />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">
              {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map(user => (
              <div key={user.id} className="flex items-center space-x-2 bg-white px-2 py-1 rounded-md">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-700">{user.name}</span>
                <span className={`text-xs px-1 rounded ${
                  user.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Activity size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          displayedActivities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user?.name}</span> {activity.action}
                </p>
                {activity.details && (
                  <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700"
        >
          {showAll ? 'Show Less' : `Show All (${activities.length})`}
        </button>
      )}
    </div>
  );
};

// Real-time Notifications
export const NotificationCenter = () => {
  const { notifications, markNotificationRead, clearAllNotifications } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'success' ? 'bg-green-100' :
                          notification.type === 'warning' ? 'bg-yellow-100' :
                          notification.type === 'error' ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          {notification.type === 'success' ? <Check className="text-green-600" size={12} /> :
                           notification.type === 'warning' ? <AlertCircle className="text-yellow-600" size={12} /> :
                           notification.type === 'error' ? <X className="text-red-600" size={12} /> :
                           <Bell className="text-blue-600" size={12} />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Collaborative Editing Indicator
export const CollaborativeEditIndicator = ({ itemId, field }) => {
  const { collaborativeEdits } = useWebSocket();
  
  const edit = collaborativeEdits[itemId]?.[field];
  
  if (!edit) return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
      <Eye size={12} />
      <span>{edit.editor.name} is editing this</span>
      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
    </div>
  );
};

// Real-time Status Indicator
export const RealTimeStatus = () => {
  const { isConnected, onlineUsers } = useWebSocket();

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
      isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
      <span>{isConnected ? 'Live' : 'Offline'}</span>
      {isConnected && onlineUsers.length > 0 && (
        <span>• {onlineUsers.length} online</span>
      )}
    </div>
  );
};

export default WebSocketProvider;