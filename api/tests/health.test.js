const request = require('supertest');
const express = require('express');

// Simple health check test
describe('API Health Check', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  });

  test('Health endpoint should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });

  test('API should be running', async () => {
    const response = await request('http://localhost:5001')
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
});
