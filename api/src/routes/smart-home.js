const express = require('express');
const { body, query } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SmartDevice:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - room
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [lighting, climate, security, entertainment, appliance, sensor, camera, speaker]
 *         room:
 *           type: string
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         ipAddress:
 *           type: string
 *         macAddress:
 *           type: string
 *         status:
 *           type: string
 *           enum: [online, offline, error]
 *         power:
 *           type: boolean
 *         settings:
 *           type: object
 *         lastSeen:
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
 *     Automation:
 *       type: object
 *       required:
 *         - name
 *         - trigger
 *         - actions
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         trigger:
 *           type: string
 *           enum: [time, sensor, voice, schedule, manual]
 *         triggerValue:
 *           type: string
 *         conditions:
 *           type: array
 *           items:
 *             type: object
 *         actions:
 *           type: array
 *           items:
 *             type: object
 *         enabled:
 *           type: boolean
 *         schedule:
 *           type: object
 *           properties:
 *             days:
 *               type: array
 *               items:
 *                 type: string
 *             startTime:
 *               type: string
 *             endTime:
 *               type: string
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
 * /api/smart-home/devices:
 *   get:
 *     summary: Get user's smart home devices
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room
 *         schema:
 *           type: string
 *         description: Filter by room
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [lighting, climate, security, entertainment, appliance, sensor, camera, speaker]
 *         description: Filter by device type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [online, offline, error]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Smart home devices retrieved successfully
 */
router.get('/devices', authenticateToken, asyncHandler(async (req, res) => {
  const { room, type, status } = req.query;
  const userId = req.user.id;

  // Mock smart home devices data - replace with database query
  const devices = [
    {
      id: '1',
      name: 'Living Room Light',
      type: 'lighting',
      room: 'Living Room',
      brand: 'Philips Hue',
      model: 'A19 White',
      ipAddress: '192.168.1.100',
      status: 'online',
      power: true,
      settings: { brightness: 80, color: '#ffffff' },
      lastSeen: new Date().toISOString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Kitchen Thermostat',
      type: 'climate',
      room: 'Kitchen',
      brand: 'Nest',
      model: 'Learning Thermostat',
      ipAddress: '192.168.1.101',
      status: 'online',
      power: true,
      settings: { temperature: 72, mode: 'auto' },
      lastSeen: new Date().toISOString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: devices
  });
}));

/**
 * @swagger
 * /api/smart-home/devices:
 *   post:
 *     summary: Add a new smart home device
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SmartDevice'
 *     responses:
 *       201:
 *         description: Smart home device added successfully
 */
router.post('/devices', [
  authenticateToken,
  body('name').notEmpty().withMessage('Device name is required'),
  body('type').isIn(['lighting', 'climate', 'security', 'entertainment', 'appliance', 'sensor', 'camera', 'speaker']).withMessage('Invalid device type'),
  body('room').notEmpty().withMessage('Room is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const deviceData = {
    ...req.body,
    id: Date.now().toString(),
    status: 'offline',
    power: false,
    settings: {},
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: deviceData,
    message: 'Smart home device added successfully'
  });
}));

/**
 * @swagger
 * /api/smart-home/devices/{deviceId}:
 *   get:
 *     summary: Get a specific smart home device
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Smart home device retrieved successfully
 */
router.get('/devices/:deviceId', authenticateToken, asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user.id;

  // Mock device data - replace with database query
  const device = {
    id: deviceId,
    name: 'Living Room Light',
    type: 'lighting',
    room: 'Living Room',
    brand: 'Philips Hue',
    model: 'A19 White',
    ipAddress: '192.168.1.100',
    status: 'online',
    power: true,
    settings: { brightness: 80, color: '#ffffff' },
    lastSeen: new Date().toISOString(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: device
  });
}));

/**
 * @swagger
 * /api/smart-home/devices/{deviceId}:
 *   put:
 *     summary: Update a smart home device
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SmartDevice'
 *     responses:
 *       200:
 *         description: Smart home device updated successfully
 */
router.put('/devices/:deviceId', authenticateToken, asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user.id;

  const updatedDevice = {
    ...req.body,
    id: deviceId,
    userId,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedDevice,
    message: 'Smart home device updated successfully'
  });
}));

/**
 * @swagger
 * /api/smart-home/devices/{deviceId}:
 *   delete:
 *     summary: Remove a smart home device
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Smart home device removed successfully
 */
router.delete('/devices/:deviceId', authenticateToken, asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user.id;

  res.json({
    success: true,
    message: 'Smart home device removed successfully'
  });
}));

/**
 * @swagger
 * /api/smart-home/devices/{deviceId}/control:
 *   post:
 *     summary: Control a smart home device
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
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
 *               action:
 *                 type: string
 *                 enum: [turn_on, turn_off, set_brightness, set_temperature, set_color]
 *               value:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Device controlled successfully
 */
router.post('/devices/:deviceId/control', [
  authenticateToken,
  body('action').isIn(['turn_on', 'turn_off', 'set_brightness', 'set_temperature', 'set_color']).withMessage('Invalid action'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { action, value, settings } = req.body;
  const userId = req.user.id;

  // Mock device control - replace with actual device communication
  const result = {
    deviceId,
    action,
    value,
    settings,
    status: 'success',
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    data: result,
    message: 'Device controlled successfully'
  });
}));

/**
 * @swagger
 * /api/smart-home/automations:
 *   get:
 *     summary: Get user's automations
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: enabled
 *         schema:
 *           type: boolean
 *         description: Filter by enabled status
 *     responses:
 *       200:
 *         description: Automations retrieved successfully
 */
router.get('/automations', authenticateToken, asyncHandler(async (req, res) => {
  const { enabled } = req.query;
  const userId = req.user.id;

  // Mock automations data - replace with database query
  const automations = [
    {
      id: '1',
      name: 'Morning Routine',
      description: 'Turn on lights and adjust temperature in the morning',
      trigger: 'time',
      triggerValue: '07:00',
      conditions: [],
      actions: [
        { device: 'Living Room Light', action: 'turn_on', value: '100' },
        { device: 'Kitchen Thermostat', action: 'set_temperature', value: '72' }
      ],
      enabled: true,
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '07:00',
        endTime: '08:00'
      },
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: automations
  });
}));

/**
 * @swagger
 * /api/smart-home/automations:
 *   post:
 *     summary: Create a new automation
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Automation'
 *     responses:
 *       201:
 *         description: Automation created successfully
 */
router.post('/automations', [
  authenticateToken,
  body('name').notEmpty().withMessage('Automation name is required'),
  body('trigger').isIn(['time', 'sensor', 'voice', 'schedule', 'manual']).withMessage('Invalid trigger type'),
  body('actions').isArray().withMessage('Actions must be an array'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const automationData = {
    ...req.body,
    id: Date.now().toString(),
    enabled: true,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: automationData,
    message: 'Automation created successfully'
  });
}));

/**
 * @swagger
 * /api/smart-home/status:
 *   get:
 *     summary: Get smart home system status
 *     tags: [Smart Home]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System status retrieved successfully
 */
router.get('/status', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const status = {
    systemStatus: 'online',
    totalDevices: 12,
    onlineDevices: 10,
    offlineDevices: 2,
    activeAutomations: 5,
    energyUsage: {
      current: 2.5, // kW
      today: 18.5, // kWh
      thisMonth: 450.2 // kWh
    },
    rooms: [
      { name: 'Living Room', devices: 4, online: 4 },
      { name: 'Kitchen', devices: 3, online: 2 },
      { name: 'Bedroom', devices: 2, online: 2 },
      { name: 'Bathroom', devices: 1, online: 1 }
    ],
    recentActivity: [
      { device: 'Living Room Light', action: 'turned_on', timestamp: new Date().toISOString() },
      { device: 'Kitchen Thermostat', action: 'temperature_set', value: '72°F', timestamp: new Date().toISOString() }
    ]
  };

  res.json({
    success: true,
    data: status
  });
}));

module.exports = router;
