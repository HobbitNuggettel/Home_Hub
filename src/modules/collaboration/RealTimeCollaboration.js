import React, { useState, useEffect } from 'react';
import { useRealTime, useRealTimeSubscription } from '../../contexts/RealTimeContext';
import { Users, Wifi, WifiOff, Clock, Activity, MessageSquare } from 'lucide-react';

/**
 * Real-time Collaboration Component for Home Hub Phase 2
 * Demonstrates real-time collaboration features including live updates,
 * collaborative editing, and presence indicators
 */
const RealTimeCollaboration = () => {
  const {
    connectionStatus,
    isRealTimeAvailable,
    setData,
    pushData,
    updateData,
    removeData,
    getActiveListenerCount,
    isInitialized
  } = useRealTime();

  // Check if running in mock mode
  const isMockMode = !isRealTimeAvailable && connectionStatus === 'connected';

  // Show loading state while initializing
  if (!isRealTimeAvailable && connectionStatus === 'disconnected' && !isInitialized) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Initializing Real-time Collaboration...
        </h3>
        <p className="text-blue-700">
          Setting up your real-time collaboration environment
        </p>
      </div>
    );
  }

  if (!isRealTimeAvailable && connectionStatus !== 'connected') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <WifiOff className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Real-time Collaboration Unavailable
        </h3>
        <p className="text-yellow-700">
          Connection status: {connectionStatus}
        </p>
        <p className="text-sm text-yellow-600 mt-2">
          Please check your internet connection and Firebase configuration.
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Development Tip:</strong> To enable real Firebase real-time features,
            create a <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file
            with your Firebase credentials.
          </p>
        </div>
      </div>
    );
  }

  const [collaborativeText, setCollaborativeText] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [lastActivity, setLastActivity] = useState(null);

  // Subscribe to collaborative text updates
  const { data: textData } = useRealTimeSubscription('collaboration/text', (data) => {
    if (data && data.content !== collaborativeText) {
      setCollaborativeText(data.content || '');
      setLastActivity(new Date());
    }
  });

  // Subscribe to messages
  const { data: messagesData } = useRealTimeSubscription('collaboration/messages', (data) => {
    if (data) {
      setMessages(Object.values(data).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp));
      setLastActivity(new Date());
    }
  });

  // Subscribe to active users
  const { data: usersData } = useRealTimeSubscription('collaboration/users', (data) => {
    if (data) {
      setActiveUsers(Object.values(data).filter(Boolean));
    }
  });

  // Update collaborative text in real-time
  const handleTextChange = async (e) => {
    const newText = e.target.value;
    setCollaborativeText(newText);

    try {
      await setData('collaboration/text', { content: newText });
    } catch (error) {
      console.error('Failed to update collaborative text:', error);
    }
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await pushData('collaboration/messages', {
        content: newMessage,
        timestamp: Date.now(),
        user: 'User-' + Math.floor(Math.random() * 1000) // Demo user ID
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Update user presence
  useEffect(() => {
    const updatePresence = async () => {
      try {
        const userId = 'User-' + Math.floor(Math.random() * 1000);
        await setData(`collaboration/users/${userId}`, {
          id: userId,
          lastSeen: Date.now(),
          isActive: true
        });

        // Cleanup on unmount
        return () => {
          removeData(`collaboration/users/${userId}`);
        };
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    if (isRealTimeAvailable) {
      updatePresence();
    }
  }, [isRealTimeAvailable, setData, removeData]);

  // Auto-cleanup inactive users
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      const now = Date.now();
      const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

      activeUsers.forEach(async (user) => {
        if (now - user.lastSeen > inactiveThreshold) {
          try {
            await removeData(`collaboration/users/${user.id}`);
          } catch (error) {
            console.error('Failed to cleanup inactive user:', error);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, [activeUsers, removeData]);

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Real-time Collaboration
            </h2>
            {isMockMode && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                🎭 Mock Mode
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Wifi className={`w-4 h-4 ${connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${connectionStatus === 'connected' ? 'text-green-700' : 'text-red-700'
                }`}>
                {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                {getActiveListenerCount()} listeners
              </span>
            </div>
          </div>
        </div>

        {/* Mock Mode Notice */}
        {isMockMode && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-purple-600">🎭</span>
              <p className="text-sm text-purple-700">
                <strong>Mock Mode Active:</strong> You&apos;re experiencing simulated real-time collaboration.
                All features work locally for development and testing purposes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Collaborative Text Editor */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
          Collaborative Text Editor
        </h3>
        <textarea
          value={collaborativeText}
          onChange={handleTextChange}
          placeholder="Start typing... This text will be synchronized in real-time with other users!"
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500"
        />
        {lastActivity && (
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last updated: {lastActivity.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Active Users */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 text-green-600 mr-2" />
          Active Users ({activeUsers.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">{user.id}</span>
              <span className="text-xs text-green-600">
                {new Date(user.lastSeen).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {activeUsers.length === 0 && (
            <p className="text-gray-500 text-sm col-span-full text-center py-4">
              No active users at the moment
            </p>
          )}
        </div>
      </div>

      {/* Real-time Chat */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
          Real-time Chat
        </h3>

        {/* Messages */}
        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50">
          {messages.map((message, index) => (
            <div key={`collaboration-message-${message.id || message.timestamp}`} className="mb-3 p-2 bg-white rounded border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-600">{message.user}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-800">{message.content}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              No messages yet. Start the conversation!
            </p>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Send
          </button>
        </form>
      </div>

      {/* Real-time Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 text-indigo-600 mr-2" />
          Real-time Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{connectionStatus === 'connected' ? '🟢' : '🔴'}</div>
            <div className="text-sm text-blue-800">Status</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
            <div className="text-sm text-green-800">Active Users</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{messages.length}</div>
            <div className="text-sm text-purple-800">Messages</div>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{getActiveListenerCount()}</div>
            <div className="text-sm text-indigo-800">Listeners</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeCollaboration;