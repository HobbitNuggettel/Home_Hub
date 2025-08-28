const express = require('express');
const { body, validationResult } = require('express-validator');
const { firebaseAdmin } = require('../config/firebase-admin');
const { authenticateFirebaseToken, requireRole } = require('../middleware/firebaseAuth');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().isLength({ min: 2, max: 50 })
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

/**
 * @swagger
 * /api/firebase-auth/register:
 *   post:
 *     summary: Register a new user with Firebase
 *     tags: [Firebase Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - displayName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user already exists
    try {
      const existingUser = await firebaseAdmin.auth().getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'A user with this email already exists'
        });
      }
    } catch (error) {
      // User doesn't exist, which is what we want
    }

    // Create user in Firebase Auth
    const userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    // Set custom claims (role)
    await firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'user',
      displayName
    });

    // Create user profile in Realtime Database
    const db = firebaseAdmin.database();
    const userRef = db.ref(`users/${userRecord.uid}`);
    await userRef.set({
      id: userRecord.uid,
      email,
      displayName,
      role: 'user',
      createdAt: Date.now(),
      isActive: true,
      lastSeen: Date.now()
    });

    // Create default access permissions
    const accessRef = db.ref(`userAccess/${userRecord.uid}/canAccess/${userRecord.uid}`);
    await accessRef.set({
      accessLevel: 'admin',
      grantedAt: Date.now(),
      grantedBy: 'system',
      lastUpdated: Date.now()
    });

    console.log(`✅ User registered successfully: ${email} (${userRecord.uid})`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('❌ User registration failed:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create user account'
    });
  }
});

/**
 * @swagger
 * /api/firebase-auth/login:
 *   post:
 *     summary: Login user and get Firebase ID token
 *     tags: [Firebase Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: Firebase ID token
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Note: Firebase Admin SDK doesn't support password verification
    // In production, you'd use Firebase Auth REST API or client SDK
    // For now, we'll simulate login and return a mock token
    
    try {
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      
      // Update last seen
      const db = firebaseAdmin.database();
      const userRef = db.ref(`users/${userRecord.uid}`);
      await userRef.update({
        lastSeen: Date.now()
      });

      // Get custom claims
      const customClaims = userRecord.customClaims || { role: 'user' };

      // Generate a mock token (in production, this would be a real Firebase ID token)
      const mockToken = `mock-${customClaims.role}-token-${userRecord.uid}`;

      console.log(`✅ User login successful: ${email} (${userRecord.uid})`);

      res.json({
        message: 'Login successful',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role: customClaims.role
        },
        token: mockToken
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ User login failed:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate user'
    });
  }
});

/**
 * @swagger
 * /api/firebase-auth/verify:
 *   get:
 *     summary: Verify Firebase ID token
 *     tags: [Firebase Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired token
 */
router.get('/verify', authenticateFirebaseToken, async (req, res) => {
  try {
    res.json({
      message: 'Token verified successfully',
      user: req.user
    });
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Unable to verify token'
    });
  }
});

/**
 * @swagger
 * /api/firebase-auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Firebase Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', authenticateFirebaseToken, async (req, res) => {
  try {
    // Get additional user data from Realtime Database
    const db = firebaseAdmin.database();
    const userRef = db.ref(`users/${req.user.uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val() || {};

    const profile = {
      ...req.user,
      ...userData,
      createdAt: userData.createdAt,
      isActive: userData.isActive,
      lastSeen: userData.lastSeen
    };

    res.json({
      user: profile
    });
  } catch (error) {
    console.error('❌ Profile retrieval failed:', error);
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'Unable to retrieve user profile'
    });
  }
});

/**
 * @swagger
 * /api/firebase-auth/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Firebase Authentication]
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
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.put('/profile', authenticateFirebaseToken, [
  body('displayName').optional().trim().isLength({ min: 2, max: 50 })
], handleValidationErrors, async (req, res) => {
  try {
    const { displayName } = req.body;
    const updates = {};

    if (displayName) {
      updates.displayName = displayName;
      
      // Update Firebase Auth
      await firebaseAdmin.auth().updateUser(req.user.uid, {
        displayName
      });

      // Update custom claims
      await firebaseAdmin.auth().setCustomUserClaims(req.user.uid, {
        ...req.user,
        displayName
      });
    }

    // Update Realtime Database
    if (Object.keys(updates).length > 0) {
      const db = firebaseAdmin.database();
      const userRef = db.ref(`users/${req.user.uid}`);
      await userRef.update({
        ...updates,
        lastUpdated: Date.now()
      });
    }

    console.log(`✅ Profile updated for user: ${req.user.email}`);

    res.json({
      message: 'Profile updated successfully',
      updates
    });
  } catch (error) {
    console.error('❌ Profile update failed:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Unable to update user profile'
    });
  }
});

/**
 * @swagger
 * /api/firebase-auth/logout:
 *   post:
 *     summary: Logout user (client-side token invalidation)
 *     tags: [Firebase Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.post('/logout', authenticateFirebaseToken, async (req, res) => {
  try {
    // Note: Firebase Admin SDK doesn't support token revocation
    // Client should discard the token locally
    
    console.log(`✅ User logout: ${req.user.email}`);

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout failed:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to process logout'
    });
  }
});

module.exports = router;
