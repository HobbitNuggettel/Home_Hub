const express = require('express');
const { body, query } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MaintenanceTask:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - priority
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [plumbing, electrical, hvac, cleaning, appliance, exterior, interior, safety]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         dueDate:
 *           type: string
 *           format: date
 *         completedDate:
 *           type: string
 *           format: date
 *         estimatedCost:
 *           type: number
 *         actualCost:
 *           type: number
 *         location:
 *           type: string
 *         assignedTo:
 *           type: string
 *         notes:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Get user's maintenance tasks
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Maintenance tasks retrieved successfully
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { category, status, priority } = req.query;
  const userId = req.user.id;

  // Mock maintenance tasks data - replace with database query
  const tasks = [
    {
      id: '1',
      title: 'Replace Air Filter',
      description: 'Replace HVAC air filter for better air quality',
      category: 'hvac',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-10-15',
      estimatedCost: 15.99,
      location: 'Living Room',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Fix Leaky Faucet',
      description: 'Kitchen faucet has a slow leak',
      category: 'plumbing',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2024-10-10',
      estimatedCost: 25.00,
      location: 'Kitchen',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: tasks
  });
}));

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Create a new maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceTask'
 *     responses:
 *       201:
 *         description: Maintenance task created successfully
 */
router.post('/', [
  authenticateToken,
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['plumbing', 'electrical', 'hvac', 'cleaning', 'appliance', 'exterior', 'interior', 'safety']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const taskData = {
    ...req.body,
    id: Date.now().toString(),
    status: 'pending',
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: taskData,
    message: 'Maintenance task created successfully'
  });
}));

/**
 * @swagger
 * /api/maintenance/{taskId}:
 *   get:
 *     summary: Get a specific maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance task retrieved successfully
 */
router.get('/:taskId', authenticateToken, asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  // Mock task data - replace with database query
  const task = {
    id: taskId,
    title: 'Replace Air Filter',
    description: 'Replace HVAC air filter for better air quality',
    category: 'hvac',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-10-15',
    estimatedCost: 15.99,
    location: 'Living Room',
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: task
  });
}));

/**
 * @swagger
 * /api/maintenance/{taskId}:
 *   put:
 *     summary: Update a maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceTask'
 *     responses:
 *       200:
 *         description: Maintenance task updated successfully
 */
router.put('/:taskId', authenticateToken, asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  const updatedTask = {
    ...req.body,
    id: taskId,
    userId,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedTask,
    message: 'Maintenance task updated successfully'
  });
}));

/**
 * @swagger
 * /api/maintenance/{taskId}:
 *   delete:
 *     summary: Delete a maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance task deleted successfully
 */
router.delete('/:taskId', authenticateToken, asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  res.json({
    success: true,
    message: 'Maintenance task deleted successfully'
  });
}));

/**
 * @swagger
 * /api/maintenance/{taskId}/complete:
 *   post:
 *     summary: Mark maintenance task as completed
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actualCost:
 *                 type: number
 *               notes:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task marked as completed
 */
router.post('/:taskId/complete', authenticateToken, asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { actualCost, notes, attachments } = req.body;
  const userId = req.user.id;

  const completedTask = {
    id: taskId,
    status: 'completed',
    completedDate: new Date().toISOString(),
    actualCost,
    notes,
    attachments,
    userId,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: completedTask,
    message: 'Task marked as completed'
  });
}));

/**
 * @swagger
 * /api/maintenance/analytics:
 *   get:
 *     summary: Get maintenance analytics and insights
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Analysis period
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics', authenticateToken, asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const userId = req.user.id;

  // Mock analytics data - replace with database aggregation
  const analytics = {
    summary: {
      totalTasks: 15,
      completedTasks: 12,
      pendingTasks: 3,
      overdueTasks: 1,
      totalCost: 450.75,
      averageCost: 30.05
    },
    categoryBreakdown: [
      { category: 'hvac', count: 5, totalCost: 150.00 },
      { category: 'plumbing', count: 4, totalCost: 200.00 },
      { category: 'electrical', count: 3, totalCost: 75.00 },
      { category: 'cleaning', count: 3, totalCost: 25.75 }
    ],
    trends: {
      monthlySpending: [120.50, 135.25, 98.75, 96.25],
      taskCompletionRate: 0.85,
      averageCompletionTime: 3.2 // days
    },
    insights: [
      {
        type: 'cost_saving',
        message: 'HVAC maintenance can be done seasonally to reduce costs',
        impact: 'medium'
      },
      {
        type: 'preventive',
        message: 'Regular filter changes prevent major HVAC repairs',
        impact: 'high'
      }
    ]
  };

  res.json({
    success: true,
    data: analytics
  });
}));

/**
 * @swagger
 * /api/maintenance/schedule:
 *   get:
 *     summary: Get maintenance schedule and upcoming tasks
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look ahead
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 */
router.get('/schedule', authenticateToken, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const userId = req.user.id;

  // Mock schedule data - replace with database query
  const schedule = {
    upcomingTasks: [
      {
        id: '1',
        title: 'Replace Air Filter',
        dueDate: '2024-10-15',
        priority: 'medium',
        category: 'hvac'
      },
      {
        id: '2',
        title: 'Clean Gutters',
        dueDate: '2024-10-20',
        priority: 'high',
        category: 'exterior'
      }
    ],
    recurringTasks: [
      {
        title: 'Monthly HVAC Filter Check',
        frequency: 'monthly',
        nextDue: '2024-11-01',
        category: 'hvac'
      },
      {
        title: 'Quarterly Smoke Detector Test',
        frequency: 'quarterly',
        nextDue: '2024-12-01',
        category: 'safety'
      }
    ]
  };

  res.json({
    success: true,
    data: schedule
  });
}));

module.exports = router;
