const request = require('supertest');
const app = require('../server');

describe('Aivana API', () => {
  // Test the homepage
  test('should return homepage', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('AIVANA');
  });

  // Test API health check
  test('should return API health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK', timestamp: expect.any(String) });
  });

  // Test products endpoint
  test('should return products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test categories endpoint
  test('should return categories', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// Additional tests would go here for authentication, transactions, etc.