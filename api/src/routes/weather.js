const express = require('express');
const { body, query } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateCommonFields, handleValidationErrors } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WeatherData:
 *       type: object
 *       properties:
 *         location:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             country:
 *               type: string
 *             region:
 *               type: string
 *             lat:
 *               type: number
 *             lon:
 *               type: number
 *             tz_id:
 *               type: string
 *         current:
 *           type: object
 *           properties:
 *             temperature:
 *               type: number
 *             condition:
 *               type: string
 *             icon:
 *               type: string
 *             humidity:
 *               type: number
 *             windSpeed:
 *               type: number
 *             windDirection:
 *               type: string
 *             pressure:
 *               type: number
 *             visibility:
 *               type: number
 *             uvIndex:
 *               type: number
 *             lastUpdated:
 *               type: string
 *               format: date-time
 *         forecast:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               maxTemp:
 *                 type: number
 *               minTemp:
 *                 type: number
 *               condition:
 *                 type: string
 *               icon:
 *                 type: string
 *               chanceOfRain:
 *                 type: number
 *               chanceOfSnow:
 *                 type: number
 *         airQuality:
 *           type: object
 *           properties:
 *             pm2_5:
 *               type: number
 *             pm10:
 *               type: number
 *             o3:
 *               type: number
 *             no2:
 *               type: number
 *             usEpaIndex:
 *               type: number
 *         alerts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               headline:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *               areas:
 *                 type: string
 *               start:
 *                 type: string
 *               end:
 *                 type: string
 *         provider:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/weather/current:
 *   get:
 *     summary: Get current weather data for a location
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location (city name, coordinates, or IP)
 *       - in: query
 *         name: units
 *         schema:
 *           type: string
 *           enum: [celsius, fahrenheit]
 *           default: celsius
 *         description: Temperature units
 *     responses:
 *       200:
 *         description: Current weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WeatherData'
 *       400:
 *         description: Invalid location parameter
 *       500:
 *         description: Weather service error
 */
router.get('/current', [
  query('location').notEmpty().withMessage('Location is required'),
  query('units').optional().isIn(['celsius', 'fahrenheit']).withMessage('Units must be celsius or fahrenheit'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { location, units = 'celsius' } = req.query;
  const userId = req.user?.id || 'anonymous';

  try {
    // Mock weather data - replace with actual weather service integration
    const weatherData = {
      location: {
        name: location,
        country: 'United States',
        region: 'California',
        lat: 37.7749,
        lon: -122.4194,
        tz_id: 'America/Los_Angeles'
      },
      current: {
        temperature: units === 'fahrenheit' ? 72 : 22,
        condition: 'Partly Cloudy',
        icon: 'partly-cloudy',
        humidity: 65,
        windSpeed: units === 'fahrenheit' ? 8 : 13,
        windDirection: 'NW',
        pressure: 1013,
        visibility: 10,
        uvIndex: 6,
        lastUpdated: new Date().toISOString()
      },
      forecast: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          maxTemp: units === 'fahrenheit' ? 75 : 24,
          minTemp: units === 'fahrenheit' ? 58 : 14,
          condition: 'Sunny',
          icon: 'sunny',
          chanceOfRain: 10,
          chanceOfSnow: 0
        },
        {
          date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
          maxTemp: units === 'fahrenheit' ? 78 : 26,
          minTemp: units === 'fahrenheit' ? 60 : 16,
          condition: 'Clear',
          icon: 'clear',
          chanceOfRain: 5,
          chanceOfSnow: 0
        }
      ],
      airQuality: {
        pm2_5: 12,
        pm10: 18,
        o3: 45,
        no2: 25,
        usEpaIndex: 2
      },
      alerts: [],
      provider: 'WeatherAPI.com',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
}));

/**
 * @swagger
 * /api/weather/forecast:
 *   get:
 *     summary: Get weather forecast for a location
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location (city name, coordinates, or IP)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *         description: Number of forecast days
 *       - in: query
 *         name: units
 *         schema:
 *           type: string
 *           enum: [celsius, fahrenheit]
 *           default: celsius
 *         description: Temperature units
 *     responses:
 *       200:
 *         description: Weather forecast retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     location:
 *                       $ref: '#/components/schemas/WeatherData/properties/location'
 *                     forecast:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WeatherData/properties/forecast/items'
 *                     provider:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Weather service error
 */
router.get('/forecast', [
  query('location').notEmpty().withMessage('Location is required'),
  query('days').optional().isInt({ min: 1, max: 10 }).withMessage('Days must be between 1 and 10'),
  query('units').optional().isIn(['celsius', 'fahrenheit']).withMessage('Units must be celsius or fahrenheit'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { location, days = 5, units = 'celsius' } = req.query;
  const userId = req.user?.id || 'anonymous';

  try {
    // Generate mock forecast data
    const forecast = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      forecast.push({
        date: date.toISOString().split('T')[0],
        maxTemp: units === 'fahrenheit' ? 70 + Math.random() * 10 : 21 + Math.random() * 5,
        minTemp: units === 'fahrenheit' ? 55 + Math.random() * 10 : 13 + Math.random() * 5,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear'][Math.floor(Math.random() * 4)],
        icon: ['sunny', 'partly-cloudy', 'cloudy', 'clear'][Math.floor(Math.random() * 4)],
        chanceOfRain: Math.floor(Math.random() * 30),
        chanceOfSnow: Math.floor(Math.random() * 10)
      });
    }

    const forecastData = {
      location: {
        name: location,
        country: 'United States',
        region: 'California',
        lat: 37.7749,
        lon: -122.4194,
        tz_id: 'America/Los_Angeles'
      },
      forecast,
      provider: 'WeatherAPI.com',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: forecastData
    });
  } catch (error) {
    console.error('Weather forecast API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather forecast',
      message: error.message
    });
  }
}));

/**
 * @swagger
 * /api/weather/air-quality:
 *   get:
 *     summary: Get air quality data for a location
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location (city name, coordinates, or IP)
 *     responses:
 *       200:
 *         description: Air quality data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     location:
 *                       $ref: '#/components/schemas/WeatherData/properties/location'
 *                     airQuality:
 *                       $ref: '#/components/schemas/WeatherData/properties/airQuality'
 *                     provider:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Invalid location parameter
 *       500:
 *         description: Weather service error
 */
router.get('/air-quality', [
  query('location').notEmpty().withMessage('Location is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { location } = req.query;
  const userId = req.user?.id || 'anonymous';

  try {
    const airQualityData = {
      location: {
        name: location,
        country: 'United States',
        region: 'California',
        lat: 37.7749,
        lon: -122.4194,
        tz_id: 'America/Los_Angeles'
      },
      airQuality: {
        pm2_5: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 80) + 15,
        o3: Math.floor(Math.random() * 100) + 20,
        no2: Math.floor(Math.random() * 60) + 10,
        so2: Math.floor(Math.random() * 20) + 5,
        co: Math.floor(Math.random() * 5) + 1,
        usEpaIndex: Math.floor(Math.random() * 5) + 1,
        gbDefraIndex: Math.floor(Math.random() * 10) + 1
      },
      provider: 'WeatherAPI.com',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: airQualityData
    });
  } catch (error) {
    console.error('Air quality API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch air quality data',
      message: error.message
    });
  }
}));

/**
 * @swagger
 * /api/weather/alerts:
 *   get:
 *     summary: Get weather alerts for a location
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location (city name, coordinates, or IP)
 *     responses:
 *       200:
 *         description: Weather alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     location:
 *                       $ref: '#/components/schemas/WeatherData/properties/location'
 *                     alerts:
 *                       $ref: '#/components/schemas/WeatherData/properties/alerts'
 *                     provider:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Invalid location parameter
 *       500:
 *         description: Weather service error
 */
router.get('/alerts', [
  query('location').notEmpty().withMessage('Location is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { location } = req.query;
  const userId = req.user?.id || 'anonymous';

  try {
    // Mock alerts data - in real implementation, this would come from weather service
    const alertsData = {
      location: {
        name: location,
        country: 'United States',
        region: 'California',
        lat: 37.7749,
        lon: -122.4194,
        tz_id: 'America/Los_Angeles'
      },
      alerts: [
        // Example alert - in real implementation, this would be dynamic
        {
          headline: 'Heat Advisory',
          description: 'Temperatures are expected to reach dangerous levels. Stay hydrated and avoid prolonged outdoor activities.',
          severity: 'Moderate',
          areas: location,
          start: new Date().toISOString(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      provider: 'WeatherAPI.com',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: alertsData
    });
  } catch (error) {
    console.error('Weather alerts API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather alerts',
      message: error.message
    });
  }
}));

/**
 * @swagger
 * /api/weather/analytics:
 *   get:
 *     summary: Get weather analytics and trends
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location (city name, coordinates, or IP)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Analysis period
 *     responses:
 *       200:
 *         description: Weather analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     location:
 *                       $ref: '#/components/schemas/WeatherData/properties/location'
 *                     analytics:
 *                       type: object
 *                       properties:
 *                         averageTemperature:
 *                           type: number
 *                         temperatureRange:
 *                           type: object
 *                           properties:
 *                             min:
 *                               type: number
 *                             max:
 *                               type: number
 *                         commonConditions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               condition:
 *                                 type: string
 *                               frequency:
 *                                 type: number
 *                         trends:
 *                           type: object
 *                           properties:
 *                             temperature:
 *                               type: string
 *                             precipitation:
 *                               type: string
 *                             wind:
 *                               type: string
 *                     period:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Weather service error
 */
router.get('/analytics', [
  query('location').notEmpty().withMessage('Location is required'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Period must be week, month, quarter, or year'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { location, period = 'month' } = req.query;
  const userId = req.user?.id || 'anonymous';

  try {
    const analyticsData = {
      location: {
        name: location,
        country: 'United States',
        region: 'California',
        lat: 37.7749,
        lon: -122.4194,
        tz_id: 'America/Los_Angeles'
      },
      analytics: {
        averageTemperature: 22.5,
        temperatureRange: {
          min: 15.2,
          max: 28.7
        },
        commonConditions: [
          { condition: 'Sunny', frequency: 45 },
          { condition: 'Partly Cloudy', frequency: 30 },
          { condition: 'Cloudy', frequency: 20 },
          { condition: 'Clear', frequency: 5 }
        ],
        trends: {
          temperature: 'increasing',
          precipitation: 'decreasing',
          wind: 'stable'
        }
      },
      period,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Weather analytics API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather analytics',
      message: error.message
    });
  }
}));

/**
 * @swagger
 * /api/weather/location:
 *   get:
 *     summary: Get location information from IP address
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Location information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     city:
 *                       type: string
 *                     country:
 *                       type: string
 *                     region:
 *                       type: string
 *                     coordinates:
 *                       type: string
 *                     ip:
 *                       type: string
 *                     timezone:
 *                       type: string
 *                     isp:
 *                       type: string
 *       500:
 *         description: Location service error
 */
router.get('/location', asyncHandler(async (req, res) => {
  const userId = req.user?.id || 'anonymous';

  try {
    // Mock location data - in real implementation, this would use IP geolocation
    const locationData = {
      city: 'San Francisco',
      country: 'United States',
      region: 'California',
      coordinates: '37.7749,-122.4194',
      ip: req.ip || '127.0.0.1',
      timezone: 'America/Los_Angeles',
      isp: 'Mock ISP'
    };

    res.json({
      success: true,
      data: locationData
    });
  } catch (error) {
    console.error('Location API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location information',
      message: error.message
    });
  }
}));

// Test endpoint without authentication
router.get('/test', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Weather API is working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/weather/current',
      '/api/weather/forecast', 
      '/api/weather/air-quality',
      '/api/weather/alerts',
      '/api/weather/analytics',
      '/api/weather/location'
    ]
  });
}));

module.exports = router;
