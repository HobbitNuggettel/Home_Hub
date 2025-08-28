const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all collaboration routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     CollaborationRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [document, inventory, budget, general]
 *         ownerId:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/collaboration/rooms:
 *   get:
 *     summary: Get all collaboration rooms for the authenticated user
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [document, inventory, budget, general, all]
 *           default: all
 *         description: Filter rooms by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived, all]
 *           default: active
 *         description: Filter rooms by status
 *     responses:
 *       200:
 *         description: Collaboration rooms retrieved successfully
 */
router.get('/rooms', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type = 'all', status = 'active' } = req.query;

  // Mock collaboration rooms - replace with database query
  const allRooms = [
    {
      id: 'room-001',
      name: 'Monthly Budget Planning',
      description: 'Collaborative budget planning and review',
      type: 'budget',
      ownerId: userId,
      participants: [
        { userId, role: 'owner', name: 'John Doe', email: 'john@example.com', joinedAt: '2024-01-01T00:00:00.000Z' },
        { userId: 'user-002', role: 'editor', name: 'Jane Smith', email: 'jane@example.com', joinedAt: '2024-01-02T00:00:00.000Z' },
        { userId: 'user-003', role: 'viewer', name: 'Bob Johnson', email: 'bob@example.com', joinedAt: '2024-01-03T00:00:00.000Z' }
      ],
      status: 'active',
      lastActivity: '2024-01-25T10:00:00.000Z',
      participantCount: 3,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-25T10:00:00.000Z'
    },
    {
      id: 'room-002',
      name: 'Inventory Management',
      description: 'Shared inventory tracking and management',
      type: 'inventory',
      ownerId: 'user-002',
      participants: [
        { userId: 'user-002', role: 'owner', name: 'Jane Smith', email: 'jane@example.com', joinedAt: '2024-01-01T00:00:00.000Z' },
        { userId, role: 'editor', name: 'John Doe', email: 'john@example.com', joinedAt: '2024-01-02T00:00:00.000Z' }
      ],
      status: 'active',
      lastActivity: '2024-01-24T15:30:00.000Z',
      participantCount: 2,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-24T15:30:00.000Z'
    },
    {
      id: 'room-003',
      name: 'Project Documentation',
      description: 'Shared project documentation and notes',
      type: 'document',
      ownerId: userId,
      participants: [
        { userId, role: 'owner', name: 'John Doe', email: 'john@example.com', joinedAt: '2024-01-01T00:00:00.000Z' },
        { userId: 'user-004', role: 'editor', name: 'Alice Brown', email: 'alice@example.com', joinedAt: '2024-01-05T00:00:00.000Z' }
      ],
      status: 'active',
      lastActivity: '2024-01-23T14:20:00.000Z',
      participantCount: 2,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-23T14:20:00.000Z'
    }
  ];

  // Apply filters
  let filteredRooms = allRooms;
  
  if (type !== 'all') {
    filteredRooms = filteredRooms.filter(room => room.type === type);
  }
  
  if (status !== 'all') {
    filteredRooms = filteredRooms.filter(room => room.status === status);
  }

  // Sort by last activity
  filteredRooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

  res.json({
    success: true,
    rooms: filteredRooms,
    summary: {
      total: filteredRooms.length,
      byType: {
        document: filteredRooms.filter(r => r.type === 'document').length,
        inventory: filteredRooms.filter(r => r.type === 'inventory').length,
        budget: filteredRooms.filter(r => r.type === 'budget').length,
        general: filteredRooms.filter(r => r.type === 'general').length
      },
      byStatus: {
        active: filteredRooms.filter(r => r.status === 'active').length,
        inactive: filteredRooms.filter(r => r.status === 'inactive').length,
        archived: filteredRooms.filter(r => r.status === 'archived').length
      }
    }
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms:
 *   post:
 *     summary: Create a new collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [document, inventory, budget, general]
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Collaboration room created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/rooms', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, description, type, participants = [] } = req.body;

  // Validate required fields
  if (!name || !type) {
    return res.status(400).json({
      success: false,
      message: 'Name and type are required'
    });
  }

  // Validate type
  const validTypes = ['document', 'inventory', 'budget', 'general'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Type must be one of: ${validTypes.join(', ')}`
    });
  }

  // Create new room - replace with database insert
  const newRoom = {
    id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: description || '',
    type,
    ownerId: userId,
    participants: [
      { userId, role: 'owner', name: 'John Doe', email: 'john@example.com', joinedAt: new Date().toISOString() },
      ...participants.map(p => ({
        userId: p.userId,
        role: p.role || 'viewer',
        name: p.name || 'Unknown User',
        email: p.email || '',
        joinedAt: new Date().toISOString()
      }))
    ],
    status: 'active',
    lastActivity: new Date().toISOString(),
    participantCount: participants.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Collaboration room created successfully',
    room: newRoom
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}:
 *   get:
 *     summary: Get a specific collaboration room by ID
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Collaboration room retrieved successfully
 *       404:
 *         description: Room not found
 */
router.get('/rooms/:roomId', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  // Mock room - replace with database query
  const room = {
    id: roomId,
    name: 'Monthly Budget Planning',
    description: 'Collaborative budget planning and review',
    type: 'budget',
    ownerId: userId,
    participants: [
      { userId, role: 'owner', name: 'John Doe', email: 'john@example.com', joinedAt: '2024-01-01T00:00:00.000Z', isOnline: true, lastSeen: new Date().toISOString() },
      { userId: 'user-002', role: 'editor', name: 'Jane Smith', email: 'jane@example.com', joinedAt: '2024-01-02T00:00:00.000Z', isOnline: false, lastSeen: '2024-01-25T08:30:00.000Z' },
      { userId: 'user-003', role: 'viewer', name: 'Bob Johnson', email: 'bob@example.com', joinedAt: '2024-01-03T00:00:00.000Z', isOnline: true, lastSeen: new Date().toISOString() }
    ],
    status: 'active',
    lastActivity: '2024-01-25T10:00:00.000Z',
    participantCount: 3,
    onlineCount: 2,
    permissions: {
      canEdit: true,
      canInvite: true,
      canRemove: true,
      canArchive: true
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-25T10:00:00.000Z'
  };

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Collaboration room not found'
    });
  }

  res.json({
    success: true,
    room
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}/participants:
 *   get:
 *     summary: Get participants of a collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Participants retrieved successfully
 */
router.get('/rooms/:roomId/participants', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  // Mock participants - replace with database query
  const participants = [
    { userId, role: 'owner', name: 'John Doe', email: 'john@example.com', joinedAt: '2024-01-01T00:00:00.000Z', isOnline: true, lastSeen: new Date().toISOString() },
    { userId: 'user-002', role: 'editor', name: 'Jane Smith', email: 'jane@example.com', joinedAt: '2024-01-02T00:00:00.000Z', isOnline: false, lastSeen: '2024-01-25T08:30:00.000Z' },
    { userId: 'user-003', role: 'viewer', name: 'Bob Johnson', email: 'bob@example.com', joinedAt: '2024-01-03T00:00:00.000Z', isOnline: true, lastSeen: new Date().toISOString() }
  ];

  res.json({
    success: true,
    participants,
    summary: {
      total: participants.length,
      online: participants.filter(p => p.isOnline).length,
      byRole: {
        owner: participants.filter(p => p.role === 'owner').length,
        editor: participants.filter(p => p.role === 'editor').length,
        viewer: participants.filter(p => p.role === 'viewer').length
      }
    }
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}/participants:
 *   post:
 *     summary: Add a participant to a collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [owner, editor, viewer]
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant added successfully
 */
router.post('/rooms/:roomId/participants', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { participantUserId, role, email, name } = req.body;

  // Validate required fields
  if (!participantUserId || !role) {
    return res.status(400).json({
      success: false,
      message: 'userId and role are required'
    });
  }

  // Validate role
  const validRoles = ['owner', 'editor', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role must be one of: ${validRoles.join(', ')}`
    });
  }

  // Mock participant addition - replace with database operations
  const newParticipant = {
    userId: participantUserId,
    role,
    name: name || 'Unknown User',
    email: email || '',
    joinedAt: new Date().toISOString(),
    isOnline: false,
    lastSeen: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Participant added successfully',
    participant: newParticipant
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}/participants/{participantId}:
 *   delete:
 *     summary: Remove a participant from a collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Participant ID
 *     responses:
 *       200:
 *         description: Participant removed successfully
 */
router.delete('/rooms/:roomId/participants/:participantId', asyncHandler(async (req, res) => {
  const { roomId, participantId } = req.params;
  const userId = req.user.id;

  // Mock participant removal - replace with database operations
  res.json({
    success: true,
    message: 'Participant removed successfully'
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}/chat:
 *   get:
 *     summary: Get chat messages for a collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of messages to return
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Get messages before this timestamp
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully
 */
router.get('/rooms/:roomId/chat', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, before } = req.query;
  const userId = req.user.id;

  // Mock chat messages - replace with database query
  const messages = [
    {
      id: 'msg-001',
      roomId,
      userId,
      userName: 'John Doe',
      message: 'Welcome to the budget planning session!',
      type: 'text',
      timestamp: '2024-01-25T10:00:00.000Z',
      edited: false,
      deleted: false
    },
    {
      id: 'msg-002',
      roomId,
      userId: 'user-002',
      userName: 'Jane Smith',
      message: 'Thanks! I\'ve prepared some initial numbers.',
      type: 'text',
      timestamp: '2024-01-25T10:05:00.000Z',
      edited: false,
      deleted: false
    },
    {
      id: 'msg-003',
      roomId,
      userId: 'user-003',
      userName: 'Bob Johnson',
      message: 'Great! Let\'s review the categories.',
      type: 'text',
      timestamp: '2024-01-25T10:10:00.000Z',
      edited: false,
      deleted: false
    }
  ];

  res.json({
    success: true,
    messages,
    summary: {
      total: messages.length,
      byUser: {
        'John Doe': messages.filter(m => m.userName === 'John Doe').length,
        'Jane Smith': messages.filter(m => m.userName === 'Jane Smith').length,
        'Bob Johnson': messages.filter(m => m.userName === 'Bob Johnson').length
      }
    }
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}/chat:
 *   post:
 *     summary: Send a chat message to a collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, file, image]
 *                 default: text
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post('/rooms/:roomId/chat', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { message, type = 'text' } = req.body;

  // Validate required fields
  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  // Mock message creation - replace with database operations
  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    roomId,
    userId,
    userName: 'John Doe',
    message,
    type,
    timestamp: new Date().toISOString(),
    edited: false,
    deleted: false
  };

  res.json({
    success: true,
    message: 'Message sent successfully',
    chatMessage: newMessage
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}/presence:
 *   get:
 *     summary: Get presence information for a collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Presence information retrieved successfully
 */
router.get('/rooms/:roomId/presence', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  // Mock presence data - replace with real-time data
  const presence = {
    roomId,
    participants: [
      { userId, name: 'John Doe', isOnline: true, lastSeen: new Date().toISOString(), status: 'active' },
      { userId: 'user-002', name: 'Jane Smith', isOnline: false, lastSeen: '2024-01-25T08:30:00.000Z', status: 'away' },
      { userId: 'user-003', name: 'Bob Johnson', isOnline: true, lastSeen: new Date().toISOString(), status: 'active' }
    ],
    summary: {
      total: 3,
      online: 2,
      away: 1,
      offline: 0
    },
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    presence
  });
}));

/**
 * @swagger
 * /api/collaboration/rooms/{roomId}/presence:
 *   post:
 *     summary: Update presence status for a collaboration room
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [online, away, busy, offline]
 *     responses:
 *       200:
 *         description: Presence status updated successfully
 */
router.post('/rooms/:roomId/presence', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { status } = req.body;

  // Validate required fields
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  // Validate status
  const validStatuses = ['online', 'away', 'busy', 'offline'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  // Mock presence update - replace with real-time operations
  const presenceUpdate = {
    userId,
    roomId,
    status,
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Presence status updated successfully',
    presence: presenceUpdate
  });
}));

module.exports = router;
