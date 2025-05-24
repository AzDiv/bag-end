// back-end/tests/auth.test.js
// Integration tests for authentication endpoints using supertest and jest

const request = require('supertest');
const app = require('../index');

describe('Auth API', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(4004);
    // Insert a test user for login
    await require('../models/db').query(
      `INSERT IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      ['first@admin.co', 'aze123EINDE', 'Test User', 'admin']
    );
  });

  // Use async/await for teardown
  afterAll(async () => {
    await server.close();
  });

  it('POST /api/login should return a JWT token for valid credentials', async () => {
    // Replace with a valid user from your test DB
    const res = await request(server)
      .post('/api/login')
      .send({ email: 'first@admin.co', password: 'aze123EINDE' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // Add more tests for protected routes, invalid login, etc.
});
