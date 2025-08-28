const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all budget routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         period:
 *           type: string
 *           enum: [weekly, monthly, quarterly, yearly]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *         status:
 *           type: string
 *           enum: [active, inactive, completed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/budget:
 *   get:
 *     summary: Get all budgets for the authenticated user
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed, all]
 *           default: all
 *         description: Filter budgets by status
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, quarterly, yearly, all]
 *           default: all
 *         description: Filter budgets by period
 *     responses:
 *       200:
 *         description: Budgets retrieved successfully
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status = 'all', period = 'all' } = req.query;

  // Mock budgets - replace with database query
  const budgets = [
    {
      id: 'budget-001',
      userId,
      name: 'Monthly Household Budget',
      amount: 3000.00,
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      categories: [
        { name: 'Groceries', allocated: 600.00, spent: 524.89, remaining: 75.11 },
        { name: 'Dining Out', allocated: 300.00, spent: 267.34, remaining: 32.66 },
        { name: 'Shopping', allocated: 400.00, spent: 356.78, remaining: 43.22 },
        { name: 'Transportation', allocated: 200.00, spent: 134.56, remaining: 65.44 },
        { name: 'Utilities', allocated: 250.00, spent: 245.67, remaining: 4.33 },
        { name: 'Entertainment', allocated: 150.00, spent: 89.45, remaining: 60.55 },
        { name: 'Savings', allocated: 500.00, spent: 0.00, remaining: 500.00 },
        { name: 'Emergency Fund', allocated: 300.00, spent: 0.00, remaining: 300.00 },
        { name: 'Other', allocated: 300.00, spent: 228.91, remaining: 71.09 }
      ],
      status: 'active',
      totalAllocated: 3000.00,
      totalSpent: 1847.60,
      totalRemaining: 1152.40,
      utilization: 61.6,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-25T12:00:00.000Z'
    },
    {
      id: 'budget-002',
      userId,
      name: 'Holiday Season Budget',
      amount: 1500.00,
      period: 'monthly',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      categories: [
        { name: 'Gifts', allocated: 800.00, spent: 0.00, remaining: 800.00 },
        { name: 'Decorations', allocated: 200.00, spent: 0.00, remaining: 200.00 },
        { name: 'Entertainment', allocated: 300.00, spent: 0.00, remaining: 300.00 },
        { name: 'Food & Drinks', allocated: 200.00, spent: 0.00, remaining: 200.00 }
      ],
      status: 'inactive',
      totalAllocated: 1500.00,
      totalSpent: 0.00,
      totalRemaining: 1500.00,
      utilization: 0.0,
      createdAt: '2024-11-15T00:00:00.000Z',
      updatedAt: '2024-11-15T00:00:00.000Z'
    }
  ];

  // Filter budgets based on query parameters
  let filteredBudgets = budgets;
  
  if (status !== 'all') {
    filteredBudgets = filteredBudgets.filter(budget => budget.status === status);
  }
  
  if (period !== 'all') {
    filteredBudgets = filteredBudgets.filter(budget => budget.period === period);
  }

  res.json({
    success: true,
    budgets: filteredBudgets,
    summary: {
      total: filteredBudgets.length,
      active: filteredBudgets.filter(b => b.status === 'active').length,
      totalAmount: filteredBudgets.reduce((sum, b) => sum + b.amount, 0),
      averageUtilization: filteredBudgets.length > 0 
        ? filteredBudgets.reduce((sum, b) => sum + b.utilization, 0) / filteredBudgets.length 
        : 0
    }
  });
}));

/**
 * @swagger
 * /api/budget/{budgetId}:
 *   get:
 *     summary: Get a specific budget by ID
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget retrieved successfully
 *       404:
 *         description: Budget not found
 */
router.get('/:budgetId', asyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user.id;

  // Mock budget - replace with database query
  const budget = {
    id: budgetId,
    userId,
    name: 'Monthly Household Budget',
    amount: 3000.00,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    categories: [
      { name: 'Groceries', allocated: 600.00, spent: 524.89, remaining: 75.11, transactions: 28 },
      { name: 'Dining Out', allocated: 300.00, spent: 267.34, remaining: 32.66, transactions: 15 },
      { name: 'Shopping', allocated: 400.00, spent: 356.78, remaining: 43.22, transactions: 12 },
      { name: 'Transportation', allocated: 200.00, spent: 134.56, remaining: 65.44, transactions: 8 },
      { name: 'Utilities', allocated: 250.00, spent: 245.67, remaining: 4.33, transactions: 4 },
      { name: 'Entertainment', allocated: 150.00, spent: 89.45, remaining: 60.55, transactions: 6 },
      { name: 'Savings', allocated: 500.00, spent: 0.00, remaining: 500.00, transactions: 0 },
      { name: 'Emergency Fund', allocated: 300.00, spent: 0.00, remaining: 300.00, transactions: 0 },
      { name: 'Other', allocated: 300.00, spent: 228.91, remaining: 71.09, transactions: 10 }
    ],
    status: 'active',
    totalAllocated: 3000.00,
    totalSpent: 1847.60,
    totalRemaining: 1152.40,
    utilization: 61.6,
    alerts: [
      { type: 'warning', message: 'Utilities category is 98.3% utilized', category: 'Utilities' },
      { type: 'info', message: 'Groceries category is 87.5% utilized', category: 'Groceries' }
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-25T12:00:00.000Z'
  };

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  res.json({
    success: true,
    budget
  });
}));

/**
 * @swagger
 * /api/budget:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budget]
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
 *               - amount
 *               - period
 *               - startDate
 *               - categories
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               period:
 *                 type: string
 *                 enum: [weekly, monthly, quarterly, yearly]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     allocated:
 *                       type: number
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, amount, period, startDate, endDate, categories } = req.body;

  // Validate required fields
  if (!name || !amount || !period || !startDate || !categories || !Array.isArray(categories)) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, amount, period, startDate, categories'
    });
  }

  // Validate categories
  if (categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one category is required'
    });
  }

  // Validate category allocations
  const totalAllocated = categories.reduce((sum, cat) => sum + (cat.allocated || 0), 0);
  if (Math.abs(totalAllocated - amount) > 0.01) {
    return res.status(400).json({
      success: false,
      message: `Category allocations (${totalAllocated}) must equal total budget amount (${amount})`
    });
  }

  // Create new budget - replace with database insert
  const newBudget = {
    id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    name,
    amount: parseFloat(amount),
    period,
    startDate,
    endDate: endDate || calculateEndDate(startDate, period),
    categories: categories.map(cat => ({
      name: cat.name,
      allocated: parseFloat(cat.allocated),
      spent: 0.00,
      remaining: parseFloat(cat.allocated),
      transactions: 0
    })),
    status: 'active',
    totalAllocated: parseFloat(amount),
    totalSpent: 0.00,
    totalRemaining: parseFloat(amount),
    utilization: 0.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    message: 'Budget created successfully',
    budget: newBudget
  });
}));

/**
 * @swagger
 * /api/budget/{budgetId}:
 *   put:
 *     summary: Update an existing budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               period:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               categories:
 *                 type: array
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       404:
 *         description: Budget not found
 */
router.put('/:budgetId', asyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  // Mock budget update - replace with database update
  const existingBudget = {
    id: budgetId,
    userId,
    name: 'Monthly Household Budget',
    amount: 3000.00,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    categories: [
      { name: 'Groceries', allocated: 600.00, spent: 524.89, remaining: 75.11 },
      { name: 'Dining Out', allocated: 300.00, spent: 267.34, remaining: 32.66 },
      { name: 'Shopping', allocated: 400.00, spent: 356.78, remaining: 43.22 }
    ],
    status: 'active',
    totalAllocated: 3000.00,
    totalSpent: 1847.60,
    totalRemaining: 1152.40,
    utilization: 61.6,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-25T12:00:00.000Z'
  };

  if (!existingBudget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  // Apply updates
  const updatedBudget = {
    ...existingBudget,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Recalculate totals if amount or categories changed
  if (updates.amount || updates.categories) {
    updatedBudget.totalAllocated = updatedBudget.amount;
    updatedBudget.totalRemaining = updatedBudget.totalAllocated - updatedBudget.totalSpent;
    updatedBudget.utilization = (updatedBudget.totalSpent / updatedBudget.totalAllocated) * 100;
  }

  res.json({
    success: true,
    message: 'Budget updated successfully',
    budget: updatedBudget
  });
}));

/**
 * @swagger
 * /api/budget/{budgetId}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       404:
 *         description: Budget not found
 */
router.delete('/:budgetId', asyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user.id;

  // Mock budget deletion - replace with database delete
  const existingBudget = {
    id: budgetId,
    userId,
    name: 'Monthly Household Budget',
    status: 'active'
  };

  if (!existingBudget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  // Check if budget can be deleted (e.g., no active transactions)
  if (existingBudget.status === 'active') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete active budget. Please deactivate it first.'
    });
  }

  res.json({
    success: true,
    message: 'Budget deleted successfully'
  });
}));

/**
 * @swagger
 * /api/budget/{budgetId}/categories:
 *   get:
 *     summary: Get budget categories with detailed breakdown
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget categories retrieved successfully
 */
router.get('/:budgetId/categories', asyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user.id;

  // Mock categories - replace with database query
  const categories = [
    {
      name: 'Groceries',
      allocated: 600.00,
      spent: 524.89,
      remaining: 75.11,
      utilization: 87.5,
      transactions: 28,
      averageTransaction: 18.75,
      lastTransaction: '2024-01-25T10:30:00.000Z',
      trend: 'stable'
    },
    {
      name: 'Dining Out',
      allocated: 300.00,
      spent: 267.34,
      remaining: 32.66,
      utilization: 89.1,
      transactions: 15,
      averageTransaction: 17.82,
      lastTransaction: '2024-01-24T19:45:00.000Z',
      trend: 'increasing'
    },
    {
      name: 'Shopping',
      allocated: 400.00,
      spent: 356.78,
      remaining: 43.22,
      utilization: 89.2,
      transactions: 12,
      averageTransaction: 29.73,
      lastTransaction: '2024-01-23T14:20:00.000Z',
      trend: 'stable'
    }
  ];

  res.json({
    success: true,
    categories,
    summary: {
      totalCategories: categories.length,
      averageUtilization: categories.reduce((sum, cat) => sum + cat.utilization, 0) / categories.length,
      categoriesAtRisk: categories.filter(cat => cat.utilization > 90).length,
      totalRemaining: categories.reduce((sum, cat) => sum + cat.remaining, 0)
    }
  });
}));

/**
 * @swagger
 * /api/budget/{budgetId}/track:
 *   post:
 *     summary: Track spending against budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *             properties:
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Spending tracked successfully
 */
router.post('/:budgetId/track', asyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user.id;
  const { category, amount, description, date } = req.body;

  // Validate required fields
  if (!category || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Category and amount are required'
    });
  }

  // Mock spending tracking - replace with database operations
  const transaction = {
    id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    budgetId,
    userId,
    category,
    amount: parseFloat(amount),
    description: description || '',
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  // Update budget category spending
  const updatedCategory = {
    name: category,
    spent: 267.34 + parseFloat(amount), // Mock update
    remaining: 32.66 - parseFloat(amount),
    utilization: 89.1 + (parseFloat(amount) / 300.00) * 100
  };

  res.json({
    success: true,
    message: 'Spending tracked successfully',
    transaction,
    updatedCategory,
    budgetImpact: {
      totalSpent: 1847.60 + parseFloat(amount),
      totalRemaining: 1152.40 - parseFloat(amount),
      utilization: ((1847.60 + parseFloat(amount)) / 3000.00) * 100
    }
  });
}));

/**
 * @swagger
 * /api/budget/{budgetId}/alerts:
 *   get:
 *     summary: Get budget alerts and notifications
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget alerts retrieved successfully
 */
router.get('/:budgetId/alerts', asyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user.id;

  // Mock alerts - replace with database query
  const alerts = [
    {
      id: 'alert-001',
      type: 'warning',
      severity: 'medium',
      message: 'Utilities category is 98.3% utilized',
      category: 'Utilities',
      threshold: 90,
      currentValue: 98.3,
      createdAt: '2024-01-25T10:00:00.000Z',
      acknowledged: false
    },
    {
      id: 'alert-002',
      type: 'info',
      severity: 'low',
      message: 'Groceries category is 87.5% utilized',
      category: 'Groceries',
      threshold: 80,
      currentValue: 87.5,
      createdAt: '2024-01-25T09:00:00.000Z',
      acknowledged: false
    },
    {
      id: 'alert-003',
      type: 'success',
      severity: 'low',
      message: 'Savings category is on track',
      category: 'Savings',
      threshold: 0,
      currentValue: 0,
      createdAt: '2024-01-25T08:00:00.000Z',
      acknowledged: true
    }
  ];

  res.json({
    success: true,
    alerts,
    summary: {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      bySeverity: {
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      }
    }
  });
}));

// Helper function to calculate end date based on period
function calculateEndDate(startDate, period) {
  const start = new Date(startDate);
  const end = new Date(start);
  
  switch (period) {
    case 'weekly':
      end.setDate(start.getDate() + 7);
      break;
    case 'monthly':
      end.setMonth(start.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(start.getMonth() + 3);
      break;
    case 'yearly':
      end.setFullYear(start.getFullYear() + 1);
      break;
    default:
      end.setMonth(start.getMonth() + 1);
  }
  
  return end.toISOString().split('T')[0];
}

module.exports = router;
