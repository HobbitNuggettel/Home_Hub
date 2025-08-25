const express = require('express');
const { body } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateCommonFields, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SpendingTransaction:
 *       type: object
 *       required:
 *         - amount
 *         - category
 *         - description
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: number
 *           minimum: 0.01
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
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
 * /api/spending:
 *   get:
 *     summary: Get user's spending transactions
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
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
 *           default: 20
 *         description: Transactions per page
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get('/', asyncHandler(async (req, res) => {
  const { category, startDate, endDate, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  // Mock transactions data - replace with database query
  const mockTransactions = [
    {
      id: 'txn-1',
      amount: 45.20,
      category: 'Groceries',
      description: 'Weekly grocery shopping',
      date: new Date().toISOString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'txn-2',
      amount: 89.99,
      category: 'Electronics',
      description: 'Coffee maker purchase',
      date: new Date().toISOString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Filter by category
  let filteredTransactions = mockTransactions;
  if (category) {
    filteredTransactions = filteredTransactions.filter(txn => 
      txn.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Filter by date range
  if (startDate || endDate) {
    filteredTransactions = filteredTransactions.filter(txn => {
      const txnDate = new Date(txn.date);
      if (startDate && txnDate < new Date(startDate)) return false;
      if (endDate && txnDate > new Date(endDate)) return false;
      return true;
    });
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  res.json({
    success: true,
    transactions: paginatedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredTransactions.length,
      pages: Math.ceil(filteredTransactions.length / limit)
    }
  });
}));

/**
 * @swagger
 * /api/spending:
 *   post:
 *     summary: Create new spending transaction
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpendingTransaction'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  validateCommonFields.validateSpendingTransaction,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { amount, category, description, date } = req.body;
    const userId = req.user.id;

    // Mock transaction creation - replace with database insert
    const newTransaction = {
      id: `txn-${Date.now()}`,
      amount: parseFloat(amount),
      category,
      description,
      date: date || new Date().toISOString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Spending transaction created successfully',
      transaction: newTransaction
    });
  })
);

/**
 * @swagger
 * /api/spending/{transactionId}:
 *   get:
 *     summary: Get spending transaction by ID
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 */
router.get('/:transactionId', asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const userId = req.user.id;

  // Mock transaction lookup - replace with database query
  const transaction = {
    id: transactionId,
    amount: 45.20,
    category: 'Groceries',
    description: 'Weekly grocery shopping',
    date: new Date().toISOString(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!transaction || transaction.userId !== userId) {
    return res.status(404).json({
      error: true,
      message: 'Transaction not found',
      code: 'TRANSACTION_NOT_FOUND',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    transaction
  });
}));

/**
 * @swagger
 * /api/spending/{transactionId}:
 *   put:
 *     summary: Update spending transaction
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpendingTransaction'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 */
router.put('/:transactionId', asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { amount, category, description, date } = req.body;
  const userId = req.user.id;

  // Mock transaction update - replace with database update
  const updatedTransaction = {
    id: transactionId,
    amount: amount ? parseFloat(amount) : 45.20,
    category: category || 'Groceries',
    description: description || 'Weekly grocery shopping',
    date: date || new Date().toISOString(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Spending transaction updated successfully',
    transaction: updatedTransaction
  });
}));

/**
 * @swagger
 * /api/spending/{transactionId}:
 *   delete:
 *     summary: Delete spending transaction
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 */
router.delete('/:transactionId', asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const userId = req.user.id;

  // Mock transaction deletion - replace with database deletion
  res.json({
    success: true,
    message: 'Spending transaction deleted successfully',
    transactionId
  });
}));

/**
 * @swagger
 * /api/spending/categories:
 *   get:
 *     summary: Get all spending categories
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', asyncHandler(async (req, res) => {
  // Mock categories - replace with database query
  const categories = [
    'Groceries',
    'Dining Out',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  res.json({
    success: true,
    categories
  });
}));

/**
 * @swagger
 * /api/spending/analytics:
 *   get:
 *     summary: Get spending analytics
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: month
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics', asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const userId = req.user.id;

  // Mock analytics data - replace with database aggregation
  const analytics = {
    period,
    totalSpent: 2847.50,
    averagePerDay: 45.20,
    topCategories: [
      { category: 'Groceries', amount: 1247.89, percentage: 43.8 },
      { category: 'Dining Out', amount: 567.34, percentage: 19.9 },
      { category: 'Shopping', amount: 456.78, percentage: 16.0 },
      { category: 'Transportation', amount: 234.56, percentage: 8.2 },
      { category: 'Entertainment', amount: 234.93, percentage: 8.2 }
    ],
    dailySpending: [
      { date: '2024-01-01', amount: 45.20 },
      { date: '2024-01-02', amount: 67.89 },
      { date: '2024-01-03', amount: 23.45 }
    ],
    monthlyTrends: [
      { month: 'January', amount: 2847.50 },
      { month: 'December', amount: 2345.67 },
      { month: 'November', amount: 1987.43 }
    ]
  };

  res.json({
    success: true,
    analytics
  });
}));

/**
 * @swagger
 * /api/spending/budget:
 *   get:
 *     summary: Get budget information
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget information retrieved successfully
 */
router.get('/budget', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Mock budget data - replace with database query
  const budget = {
    monthlyBudget: 3000,
    spentThisMonth: 2847.50,
    remaining: 152.50,
    categories: {
      'Groceries': { budget: 500, spent: 1247.89, remaining: -747.89, status: 'over' },
      'Dining Out': { budget: 300, spent: 567.34, remaining: -267.34, status: 'over' },
      'Shopping': { budget: 400, spent: 456.78, remaining: -56.78, status: 'over' },
      'Transportation': { budget: 200, spent: 234.56, remaining: -34.56, status: 'over' },
      'Entertainment': { budget: 150, spent: 234.93, remaining: -84.93, status: 'over' }
    },
    alerts: [
      { type: 'warning', message: 'Groceries budget exceeded by $747.89' },
      { type: 'warning', message: 'Dining Out budget exceeded by $267.34' }
    ]
  };

  res.json({
    success: true,
    budget
  });
}));

/**
 * @swagger
 * /api/spending/budget:
 *   post:
 *     summary: Set or update budget
 *     tags: [Spending]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monthlyBudget:
 *                 type: number
 *                 minimum: 0
 *               categoryBudgets:
 *                 type: object
 *     responses:
 *       200:
 *         description: Budget updated successfully
 */
router.post('/budget', asyncHandler(async (req, res) => {
  const { monthlyBudget, categoryBudgets } = req.body;
  const userId = req.user.id;

  // Mock budget update - replace with database update
  const updatedBudget = {
    monthlyBudget: monthlyBudget || 3000,
    categoryBudgets: categoryBudgets || {},
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Budget updated successfully',
    budget: updatedBudget
  });
}));

module.exports = router;
