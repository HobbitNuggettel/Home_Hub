const express = require('express');
const { body, query } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         preferences:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               enum: [light, dark, auto]
 *             language:
 *               type: string
 *             timezone:
 *               type: string
 *             currency:
 *               type: string
 *             units:
 *               type: string
 *               enum: [metric, imperial]
 *         notifications:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *             push:
 *               type: boolean
 *             sms:
 *               type: boolean
 *             categories:
 *               type: object
 *               properties:
 *                 inventory:
 *                   type: boolean
 *                 spending:
 *                   type: boolean
 *                 maintenance:
 *                   type: boolean
 *                 weather:
 *                   type: boolean
 *         privacy:
 *           type: object
 *           properties:
 *             dataSharing:
 *               type: boolean
 *             analytics:
 *               type: boolean
 *             locationTracking:
 *               type: boolean
 *         integrations:
 *           type: object
 *           properties:
 *             weather:
 *               type: boolean
 *             smartHome:
 *               type: boolean
 *             ai:
 *               type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Mock user settings - replace with database query
  const settings = {
    id: '1',
    userId,
    preferences: {
      theme: 'light',
      language: 'en-US',
      timezone: 'America/New_York',
      currency: 'USD',
      units: 'imperial'
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      categories: {
        inventory: true,
        spending: true,
        maintenance: true,
        weather: true
      }
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      locationTracking: true
    },
    integrations: {
      weather: true,
      smartHome: false,
      ai: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: settings
  });
}));

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSettings'
 *     responses:
 *       200:
 *         description: User settings updated successfully
 */
router.put('/', [
  authenticateToken,
  body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
  body('privacy').optional().isObject().withMessage('Privacy must be an object'),
  body('integrations').optional().isObject().withMessage('Integrations must be an object'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedSettings = {
    ...req.body,
    userId,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedSettings,
    message: 'User settings updated successfully'
  });
}));

/**
 * @swagger
 * /api/settings/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 */
router.get('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const preferences = {
    theme: 'light',
    language: 'en-US',
    timezone: 'America/New_York',
    currency: 'USD',
    units: 'imperial',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  };

  res.json({
    success: true,
    data: preferences
  });
}));

/**
 * @swagger
 * /api/settings/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               currency:
 *                 type: string
 *               units:
 *                 type: string
 *                 enum: [metric, imperial]
 *     responses:
 *       200:
 *         description: User preferences updated successfully
 */
router.put('/preferences', [
  authenticateToken,
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('units').optional().isIn(['metric', 'imperial']).withMessage('Invalid units'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedPreferences = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedPreferences,
    message: 'User preferences updated successfully'
  });
}));

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: Get notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 */
router.get('/notifications', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = {
    email: true,
    push: true,
    sms: false,
    categories: {
      inventory: true,
      spending: true,
      maintenance: true,
      weather: true,
      recipes: false,
      shopping: true
    },
    frequency: {
      inventory: 'daily',
      spending: 'weekly',
      maintenance: 'as_needed',
      weather: 'daily'
    }
  };

  res.json({
    success: true,
    data: notifications
  });
}));

/**
 * @swagger
 * /api/settings/notifications:
 *   put:
 *     summary: Update notification settings
 *     tags: [Settings]
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
 *                 type: boolean
 *               push:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *               categories:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 */
router.put('/notifications', [
  authenticateToken,
  body('email').optional().isBoolean().withMessage('Email must be boolean'),
  body('push').optional().isBoolean().withMessage('Push must be boolean'),
  body('sms').optional().isBoolean().withMessage('SMS must be boolean'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedNotifications = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedNotifications,
    message: 'Notification settings updated successfully'
  });
}));

/**
 * @swagger
 * /api/settings/privacy:
 *   get:
 *     summary: Get privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy settings retrieved successfully
 */
router.get('/privacy', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const privacy = {
    dataSharing: false,
    analytics: true,
    locationTracking: true,
    personalizedAds: false,
    thirdPartySharing: false,
    dataRetention: '1year'
  };

  res.json({
    success: true,
    data: privacy
  });
}));

/**
 * @swagger
 * /api/settings/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataSharing:
 *                 type: boolean
 *               analytics:
 *                 type: boolean
 *               locationTracking:
 *                 type: boolean
 *               personalizedAds:
 *                 type: boolean
 *               thirdPartySharing:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 */
router.put('/privacy', [
  authenticateToken,
  body('dataSharing').optional().isBoolean().withMessage('Data sharing must be boolean'),
  body('analytics').optional().isBoolean().withMessage('Analytics must be boolean'),
  body('locationTracking').optional().isBoolean().withMessage('Location tracking must be boolean'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedPrivacy = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedPrivacy,
    message: 'Privacy settings updated successfully'
  });
}));

/**
 * @swagger
 * /api/settings/integrations:
 *   get:
 *     summary: Get integration settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Integration settings retrieved successfully
 */
router.get('/integrations', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const integrations = {
    weather: {
      enabled: true,
      provider: 'WeatherAPI',
      apiKey: 'configured',
      lastSync: new Date().toISOString()
    },
    smartHome: {
      enabled: false,
      provider: null,
      devices: 0
    },
    ai: {
      enabled: true,
      provider: 'HuggingFace',
      features: ['chat', 'suggestions', 'insights']
    },
    calendar: {
      enabled: false,
      provider: null
    }
  };

  res.json({
    success: true,
    data: integrations
  });
}));

/**
 * @swagger
 * /api/settings/integrations:
 *   put:
 *     summary: Update integration settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weather:
 *                 type: object
 *               smartHome:
 *                 type: object
 *               ai:
 *                 type: object
 *               calendar:
 *                 type: object
 *     responses:
 *       200:
 *         description: Integration settings updated successfully
 */
router.put('/integrations', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedIntegrations = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedIntegrations,
    message: 'Integration settings updated successfully'
  });
}));

/**
 * @swagger
 * /api/settings/export:
 *   get:
 *     summary: Export user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings exported successfully
 */
router.get('/export', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const exportData = {
    userId,
    exportDate: new Date().toISOString(),
    settings: {
      preferences: {
        theme: 'light',
        language: 'en-US',
        timezone: 'America/New_York',
        currency: 'USD',
        units: 'imperial'
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        dataSharing: false,
        analytics: true,
        locationTracking: true
      }
    }
  };

  res.json({
    success: true,
    data: exportData
  });
}));

/**
 * @swagger
 * /api/settings/import:
 *   post:
 *     summary: Import user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Settings imported successfully
 */
router.post('/import', [
  authenticateToken,
  body('settings').isObject().withMessage('Settings must be an object'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { settings } = req.body;

  const importedSettings = {
    ...settings,
    userId,
    importedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: importedSettings,
    message: 'Settings imported successfully'
  });
}));

module.exports = router;
