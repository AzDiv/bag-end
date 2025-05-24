// back-end/tests/users.test.js
// Integration tests for the /api/users endpoint using supertest and jest

const request = require('supertest');
const app = require('../index'); // The Express app

describe('Users API', () => {
  let server;
  let adminToken;

  beforeAll(async () => {
    server = app.listen(4001);
    // Insert a test user for login
    await require('../models/db').query(
      `INSERT IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      ['first@admin.co', 'aze123EINDE', 'Test User', 'admin']
    );
    // Login and get token
    const res = await request(server)
      .post('/api/login')
      .send({ email: 'first@admin.co', password: 'aze123EINDE' });
    adminToken = res.body.token;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('GET /api/users should return an array of users', async () => {
    const res = await request(server)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Add more tests for POST, PUT, DELETE as needed
});
