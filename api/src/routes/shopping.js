const express = require('express');
const { body, query } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ShoppingList:
 *       type: object
 *       required:
 *         - name
 *         - items
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               category:
 *                 type: string
 *               purchased:
 *                 type: boolean
 *               priority:
 *                 type: string
 *               notes:
 *                 type: string
 *         status:
 *           type: string
 *           enum: [active, completed, archived]
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
 * /api/shopping:
 *   get:
 *     summary: Get user's shopping lists
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Shopping lists retrieved successfully
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { status } = req.query;
  const userId = req.user.id;

  // Mock shopping lists data - replace with database query
  const shoppingLists = [
    {
      id: '1',
      name: 'Weekly Groceries',
      description: 'Regular weekly shopping',
      items: [
        { id: '1', name: 'Milk', quantity: 2, unit: 'gallons', category: 'Dairy', purchased: false, priority: 'high' },
        { id: '2', name: 'Bread', quantity: 1, unit: 'loaf', category: 'Bakery', purchased: false, priority: 'medium' },
        { id: '3', name: 'Apples', quantity: 3, unit: 'lbs', category: 'Produce', purchased: true, priority: 'low' }
      ],
      status: 'active',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: shoppingLists
  });
}));

/**
 * @swagger
 * /api/shopping:
 *   post:
 *     summary: Create a new shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingList'
 *     responses:
 *       201:
 *         description: Shopping list created successfully
 */
router.post('/', [
  authenticateToken,
  body('name').notEmpty().withMessage('Shopping list name is required'),
  body('items').isArray().withMessage('Items must be an array'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const shoppingListData = {
    ...req.body,
    id: Date.now().toString(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: shoppingListData,
    message: 'Shopping list created successfully'
  });
}));

/**
 * @swagger
 * /api/shopping/{listId}:
 *   get:
 *     summary: Get a specific shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shopping list retrieved successfully
 */
router.get('/:listId', authenticateToken, asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.id;

  // Mock shopping list data - replace with database query
  const shoppingList = {
    id: listId,
    name: 'Weekly Groceries',
    description: 'Regular weekly shopping',
    items: [
      { id: '1', name: 'Milk', quantity: 2, unit: 'gallons', category: 'Dairy', purchased: false, priority: 'high' },
      { id: '2', name: 'Bread', quantity: 1, unit: 'loaf', category: 'Bakery', purchased: false, priority: 'medium' }
    ],
    status: 'active',
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: shoppingList
  });
}));

/**
 * @swagger
 * /api/shopping/{listId}:
 *   put:
 *     summary: Update a shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingList'
 *     responses:
 *       200:
 *         description: Shopping list updated successfully
 */
router.put('/:listId', authenticateToken, asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.id;

  const updatedList = {
    ...req.body,
    id: listId,
    userId,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedList,
    message: 'Shopping list updated successfully'
  });
}));

/**
 * @swagger
 * /api/shopping/{listId}:
 *   delete:
 *     summary: Delete a shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shopping list deleted successfully
 */
router.delete('/:listId', authenticateToken, asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.id;

  res.json({
    success: true,
    message: 'Shopping list deleted successfully'
  });
}));

/**
 * @swagger
 * /api/shopping/{listId}/items:
 *   post:
 *     summary: Add item to shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added successfully
 */
router.post('/:listId/items', [
  authenticateToken,
  body('name').notEmpty().withMessage('Item name is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.id;

  const newItem = {
    id: Date.now().toString(),
    ...req.body,
    purchased: false
  };

  res.status(201).json({
    success: true,
    data: newItem,
    message: 'Item added successfully'
  });
}));

/**
 * @swagger
 * /api/shopping/{listId}/items/{itemId}:
 *   put:
 *     summary: Update shopping list item
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               category:
 *                 type: string
 *               purchased:
 *                 type: boolean
 *               priority:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
router.put('/:listId/items/:itemId', authenticateToken, asyncHandler(async (req, res) => {
  const { listId, itemId } = req.params;
  const userId = req.user.id;

  const updatedItem = {
    id: itemId,
    ...req.body
  };

  res.json({
    success: true,
    data: updatedItem,
    message: 'Item updated successfully'
  });
}));

/**
 * @swagger
 * /api/shopping/{listId}/items/{itemId}:
 *   delete:
 *     summary: Remove item from shopping list
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed successfully
 */
router.delete('/:listId/items/:itemId', authenticateToken, asyncHandler(async (req, res) => {
  const { listId, itemId } = req.params;
  const userId = req.user.id;

  res.json({
    success: true,
    message: 'Item removed successfully'
  });
}));

/**
 * @swagger
 * /api/shopping/ai-suggestions:
 *     summary: Get AI-powered shopping suggestions
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inventory:
 *                 type: array
 *               preferences:
 *                 type: object
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: AI suggestions retrieved successfully
 */
router.post('/ai-suggestions', authenticateToken, asyncHandler(async (req, res) => {
  const { inventory = [], preferences = {}, budget = 100 } = req.body;
  const userId = req.user.id;

  // Mock AI suggestions - replace with AI service
  const suggestions = {
    recommendedItems: [
      { name: 'Organic Spinach', reason: 'Low stock in inventory', priority: 'high', estimatedCost: 3.99 },
      { name: 'Greek Yogurt', reason: 'Based on your preferences', priority: 'medium', estimatedCost: 4.50 },
      { name: 'Quinoa', reason: 'Healthy grain option', priority: 'low', estimatedCost: 5.99 }
    ],
    budgetOptimization: {
      totalEstimatedCost: 45.50,
      savingsOpportunities: [
        { item: 'Store Brand Cereal', savings: 2.50, originalBrand: 'Name Brand Cereal' }
      ],
      budgetRemaining: budget - 45.50
    },
    storeRecommendations: [
      { store: 'Whole Foods', estimatedTotal: 45.50, distance: '0.5 miles' },
      { store: 'Trader Joe\'s', estimatedTotal: 38.75, distance: '1.2 miles' }
    ]
  };

  res.json({
    success: true,
    data: suggestions
  });
}));

module.exports = router;
