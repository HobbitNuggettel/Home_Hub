const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Collaboration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [team, family, household]
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [owner, admin, member, viewer]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *         settings:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/collaboration:
 *   get:
 *     summary: Get collaboration groups
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collaboration groups retrieved successfully
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Mock collaboration data - replace with database query
  const collaborations = [
    {
      id: 'collab-1',
      name: 'Family Household',
      type: 'family',
      members: [
        { userId: userId, role: 'owner', permissions: ['read', 'write', 'admin'] },
        { userId: 'user-2', role: 'admin', permissions: ['read', 'write'] },
        { userId: 'user-3', role: 'member', permissions: ['read'] }
      ],
      settings: {
        allowInvites: true,
        requireApproval: false,
        defaultPermissions: ['read']
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'collab-2',
      name: 'Roommates',
      type: 'household',
      members: [
        { userId: userId, role: 'admin', permissions: ['read', 'write'] },
        { userId: 'user-4', role: 'member', permissions: ['read', 'write'] }
      ],
      settings: {
        allowInvites: true,
        requireApproval: true,
        defaultPermissions: ['read']
      },
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-20T15:45:00Z'
    }
  ];

  res.json({
    success: true,
    data: collaborations
  });
}));

/**
 * @swagger
 * /api/collaboration/{collaborationId}:
 *   get:
 *     summary: Get specific collaboration group
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collaborationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaboration group retrieved successfully
 */
router.get('/:collaborationId', asyncHandler(async (req, res) => {
  const { collaborationId } = req.params;
  const userId = req.user.id;

  // Mock collaboration data - replace with database query
  const collaboration = {
    id: collaborationId,
    name: 'Family Household',
    type: 'family',
    members: [
      { userId: userId, role: 'owner', permissions: ['read', 'write', 'admin'] },
      { userId: 'user-2', role: 'admin', permissions: ['read', 'write'] },
      { userId: 'user-3', role: 'member', permissions: ['read'] }
    ],
    settings: {
      allowInvites: true,
      requireApproval: false,
      defaultPermissions: ['read']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  };

  res.json({
    success: true,
    data: collaboration
  });
}));

/**
 * @swagger
 * /api/collaboration:
 *   post:
 *     summary: Create new collaboration group
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
 *               type:
 *                 type: string
 *                 enum: [team, family, household]
 *               settings:
 *                 type: object
 *     responses:
 *       201:
 *         description: Collaboration group created successfully
 */
router.post('/', asyncHandler(async (req, res) => {
  const { name, type, settings } = req.body;
  const userId = req.user.id;

  // Mock creation - replace with database insert
  const newCollaboration = {
    id: `collab-${Date.now()}`,
    name,
    type,
    members: [
      { userId, role: 'owner', permissions: ['read', 'write', 'admin'] }
    ],
    settings: settings || {
      allowInvites: true,
      requireApproval: false,
      defaultPermissions: ['read']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: newCollaboration
  });
}));

/**
 * @swagger
 * /api/collaboration/{collaborationId}/members:
 *   get:
 *     summary: Get collaboration members
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collaborationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 */
router.get('/:collaborationId/members', asyncHandler(async (req, res) => {
  const { collaborationId } = req.params;

  // Mock members data - replace with database query
  const members = [
    {
      userId: 'user-1',
      email: 'user1@example.com',
      displayName: 'John Doe',
      role: 'owner',
      permissions: ['read', 'write', 'admin'],
      joinedAt: '2024-01-01T00:00:00Z'
    },
    {
      userId: 'user-2',
      email: 'user2@example.com',
      displayName: 'Jane Smith',
      role: 'admin',
      permissions: ['read', 'write'],
      joinedAt: '2024-01-05T10:30:00Z'
    }
  ];

  res.json({
    success: true,
    data: members
  });
}));

/**
 * @swagger
 * /api/collaboration/{collaborationId}/invite:
 *   post:
 *     summary: Invite user to collaboration
 *     tags: [Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collaborationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [admin, member, viewer]
 *                 default: member
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 */
router.post('/:collaborationId/invite', asyncHandler(async (req, res) => {
  const { collaborationId } = req.params;
  const { email, role = 'member' } = req.body;

  // Mock invitation - replace with actual invitation logic
  const invitation = {
    id: `invite-${Date.now()}`,
    collaborationId,
    email,
    role,
    status: 'pending',
    invitedBy: req.user.id,
    invitedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };

  res.json({
    success: true,
    message: 'Invitation sent successfully',
    data: invitation
  });
}));

module.exports = router;