const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateCommonFields, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - displayName
 *       properties:
 *         id:
 *           type: string
 *           description: Unique user ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         displayName:
 *           type: string
 *           description: User display name
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: User role
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     AuthRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - displayName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         displayName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *         message:
 *           type: string
 *         code:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', 
  validateCommonFields.validateUser,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password, displayName } = req.body;

    // Check if user already exists (mock implementation)
    // In real app, check against database
    const existingUser = null; // Mock: no existing user

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: 'User already exists',
        code: 'USER_EXISTS',
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user (mock implementation)
    const newUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Mock user lookup (replace with database query)
    const user = {
      id: 'user-123',
      email: 'user@example.com',
      displayName: 'Test User',
      role: 'user',
      password: await bcrypt.hash('password123', 12), // Mock hashed password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if user exists
    if (!user || user.email !== email.toLowerCase()) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        timestamp: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  })
);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify JWT token and get user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/verify',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'No token provided',
        code: 'NO_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Mock user lookup (replace with database query)
      const user = {
        id: decoded.id,
        email: decoded.email,
        displayName: 'Test User',
        role: decoded.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        user
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: true,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(401).json({
        error: true,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'No token provided',
        code: 'NO_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          id: decoded.id, 
          email: decoded.email, 
          role: decoded.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (error) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (client-side token removal)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout',
  asyncHandler(async (req, res) => {
    // In a real application, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear any server-side sessions
    
    res.json({
      success: true,
      message: 'Logout successful. Please remove the token from client-side storage.'
    });
  })
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Mock implementation - in real app, send reset email
    // For now, just return success message
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  })
);

module.exports = router;
