const request = require('supertest');
const app = require('../server');

describe('API Endpoints Comprehensive Tests', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Register a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword123',
        displayName: 'Test User'
      });
    
    if (registerResponse.status === 201) {
      authToken = registerResponse.body.token;
      testUserId = registerResponse.body.user.id;
    }
  });

  describe('Public Endpoints', () => {
    test('GET / - Should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Home Hub API');
    });

    test('GET /health - Should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });

    test('GET /api/status - Should return API status', async () => {
      const response = await request(app).get('/api/status');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('operational');
    });

    test('GET /api/weather/test - Should return weather test data', async () => {
      const response = await request(app).get('/api/weather/test');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register - Should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123',
          displayName: 'New User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    test('POST /api/auth/login - Should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    test('GET /api/auth/profile - Should return user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('User Management Endpoints', () => {
    test('GET /api/users/profile - Should return user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/users/settings - Should return user settings', async () => {
      const response = await request(app)
        .get('/api/users/settings')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Inventory Management Endpoints', () => {
    test('GET /api/inventory - Should return inventory items', async () => {
      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/inventory/categories - Should return categories', async () => {
      const response = await request(app)
        .get('/api/inventory/categories')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/inventory - Should create new inventory item', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          category: 'Test Category',
          quantity: 1,
          price: 10.99
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Spending & Budget Endpoints', () => {
    test('GET /api/spending - Should return spending data', async () => {
      const response = await request(app)
        .get('/api/spending')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/spending/reports - Should return spending reports', async () => {
      const response = await request(app)
        .get('/api/spending/reports')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/budget - Should return budget data', async () => {
      const response = await request(app)
        .get('/api/budget')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Analytics Endpoints', () => {
    test('GET /api/analytics - Should return analytics overview', async () => {
      const response = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/analytics/spending - Should return spending analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/spending')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/analytics/trends - Should return trend analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/trends')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Weather Endpoints', () => {
    test('GET /api/weather/current - Should return current weather', async () => {
      const response = await request(app)
        .get('/api/weather/current?location=San Francisco')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/weather/forecast - Should return weather forecast', async () => {
      const response = await request(app)
        .get('/api/weather/forecast?location=San Francisco')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Recipe Management Endpoints', () => {
    test('GET /api/recipes - Should return recipes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/recipes/categories - Should return recipe categories', async () => {
      const response = await request(app)
        .get('/api/recipes/categories')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Shopping List Endpoints', () => {
    test('GET /api/shopping - Should return shopping lists', async () => {
      const response = await request(app)
        .get('/api/shopping')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Maintenance Endpoints', () => {
    test('GET /api/maintenance - Should return maintenance tasks', async () => {
      const response = await request(app)
        .get('/api/maintenance')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/maintenance/status - Should return maintenance status', async () => {
      const response = await request(app)
        .get('/api/maintenance/status')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('AI Services Endpoints', () => {
    test('GET /api/ai/status - Should return AI service status', async () => {
      const response = await request(app)
        .get('/api/ai/status')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Smart Home Endpoints', () => {
    test('GET /api/smart-home/status - Should return smart home status', async () => {
      const response = await request(app)
        .get('/api/smart-home/status')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Settings Endpoints', () => {
    test('GET /api/settings - Should return user settings', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Collaboration Endpoints', () => {
    test('GET /api/collaboration - Should return collaboration groups', async () => {
      const response = await request(app)
        .get('/api/collaboration')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Notifications Endpoints', () => {
    test('GET /api/notifications - Should return notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent - Should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });

    test('GET /api/inventory without auth - Should return 401', async () => {
      const response = await request(app).get('/api/inventory');
      expect(response.status).toBe(401);
    });
  });

  describe('Performance Tests', () => {
    test('API response times should be under 1000ms', async () => {
      const start = Date.now();
      const response = await request(app)
        .get('/api/status')
        .set('Authorization', `Bearer ${authToken}`);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
      expect(response.status).toBe(200);
    });

    test('Concurrent requests should handle load', async () => {
      const promises = Array(10).fill().map(() => 
        request(app)
          .get('/api/status')
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
