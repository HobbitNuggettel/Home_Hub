const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all notification routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [info, warning, error, success, alert]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         category:
 *           type: string
 *           enum: [system, budget, inventory, spending, reminder, alert]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [unread, read, archived]
 *         actionUrl:
 *           type: string
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         readAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unread, read, archived, all]
 *           default: all
 *         description: Filter notifications by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success, alert, all]
 *           default: all
 *         description: Filter notifications by type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [system, budget, inventory, spending, reminder, alert, all]
 *           default: all
 *         description: Filter notifications by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    status = 'all', 
    type = 'all', 
    category = 'all', 
    limit = 50, 
    page = 1 
  } = req.query;

  // Mock notifications - replace with database query
  const allNotifications = [
    {
      id: 'notif-001',
      userId,
      type: 'warning',
      title: 'Budget Alert',
      message: 'Utilities category is 98.3% utilized',
      category: 'budget',
      priority: 'medium',
      status: 'unread',
      actionUrl: '/budget/monthly-household',
      metadata: { category: 'Utilities', utilization: 98.3, threshold: 90 },
      createdAt: '2024-01-25T10:00:00.000Z',
      readAt: null,
      expiresAt: '2024-02-25T10:00:00.000Z'
    },
    {
      id: 'notif-002',
      userId,
      type: 'info',
      title: 'Inventory Update',
      message: '12 items are running low on stock',
      category: 'inventory',
      priority: 'low',
      status: 'unread',
      actionUrl: '/inventory?filter=low-stock',
      metadata: { count: 12, items: ['Milk', 'Bread', 'Eggs'] },
      createdAt: '2024-01-25T09:00:00.000Z',
      readAt: null,
      expiresAt: '2024-02-25T09:00:00.000Z'
    },
    {
      id: 'notif-003',
      userId,
      type: 'success',
      title: 'Goal Achieved',
      message: 'Monthly savings target reached!',
      category: 'budget',
      priority: 'low',
      status: 'read',
      actionUrl: '/budget/savings-goals',
      metadata: { goal: 'Monthly Savings', target: 500, achieved: 500 },
      createdAt: '2024-01-24T15:00:00.000Z',
      readAt: '2024-01-24T15:30:00.000Z',
      expiresAt: '2024-02-24T15:00:00.000Z'
    },
    {
      id: 'notif-004',
      userId,
      type: 'alert',
      title: 'High Spending',
      message: 'Daily spending exceeded average by 45%',
      category: 'spending',
      priority: 'high',
      status: 'unread',
      actionUrl: '/spending/analytics',
      metadata: { dailyAverage: 45.20, currentDay: 65.50, increase: 45.1 },
      createdAt: '2024-01-25T08:00:00.000Z',
      readAt: null,
      expiresAt: '2024-01-26T08:00:00.000Z'
    },
    {
      id: 'notif-005',
      userId,
      type: 'reminder',
      title: 'Bill Due Soon',
      message: 'Electricity bill due in 3 days',
      category: 'reminder',
      priority: 'medium',
      status: 'unread',
      actionUrl: '/bills/electricity',
      metadata: { billType: 'Electricity', dueDate: '2024-01-28', amount: 89.50 },
      createdAt: '2024-01-25T07:00:00.000Z',
      readAt: null,
      expiresAt: '2024-01-28T23:59:59.000Z'
    },
    {
      id: 'notif-006',
      userId,
      type: 'system',
      title: 'App Update',
      message: 'New features available in Home Hub v2.1',
      category: 'system',
      priority: 'low',
      status: 'read',
      actionUrl: '/settings/updates',
      metadata: { version: '2.1', features: ['Dark Mode', 'Export Reports'] },
      createdAt: '2024-01-23T12:00:00.000Z',
      readAt: '2024-01-23T12:15:00.000Z',
      expiresAt: '2024-02-23T12:00:00.000Z'
    }
  ];

  // Apply filters
  let filteredNotifications = allNotifications;
  
  if (status !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.status === status);
  }
  
  if (type !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.type === type);
  }
  
  if (category !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.category === category);
  }

  // Sort by priority and creation date
  filteredNotifications.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  // Calculate pagination info
  const totalNotifications = filteredNotifications.length;
  const totalPages = Math.ceil(totalNotifications / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    notifications: paginatedNotifications,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalNotifications,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit)
    },
    summary: {
      total: totalNotifications,
      unread: allNotifications.filter(n => n.status === 'unread').length,
      read: allNotifications.filter(n => n.status === 'read').length,
      archived: allNotifications.filter(n => n.status === 'archived').length,
      byType: {
        info: allNotifications.filter(n => n.type === 'info').length,
        warning: allNotifications.filter(n => n.type === 'warning').length,
        error: allNotifications.filter(n => n.type === 'error').length,
        success: allNotifications.filter(n => n.type === 'success').length,
        alert: allNotifications.filter(n => n.type === 'alert').length
      },
      byPriority: {
        urgent: allNotifications.filter(n => n.priority === 'urgent').length,
        high: allNotifications.filter(n => n.priority === 'high').length,
        medium: allNotifications.filter(n => n.priority === 'medium').length,
        low: allNotifications.filter(n => n.priority === 'low').length
      }
    }
  });
}));

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   get:
 *     summary: Get a specific notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       404:
 *         description: Notification not found
 */
router.get('/:notificationId', asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  // Mock notification - replace with database query
  const notification = {
    id: notificationId,
    userId,
    type: 'warning',
    title: 'Budget Alert',
    message: 'Utilities category is 98.3% utilized',
    category: 'budget',
    priority: 'medium',
    status: 'unread',
    actionUrl: '/budget/monthly-household',
    metadata: { 
      category: 'Utilities', 
      utilization: 98.3, 
      threshold: 90,
      currentAmount: 245.67,
      allocatedAmount: 250.00,
      remainingAmount: 4.33
    },
    createdAt: '2024-01-25T10:00:00.000Z',
    readAt: null,
    expiresAt: '2024-02-25T10:00:00.000Z',
    relatedItems: [
      { type: 'transaction', id: 'trans-001', amount: 45.67, date: '2024-01-25' },
      { type: 'transaction', id: 'trans-002', amount: 89.50, date: '2024-01-24' }
    ]
  };

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    notification
  });
}));

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch('/:notificationId/read', asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  // Mock notification update - replace with database update
  const notification = {
    id: notificationId,
    userId,
    type: 'warning',
    title: 'Budget Alert',
    message: 'Utilities category is 98.3% utilized',
    category: 'budget',
    priority: 'medium',
    status: 'read',
    actionUrl: '/budget/monthly-household',
    metadata: { category: 'Utilities', utilization: 98.3, threshold: 90 },
    createdAt: '2024-01-25T10:00:00.000Z',
    readAt: new Date().toISOString(),
    expiresAt: '2024-02-25T10:00:00.000Z'
  };

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification marked as read',
    notification
  });
}));

/**
 * @swagger
 * /api/notifications/{notificationId}/archive:
 *   patch:
 *     summary: Archive a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification archived
 *       404:
 *         description: Notification not found
 */
router.patch('/:notificationId/archive', asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  // Mock notification update - replace with database update
  const notification = {
    id: notificationId,
    userId,
    type: 'warning',
    title: 'Budget Alert',
    message: 'Utilities category is 98.3% utilized',
    category: 'budget',
    priority: 'medium',
    status: 'archived',
    actionUrl: '/budget/monthly-household',
    metadata: { category: 'Utilities', utilization: 98.3, threshold: 90 },
    createdAt: '2024-01-25T10:00:00.000Z',
    readAt: '2024-01-25T10:30:00.000Z',
    archivedAt: new Date().toISOString(),
    expiresAt: '2024-02-25T10:00:00.000Z'
  };

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification archived',
    notification
  });
}));

/**
 * @swagger
 * /api/notifications/bulk/read:
 *   patch:
 *     summary: Mark multiple notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */
router.patch('/bulk/read', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'notificationIds array is required and must not be empty'
    });
  }

  // Mock bulk update - replace with database update
  const updatedCount = notificationIds.length;

  res.json({
    success: true,
    message: `${updatedCount} notifications marked as read`,
    updatedCount,
    notificationIds
  });
}));

/**
 * @swagger
 * /api/notifications/bulk/archive:
 *   patch:
 *     summary: Archive multiple notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Notifications archived
 */
router.patch('/bulk/archive', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'notificationIds array is required and must not be empty'
    });
  }

  // Mock bulk update - replace with database update
  const updatedCount = notificationIds.length;

  res.json({
    success: true,
    message: `${updatedCount} notifications archived`,
    updatedCount,
    notificationIds
  });
}));

/**
 * @swagger
 * /api/notifications/settings:
 *   get:
 *     summary: Get notification preferences for the user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 */
router.get('/settings', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Mock notification settings - replace with database query
  const settings = {
    userId,
    email: {
      enabled: true,
      frequency: 'immediate',
      categories: ['budget', 'inventory', 'spending', 'reminder'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    push: {
      enabled: true,
      categories: ['budget', 'inventory', 'spending', 'reminder', 'alert'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    sms: {
      enabled: false,
      frequency: 'daily',
      categories: ['alert', 'reminder'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    preferences: {
      budgetAlerts: { threshold: 90, enabled: true },
      inventoryAlerts: { lowStock: 5, outOfStock: true, enabled: true },
      spendingAlerts: { dailyLimit: 100, weeklyLimit: 500, enabled: true },
      reminderAlerts: { bills: true, goals: true, maintenance: false, enabled: true }
    },
    updatedAt: '2024-01-25T10:00:00.000Z'
  };

  res.json({
    success: true,
    settings
  });
}));

/**
 * @swagger
 * /api/notifications/settings:
 *   put:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *               push:
 *                 type: object
 *               sms:
 *                 type: object
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 */
router.put('/settings', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  // Mock settings update - replace with database update
  const updatedSettings = {
    userId,
    email: {
      enabled: true,
      frequency: 'immediate',
      categories: ['budget', 'inventory', 'spending', 'reminder'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    push: {
      enabled: true,
      categories: ['budget', 'inventory', 'spending', 'reminder', 'alert'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    sms: {
      enabled: false,
      frequency: 'daily',
      categories: ['alert', 'reminder'],
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    preferences: {
      budgetAlerts: { threshold: 90, enabled: true },
      inventoryAlerts: { lowStock: 5, outOfStock: true, enabled: true },
      spendingAlerts: { dailyLimit: 100, weeklyLimit: 500, enabled: true },
      reminderAlerts: { bills: true, goals: true, maintenance: false, enabled: true }
    },
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Notification preferences updated successfully',
    settings: updatedSettings
  });
}));

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send a test notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               type
 *               title
 *               message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [info, warning, error, success, alert]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 */
router.post('/test', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type, title, message, category = 'system', priority = 'low' } = req.body;

  // Validate required fields
  if (!type || !title || !message) {
    return res.status(400).json({
      success: false,
      message: 'type, title, and message are required'
    });
  }

  // Mock test notification - replace with actual notification sending
  const testNotification = {
    id: `test-${Date.now()}`,
    userId,
    type,
    title,
    message,
    category,
    priority,
    status: 'unread',
    actionUrl: null,
    metadata: { isTest: true },
    createdAt: new Date().toISOString(),
    readAt: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };

  res.json({
    success: true,
    message: 'Test notification sent successfully',
    notification: testNotification
  });
}));

module.exports = router;
