require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const goalRoutes = require('./routes/goals');

const app = express();

// Core middleware
app.use(express.json());
app.use(morgan('dev'));

// Custom logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/goals', goalRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found'
  });
});

// Centralized error-handling middleware
app.use(errorHandler);

// Export app for tests
module.exports = app;

// Only start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to DB:', err);
    });
}
