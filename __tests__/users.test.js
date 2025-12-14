const request = require('supertest');
const app = require('../server');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./testSetup');

describe('User Endpoints', () => {
  let athleteToken, adminToken, athleteId, adminId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create athlete user
    const athleteRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Athlete User',
        email: 'athlete@example.com',
        password: 'password123',
        role: 'athlete'
      });
    athleteToken = athleteRes.body.token;
    athleteId = athleteRes.body.user.id;

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
    adminToken = adminRes.body.token;
    adminId = adminRes.body.user.id;
  });

  describe('GET /api/users', () => {
    it('should allow admin to get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('should deny athlete access to all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow user to get own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${athleteId}`)
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(athleteId);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should allow admin to get any user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${athleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(athleteId);
    });

    it('should deny athlete access to other user profiles', async () => {
      const response = await request(app)
        .get(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow user to update own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${athleteId}`)
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          name: 'Updated Athlete'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Athlete');
    });

    it('should allow admin to update any user profile', async () => {
      const response = await request(app)
        .put(`/api/users/${athleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Updated Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Admin Updated Name');
    });

    it('should deny athlete from changing roles', async () => {
      const response = await request(app)
        .put(`/api/users/${athleteId}`)
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(403);
    });

    it('should allow admin to change user roles', async () => {
      const response = await request(app)
        .put(`/api/users/${athleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('admin');
    });

    it('should deny athlete access to update other users', async () => {
      const response = await request(app)
        .put(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          name: 'Hacked Admin'
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete users', async () => {
      const response = await request(app)
        .delete(`/api/users/${athleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should deny athlete from deleting users', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
