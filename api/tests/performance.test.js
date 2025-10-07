const request = require('supertest');
const app = require('../server');

describe('API Performance Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Get auth token for authenticated requests
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'perftest@example.com',
        password: 'perftest123',
        displayName: 'Performance Test User'
      });
    
    if (registerResponse.status === 201) {
      authToken = registerResponse.body.token;
    }
  });

  describe('Response Time Tests', () => {
    test('Health endpoint should respond quickly', async () => {
      const start = Date.now();
      const response = await request(app).get('/health');
      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100); // Should be under 100ms
    });

    test('Status endpoint should respond quickly', async () => {
      const start = Date.now();
      const response = await request(app).get('/api/status');
      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(200); // Should be under 200ms
    });

    test('Authenticated endpoints should respond within acceptable time', async () => {
      const endpoints = [
        '/api/inventory',
        '/api/spending',
        '/api/analytics',
        '/api/weather/test'
      ];

      for (const endpoint of endpoints) {
        const start = Date.now();
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);
        const duration = Date.now() - start;
        
        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(500); // Should be under 500ms
      }
    });
  });

  describe('Load Testing', () => {
    test('Should handle multiple concurrent requests', async () => {
      const concurrentRequests = 20;
      const promises = Array(concurrentRequests).fill().map(() => 
        request(app).get('/api/status')
      );
      
      const start = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - start;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Total time should be reasonable for concurrent requests
      expect(totalTime).toBeLessThan(2000); // Under 2 seconds for 20 requests
    });

    test('Should handle authenticated concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises = Array(concurrentRequests).fill().map(() => 
        request(app)
          .get('/api/inventory')
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      const start = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - start;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Total time should be reasonable
      expect(totalTime).toBeLessThan(3000); // Under 3 seconds for 10 authenticated requests
    });
  });

  describe('Memory Usage Tests', () => {
    test('Should not leak memory with repeated requests', async () => {
      const initialMemory = process.memoryUsage();
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/status');
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Rate Limiting Tests', () => {
    test('Should respect rate limits', async () => {
      // Make requests up to the rate limit
      const promises = Array(100).fill().map(() => 
        request(app).get('/api/status')
      );
      
      const responses = await Promise.all(promises);
      
      // All requests should succeed (within rate limit)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Database Performance Tests', () => {
    test('Should handle database queries efficiently', async () => {
      const start = Date.now();
      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`);
      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(300); // Database queries should be fast
    });
  });

  describe('Compression Tests', () => {
    test('Should compress large responses', async () => {
      const response = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Check if compression headers are present
      expect(response.headers['content-encoding']).toBeDefined();
    });
  });
});
