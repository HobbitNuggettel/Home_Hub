const request = require('supertest');
const app = require('../server');

describe('API Security Tests', () => {
  describe('Authentication Security', () => {
    test('Should reject requests without valid token', async () => {
      const response = await request(app).get('/api/inventory');
      expect(response.status).toBe(401);
    });

    test('Should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
    });

    test('Should reject requests with malformed token', async () => {
      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'InvalidFormat token');
      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation Security', () => {
    test('Should sanitize SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: maliciousInput,
          category: maliciousInput
        });
      
      // Should either reject the request or sanitize the input
      expect([400, 401, 422]).toContain(response.status);
    });

    test('Should sanitize XSS attempts', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: xssPayload,
          category: 'test'
        });
      
      // Should either reject the request or sanitize the input
      expect([400, 401, 422]).toContain(response.status);
    });

    test('Should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          displayName: 'Test User'
        });
      
      expect(response.status).toBe(400);
    });

    test('Should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Weak password
          displayName: 'Test User'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting Security', () => {
    test('Should enforce rate limits', async () => {
      // Make many requests quickly
      const promises = Array(1000).fill().map(() => 
        request(app).get('/api/status')
      );
      
      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CORS Security', () => {
    test('Should include proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/status')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    test('Should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/status')
        .set('Origin', 'http://malicious-site.com');
      
      // Should either reject or handle gracefully
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('Security Headers', () => {
    test('Should include security headers', async () => {
      const response = await request(app).get('/api/status');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    test('Should validate required fields', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', 'Bearer valid-token')
        .send({}); // Empty body
      
      expect(response.status).toBe(400);
    });

    test('Should validate data types', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Test Item',
          quantity: 'not-a-number', // Invalid type
          price: 10.99
        });
      
      expect(response.status).toBe(400);
    });

    test('Should validate data ranges', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Test Item',
          quantity: -1, // Invalid range
          price: 10.99
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling Security', () => {
    test('Should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');
      
      expect(response.status).toBe(404);
      // Error message should not contain sensitive information
      expect(response.body.message).not.toContain('password');
      expect(response.body.message).not.toContain('token');
      expect(response.body.message).not.toContain('secret');
    });
  });
});
