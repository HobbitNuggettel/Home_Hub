const express = require('express');
const { body } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireRole, requireOwnershipOrAdmin, validateCommonFields, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         displayName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         photoURL:
 *           type: string
 *         preferences:
 *           type: object
 *         lastSeen:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', asyncHandler(async (req, res) => {
  // Mock user data - replace with database query
  const user = {
    id: req.user.id,
    email: req.user.email,
    displayName: 'Test User',
    role: req.user.role,
    photoURL: null,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    user
  });
}));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               photoURL:
 *                 type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/profile',
  [
    body('displayName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters'),
    body('photoURL').optional().isURL().withMessage('Photo URL must be a valid URL'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { displayName, photoURL, preferences } = req.body;

    // Mock profile update - replace with database update
    const updatedUser = {
      id: req.user.id,
      email: req.user.email,
      displayName: displayName || 'Test User',
      role: req.user.role,
      photoURL: photoURL || null,
      preferences: preferences || {
        theme: 'light',
        notifications: true,
        language: 'en'
      },
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  })
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Current password incorrect
 */
router.post('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Mock password change - replace with database update
    // In real app, verify current password and hash new password

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', requireRole('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;

  // Mock users data - replace with database query
  const mockUsers = [
    {
      id: 'user-1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin',
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-2',
      email: 'user@example.com',
      displayName: 'Regular User',
      role: 'user',
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  // Filter by role if specified
  let filteredUsers = mockUsers;
  if (role) {
    filteredUsers = mockUsers.filter(user => user.role === role);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json({
    success: true,
    users: paginatedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / limit)
    }
  });
}));

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID (admin or own profile)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get('/:userId', requireOwnershipOrAdmin('userId'), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Mock user lookup - replace with database query
  const user = {
    id: userId,
    email: 'user@example.com',
    displayName: 'Test User',
    role: 'user',
    photoURL: null,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!user) {
    return res.status(404).json({
      error: true,
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    user
  });
}));

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put('/:userId', requireRole('admin'), asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { displayName, role, preferences } = req.body;

  // Mock user update - replace with database update
  const updatedUser = {
    id: userId,
    email: 'user@example.com',
    displayName: displayName || 'Test User',
    role: role || 'user',
    photoURL: null,
    preferences: preferences || {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser
  });
}));

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/:userId', requireRole('admin'), asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Mock user deletion - replace with database deletion
  // In real app, handle cascading deletes and data cleanup

  res.json({
    success: true,
    message: 'User deleted successfully',
    userId
  });
}));

/**
 * @swagger
 * /api/users/me/activity:
 *   get:
 *     summary: Get current user activity
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 */
router.get('/me/activity', asyncHandler(async (req, res) => {
  // Mock activity data - replace with database query
  const activity = [
    {
      id: 'activity-1',
      type: 'login',
      description: 'User logged in',
      timestamp: new Date().toISOString()
    },
    {
      id: 'activity-2',
      type: 'inventory_update',
      description: 'Added new item to inventory',
      timestamp: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    activity
  });
}));

module.exports = router;
