const express = require('express');
const { body, query } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - ingredients
 *         - instructions
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         cuisine:
 *           type: string
 *         prepTime:
 *           type: integer
 *         cookTime:
 *           type: integer
 *         servings:
 *           type: integer
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               unit:
 *                 type: string
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *         nutrition:
 *           type: object
 *           properties:
 *             calories:
 *               type: number
 *             protein:
 *               type: number
 *             carbs:
 *               type: number
 *             fat:
 *               type: number
 *         tags:
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
 * /api/recipes:
 *   get:
 *     summary: Get user's recipes
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *         description: Filter by cuisine
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *     responses:
 *       200:
 *         description: Recipes retrieved successfully
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { category, cuisine, search, difficulty } = req.query;
  const userId = req.user.id;

  // Mock recipes data - replace with database query
  const recipes = [
    {
      id: '1',
      name: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta dish',
      category: 'Main Course',
      cuisine: 'Italian',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: 'medium',
      ingredients: [
        { name: 'Spaghetti', amount: 1, unit: 'lb' },
        { name: 'Eggs', amount: 4, unit: 'large' },
        { name: 'Pecorino Romano', amount: 1, unit: 'cup' }
      ],
      instructions: [
        'Bring water to boil',
        'Cook pasta according to package directions',
        'Mix eggs and cheese',
        'Combine with hot pasta'
      ],
      nutrition: {
        calories: 650,
        protein: 25,
        carbs: 75,
        fat: 20
      },
      tags: ['pasta', 'italian', 'quick'],
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: recipes
  });
}));

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       201:
 *         description: Recipe created successfully
 */
router.post('/', [
  authenticateToken,
  body('name').notEmpty().withMessage('Recipe name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('ingredients').isArray().withMessage('Ingredients must be an array'),
  body('instructions').isArray().withMessage('Instructions must be an array'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const recipeData = {
    ...req.body,
    id: Date.now().toString(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: recipeData,
    message: 'Recipe created successfully'
  });
}));

/**
 * @swagger
 * /api/recipes/categories:
 *   get:
 *     summary: Get recipe categories
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', authenticateToken, asyncHandler(async (req, res) => {
  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 
    'Beverages', 'Appetizers', 'Soups', 'Salads', 'Main Dishes'
  ];

  res.json({
    success: true,
    data: categories
  });
}));

/**
 * @swagger
 * /api/recipes/{recipeId}:
 *   get:
 *     summary: Get a specific recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 */
router.get('/:recipeId', authenticateToken, asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  // Mock recipe data - replace with database query
  const recipe = {
    id: recipeId,
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta dish',
    category: 'Main Course',
    cuisine: 'Italian',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'medium',
    ingredients: [
      { name: 'Spaghetti', amount: 1, unit: 'lb' },
      { name: 'Eggs', amount: 4, unit: 'large' },
      { name: 'Pecorino Romano', amount: 1, unit: 'cup' }
    ],
    instructions: [
      'Bring water to boil',
      'Cook pasta according to package directions',
      'Mix eggs and cheese',
      'Combine with hot pasta'
    ],
    nutrition: {
      calories: 650,
      protein: 25,
      carbs: 75,
      fat: 20
    },
    tags: ['pasta', 'italian', 'quick'],
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: recipe
  });
}));

/**
 * @swagger
 * /api/recipes/{recipeId}:
 *   put:
 *     summary: Update a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 */
router.put('/:recipeId', authenticateToken, asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  const updatedRecipe = {
    ...req.body,
    id: recipeId,
    userId,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedRecipe,
    message: 'Recipe updated successfully'
  });
}));

/**
 * @swagger
 * /api/recipes/{recipeId}:
 *   delete:
 *     summary: Delete a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 */
router.delete('/:recipeId', authenticateToken, asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  res.json({
    success: true,
    message: 'Recipe deleted successfully'
  });
}));

/**
 * @swagger
 * /api/recipes/meal-plan:
 *   post:
 *     summary: Generate AI-powered meal plan
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 default: 7
 *               preferences:
 *                 type: object
 *               inventory:
 *                 type: array
 *     responses:
 *       200:
 *         description: Meal plan generated successfully
 */
router.post('/meal-plan', authenticateToken, asyncHandler(async (req, res) => {
  const { days = 7, preferences = {}, inventory = [] } = req.body;
  const userId = req.user.id;

  // Mock meal plan - replace with AI service
  const mealPlan = {
    days: Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      meals: {
        breakfast: { name: 'Oatmeal with Berries', calories: 300 },
        lunch: { name: 'Grilled Chicken Salad', calories: 450 },
        dinner: { name: 'Salmon with Vegetables', calories: 500 }
      },
      totalCalories: 1250
    })),
    shoppingList: [
      { name: 'Oatmeal', amount: 1, unit: 'cup' },
      { name: 'Berries', amount: 1, unit: 'cup' },
      { name: 'Chicken Breast', amount: 2, unit: 'lbs' }
    ],
    estimatedCost: 45.50,
    nutritionSummary: {
      totalCalories: 8750,
      averageProtein: 65,
      averageCarbs: 120,
      averageFat: 35
    }
  };

  res.json({
    success: true,
    data: mealPlan
  });
}));

module.exports = router;
