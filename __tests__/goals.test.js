const request = require('supertest');
const app = require('../server');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./testSetup');

describe('Goal Endpoints', () => {
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

  describe('POST /api/goals', () => {
    it('should create a goal for authenticated user', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          description: 'Run a marathon',
          status: 'in_progress'
        });

      expect(response.status).toBe(201);
      expect(response.body.description).toBe('Run a marathon');
      expect(response.body.userId).toBe(athleteId);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/goals')
        .send({
          description: 'Run a marathon'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/goals', () => {
    beforeEach(async () => {
      // Create goals for athlete
      await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          description: 'Run a marathon'
        });

      // Create goals for admin
      await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Complete triathlon'
        });
    });

    it('should return only own goals for athlete', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].description).toBe('Run a marathon');
    });

    it('should return all goals for admin', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/goals');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/goals/:id', () => {
    let goalId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          description: 'Run a marathon'
        });
      goalId = response.body.id;
    });

    it('should get own goal', async () => {
      const response = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(goalId);
    });

    it('should allow admin to view any goal', async () => {
      const response = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(goalId);
    });

    it('should return 404 for non-existent goal', async () => {
      const response = await request(app)
        .get('/api/goals/99999')
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/goals/:id', () => {
    let goalId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          description: 'Run a marathon',
          status: 'not_started'
        });
      goalId = response.body.id;
    });

    it('should update own goal', async () => {
      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          status: 'in_progress'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });

    it('should allow admin to update any goal', async () => {
      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should return 404 for non-existent goal', async () => {
      const response = await request(app)
        .put('/api/goals/99999')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    let goalId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          description: 'Run a marathon'
        });
      goalId = response.body.id;
    });

    it('should delete own goal', async () => {
      const response = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(204);
    });

    it('should allow admin to delete any goal', async () => {
      const response = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent goal', async () => {
      const response = await request(app)
        .delete('/api/goals/99999')
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(404);
    });
  });
});
