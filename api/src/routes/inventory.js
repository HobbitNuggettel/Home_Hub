const express = require('express');
const { body } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireOwnershipOrAdmin, validateCommonFields, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryItem:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - quantity
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         quantity:
 *           type: integer
 *           minimum: 0
 *         price:
 *           type: number
 *           minimum: 0
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         imageURL:
 *           type: string
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
 * /api/inventory:
 *   get:
 *     summary: Get user's inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 */
router.get('/', asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  // Mock inventory data - replace with database query
  const mockItems = [
    {
      id: 'item-1',
      name: 'Coffee Maker',
      category: 'Kitchen Appliances',
      quantity: 1,
      price: 89.99,
      description: 'Automatic coffee maker with timer',
      location: 'Kitchen',
      imageURL: null,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'item-2',
      name: 'Paper Towels',
      category: 'Cleaning Supplies',
      quantity: 12,
      price: 15.99,
      description: 'Multi-pack paper towels',
      location: 'Pantry',
      imageURL: null,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Filter by category
  let filteredItems = mockItems;
  if (category) {
    filteredItems = filteredItems.filter(item => 
      item.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Search functionality
  if (search) {
    filteredItems = filteredItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  res.json({
    success: true,
    items: paginatedItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredItems.length,
      pages: Math.ceil(filteredItems.length / limit)
    }
  });
}));

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryItem'
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  validateCommonFields.validateInventoryItem,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, category, quantity, price, description, location, imageURL } = req.body;
    const userId = req.user.id;

    // Mock item creation - replace with database insert
    const newItem = {
      id: `item-${Date.now()}`,
      name,
      category,
      quantity: parseInt(quantity),
      price: price ? parseFloat(price) : null,
      description: description || '',
      location: location || '',
      imageURL: imageURL || null,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      item: newItem
    });
  })
);

/**
 * @swagger
 * /api/inventory/{itemId}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *       404:
 *         description: Item not found
 */
router.get('/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  // Mock item lookup - replace with database query
  const item = {
    id: itemId,
    name: 'Coffee Maker',
    category: 'Kitchen Appliances',
    quantity: 1,
    price: 89.99,
    description: 'Automatic coffee maker with timer',
    location: 'Kitchen',
    imageURL: null,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!item || item.userId !== userId) {
    return res.status(404).json({
      error: true,
      message: 'Item not found',
      code: 'ITEM_NOT_FOUND',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    item
  });
}));

/**
 * @swagger
 * /api/inventory/{itemId}:
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryItem'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 */
router.put('/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { name, category, quantity, price, description, location, imageURL } = req.body;
  const userId = req.user.id;

  // Mock item update - replace with database update
  const updatedItem = {
    id: itemId,
    name: name || 'Coffee Maker',
    category: category || 'Kitchen Appliances',
    quantity: quantity ? parseInt(quantity) : 1,
    price: price ? parseFloat(price) : 89.99,
    description: description || 'Automatic coffee maker with timer',
    location: location || 'Kitchen',
    imageURL: imageURL || null,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Inventory item updated successfully',
    item: updatedItem
  });
}));

/**
 * @swagger
 * /api/inventory/{itemId}:
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  // Mock item deletion - replace with database deletion
  res.json({
    success: true,
    message: 'Inventory item deleted successfully',
    itemId
  });
}));

/**
 * @swagger
 * /api/inventory/categories:
 *   get:
 *     summary: Get all inventory categories
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', asyncHandler(async (req, res) => {
  // Mock categories - replace with database query
  const categories = [
    'Kitchen Appliances',
    'Cleaning Supplies',
    'Electronics',
    'Furniture',
    'Clothing',
    'Books',
    'Tools',
    'Food & Beverages'
  ];

  res.json({
    success: true,
    categories
  });
}));

/**
 * @swagger
 * /api/inventory/analytics:
 *   get:
 *     summary: Get inventory analytics
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Mock analytics data - replace with database aggregation
  const analytics = {
    totalItems: 156,
    totalValue: 2847.50,
    lowStockItems: 12,
    categories: {
      'Kitchen Appliances': { count: 23, value: 1247.89 },
      'Cleaning Supplies': { count: 45, value: 234.56 },
      'Electronics': { count: 18, value: 892.34 },
      'Furniture': { count: 12, value: 473.71 }
    },
    recentActivity: [
      {
        action: 'added',
        itemName: 'Coffee Maker',
        timestamp: new Date().toISOString()
      },
      {
        action: 'updated',
        itemName: 'Paper Towels',
        timestamp: new Date().toISOString()
      }
    ]
  };

  res.json({
    success: true,
    analytics
  });
}));

/**
 * @swagger
 * /api/inventory/bulk:
 *   post:
 *     summary: Bulk create/update inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/InventoryItem'
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 */
router.post('/bulk', asyncHandler(async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: true,
      message: 'Items array is required and must not be empty',
      code: 'INVALID_ITEMS',
      timestamp: new Date().toISOString()
    });
  }

  // Mock bulk operation - replace with database bulk insert/update
  const processedItems = items.map((item, index) => ({
    id: item.id || `item-${Date.now()}-${index}`,
    name: item.name,
    category: item.category,
    quantity: parseInt(item.quantity) || 0,
    price: item.price ? parseFloat(item.price) : null,
    description: item.description || '',
    location: item.location || '',
    imageURL: item.imageURL || null,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  res.json({
    success: true,
    message: `Successfully processed ${processedItems.length} items`,
    items: processedItems
  });
}));

module.exports = router;
