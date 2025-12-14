const request = require('supertest');
const app = require('../server');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./testSetup');

describe('Workout Endpoints', () => {
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

  describe('POST /api/workouts', () => {
    it('should create a workout for authenticated user', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          type: 'Running',
          date: '2024-01-01',
          durationMinutes: 30,
          notes: 'Morning run'
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('Running');
      expect(response.body.userId).toBe(athleteId);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .send({
          type: 'Running',
          date: '2024-01-01',
          durationMinutes: 30
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/workouts', () => {
    beforeEach(async () => {
      // Create workouts for athlete
      await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          type: 'Running',
          date: '2024-01-01',
          durationMinutes: 30
        });

      // Create workouts for admin
      await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'Swimming',
          date: '2024-01-02',
          durationMinutes: 45
        });
    });

    it('should return only own workouts for athlete', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('Running');
    });

    it('should return all workouts for admin', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/workouts');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/workouts/:id', () => {
    let workoutId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          type: 'Running',
          date: '2024-01-01',
          durationMinutes: 30
        });
      workoutId = response.body.id;
    });

    it('should get own workout', async () => {
      const response = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(workoutId);
    });

    it('should allow admin to view any workout', async () => {
      const response = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(workoutId);
    });

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .get('/api/workouts/99999')
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/workouts/:id', () => {
    let workoutId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          type: 'Running',
          date: '2024-01-01',
          durationMinutes: 30
        });
      workoutId = response.body.id;
    });

    it('should update own workout', async () => {
      const response = await request(app)
        .put(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          durationMinutes: 45,
          notes: 'Extended run'
        });

      expect(response.status).toBe(200);
      expect(response.body.durationMinutes).toBe(45);
      expect(response.body.notes).toBe('Extended run');
    });

    it('should allow admin to update any workout', async () => {
      const response = await request(app)
        .put(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          durationMinutes: 60
        });

      expect(response.status).toBe(200);
      expect(response.body.durationMinutes).toBe(60);
    });

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .put('/api/workouts/99999')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({ durationMinutes: 45 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    let workoutId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${athleteToken}`)
        .send({
          type: 'Running',
          date: '2024-01-01',
          durationMinutes: 30
        });
      workoutId = response.body.id;
    });

    it('should delete own workout', async () => {
      const response = await request(app)
        .delete(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(204);
    });

    it('should allow admin to delete any workout', async () => {
      const response = await request(app)
        .delete(`/api/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .delete('/api/workouts/99999')
        .set('Authorization', `Bearer ${athleteToken}`);

      expect(response.status).toBe(404);
    });
  });
});
