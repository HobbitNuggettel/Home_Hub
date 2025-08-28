/**
 * Socket.IO service for real-time features
 * Handles WebSocket connections, events, and real-time data synchronization
 */

const { v4: uuidv4 } = require('uuid');

// Store active connections and user sessions
const activeConnections = new Map();
const userRooms = new Map();
const roomData = new Map();

/**
 * Initialize Socket.IO event handlers
 * @param {Object} io - Socket.IO server instance
 */
const initializeSocketHandlers = (io) => {
  console.log('🔌 Initializing Socket.IO handlers...');

  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);
    
    // Store connection info
    activeConnections.set(socket.id, {
      id: socket.id,
      connectedAt: new Date(),
      userId: null,
      userRole: null,
      lastActivity: new Date()
    });

    // Handle user authentication
    socket.on('authenticate', (data) => {
      try {
        const { userId, userRole, token } = data;
        
        if (!userId || !userRole) {
          socket.emit('auth_error', {
            error: true,
            message: 'Invalid authentication data',
            code: 'INVALID_AUTH_DATA'
          });
          return;
        }

        // Update connection info
        const connection = activeConnections.get(socket.id);
        if (connection) {
          connection.userId = userId;
          connection.userRole = userRole;
          connection.lastActivity = new Date();
        }

        // Join user's personal room
        socket.join(`user-${userId}`);
        userRooms.set(userId, socket.id);

        // Join role-based rooms
        socket.join(`role-${userRole}`);
        if (userRole === 'admin') {
          socket.join('admin-room');
        }

        console.log(`👤 User ${userId} (${userRole}) authenticated on socket ${socket.id}`);

        // Send authentication success
        socket.emit('authenticated', {
          success: true,
          message: 'Successfully authenticated',
          userId,
          userRole,
          timestamp: new Date().toISOString()
        });

        // Notify other users in admin room about new connection
        if (userRole === 'admin') {
          socket.to('admin-room').emit('admin_connected', {
            userId,
            socketId: socket.id,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('🔌 Authentication error:', error);
        socket.emit('auth_error', {
          error: true,
          message: 'Authentication failed',
          code: 'AUTH_FAILED'
        });
      }
    });

    // Handle real-time collaboration events
    socket.on('join_collaboration', (data) => {
      try {
        const { roomId, userId, userRole } = data;
        
        if (!roomId || !userId) {
          socket.emit('collaboration_error', {
            error: true,
            message: 'Invalid room data',
            code: 'INVALID_ROOM_DATA'
          });
          return;
        }

        // Join collaboration room
        socket.join(`collab-${roomId}`);
        
        // Store room data
        if (!roomData.has(roomId)) {
          roomData.set(roomId, {
            id: roomId,
            participants: new Set(),
            lastActivity: new Date(),
            data: {}
          });
        }

        const room = roomData.get(roomId);
        room.participants.add(userId);
        room.lastActivity = new Date();

        console.log(`👥 User ${userId} joined collaboration room ${roomId}`);

        // Notify other participants
        socket.to(`collab-${roomId}`).emit('user_joined', {
          userId,
          userRole,
          timestamp: new Date().toISOString(),
          participantCount: room.participants.size
        });

        // Send room info to joining user
        socket.emit('collaboration_joined', {
          success: true,
          roomId,
          participantCount: room.participants.size,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('🔌 Join collaboration error:', error);
        socket.emit('collaboration_error', {
          error: true,
          message: 'Failed to join collaboration room',
          code: 'JOIN_FAILED'
        });
      }
    });

    // Handle real-time document editing
    socket.on('document_edit', (data) => {
      try {
        const { roomId, userId, userRole, changes, documentId } = data;
        
        if (!roomId || !userId || !changes) {
          return;
        }

        // Update room data
        const room = roomData.get(roomId);
        if (room) {
          room.lastActivity = new Date();
          if (!room.data[documentId]) {
            room.data[documentId] = { changes: [], lastEdit: new Date() };
          }
          room.data[documentId].changes.push({
            userId,
            userRole,
            changes,
            timestamp: new Date().toISOString()
          });
          room.data[documentId].lastEdit = new Date();
        }

        // Broadcast changes to other participants
        socket.to(`collab-${roomId}`).emit('document_updated', {
          documentId,
          changes,
          userId,
          userRole,
          timestamp: new Date().toISOString()
        });

        // Send acknowledgment
        socket.emit('edit_acknowledged', {
          success: true,
          documentId,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('🔌 Document edit error:', error);
        socket.emit('edit_error', {
          error: true,
          message: 'Failed to process edit',
          code: 'EDIT_FAILED'
        });
      }
    });

    // Handle real-time chat messages
    socket.on('chat_message', (data) => {
      try {
        const { roomId, userId, userRole, message, messageId } = data;
        
        if (!roomId || !userId || !message) {
          return;
        }

        const chatMessage = {
          id: messageId || uuidv4(),
          userId,
          userRole,
          message,
          timestamp: new Date().toISOString()
        };

        // Store message in room data
        const room = roomData.get(roomId);
        if (room) {
          if (!room.data.chat) {
            room.data.chat = [];
          }
          room.data.chat.push(chatMessage);
          room.lastActivity = new Date();
        }

        // Broadcast message to all participants
        io.to(`collab-${roomId}`).emit('chat_message_received', chatMessage);

        // Send acknowledgment
        socket.emit('message_sent', {
          success: true,
          messageId: chatMessage.id,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('🔌 Chat message error:', error);
        socket.emit('chat_error', {
          error: true,
          message: 'Failed to send message',
          code: 'MESSAGE_FAILED'
        });
      }
    });

    // Handle user presence updates
    socket.on('presence_update', (data) => {
      try {
        const { userId, userRole, status, activity } = data;
        
        if (!userId || !status) {
          return;
        }

        // Update connection info
        const connection = activeConnections.get(socket.id);
        if (connection) {
          connection.lastActivity = new Date();
          connection.status = status;
          connection.currentActivity = activity;
        }

        // Broadcast presence update to relevant rooms
        socket.to(`user-${userId}`).emit('presence_changed', {
          userId,
          userRole,
          status,
          activity,
          timestamp: new Date().toISOString()
        });

        // Notify admin room if user is admin
        if (userRole === 'admin') {
          socket.to('admin-room').emit('admin_presence_update', {
            userId,
            status,
            activity,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('🔌 Presence update error:', error);
      }
    });

    // Handle inventory updates
    socket.on('inventory_update', (data) => {
      try {
        const { userId, userRole, action, itemId, itemData } = data;
        
        if (!userId || !action) {
          return;
        }

        // Broadcast inventory update to user's room
        socket.to(`user-${userId}`).emit('inventory_changed', {
          action,
          itemId,
          itemData,
          userId,
          userRole,
          timestamp: new Date().toISOString()
        });

        // Notify admin room for monitoring
        if (userRole !== 'admin') {
          socket.to('admin-room').emit('inventory_activity', {
            action,
            itemId,
            userId,
            userRole,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('🔌 Inventory update error:', error);
      }
    });

    // Handle spending updates
    socket.on('spending_update', (data) => {
      try {
        const { userId, userRole, action, transactionId, transactionData } = data;
        
        if (!userId || !action) {
          return;
        }

        // Broadcast spending update to user's room
        socket.to(`user-${userId}`).emit('spending_changed', {
          action,
          transactionId,
          transactionData,
          userId,
          userRole,
          timestamp: new Date().toISOString()
        });

        // Notify admin room for monitoring
        if (userRole !== 'admin') {
          socket.to('admin-room').emit('spending_activity', {
            action,
            transactionId,
            userId,
            userRole,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('🔌 Spending update error:', error);
      }
    });

    // Handle analytics data updates
    socket.on('analytics_update', (data) => {
      try {
        const { userId, userRole, chartType, data: chartData } = data;
        
        if (!userId || !chartType) {
          return;
        }

        // Broadcast analytics update to user's room
        socket.to(`user-${userId}`).emit('analytics_changed', {
          chartType,
          data: chartData,
          userId,
          userRole,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('🔌 Analytics update error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      
      // Clean up connection data
      const connection = activeConnections.get(socket.id);
      if (connection) {
        const { userId, userRole } = connection;
        
        // Remove from user rooms
        if (userId) {
          userRooms.delete(userId);
          
          // Notify other users about disconnection
          socket.to(`user-${userId}`).emit('user_disconnected', {
            userId,
            userRole,
            timestamp: new Date().toISOString()
          });

          // Notify admin room
          if (userRole === 'admin') {
            socket.to('admin-room').emit('admin_disconnected', {
              userId,
              timestamp: new Date().toISOString()
            });
          }
        }

        // Remove connection
        activeConnections.delete(socket.id);
      }

      // Clean up empty collaboration rooms
      for (const [roomId, room] of roomData.entries()) {
        if (room.participants.size === 0) {
          roomData.delete(roomId);
          console.log(`🗑️ Cleaned up empty collaboration room: ${roomId}`);
        }
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle error events
    socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
      socket.emit('socket_error', {
        error: true,
        message: 'Socket error occurred',
        code: 'SOCKET_ERROR',
        timestamp: new Date().toISOString()
      });
    });
  });

  console.log('✅ Socket.IO handlers initialized successfully');
};

/**
 * Get active connections statistics
 * @returns {Object} Connection statistics
 */
const getConnectionStats = () => {
  const totalConnections = activeConnections.size;
  const authenticatedUsers = Array.from(activeConnections.values())
    .filter(conn => conn.userId).length;
  const adminUsers = Array.from(activeConnections.values())
    .filter(conn => conn.userRole === 'admin').length;
  const activeRooms = roomData.size;

  return {
    totalConnections,
    authenticatedUsers,
    adminUsers,
    activeRooms,
    timestamp: new Date().toISOString()
  };
};

/**
 * Send notification to specific user
 * @param {string} userId - Target user ID
 * @param {Object} notification - Notification data
 */
const sendUserNotification = (userId, notification) => {
  const socketId = userRooms.get(userId);
  if (socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    }
  }
};

/**
 * Broadcast message to all authenticated users
 * @param {Object} message - Message data
 * @param {string} event - Event name
 */
const broadcastToAllUsers = (message, event = 'broadcast') => {
  io.emit(event, {
    ...message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send message to admin users only
 * @param {Object} message - Message data
 * @param {string} event - Event name
 */
const sendToAdmins = (message, event = 'admin_message') => {
  io.to('admin-room').emit(event, {
    ...message,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  initializeSocketHandlers,
  getConnectionStats,
  sendUserNotification,
  broadcastToAllUsers,
  sendToAdmins
};
