const express = require('express');
const router = express.Router();
const { Workout } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');

// Get all workouts (admin sees all, athletes see only their own)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
  const workouts = await Workout.findAll({ where });
  res.json(workouts);
}));

// Get workout by ID
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const workout = await Workout.findByPk(req.params.id);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  // Check if user owns the workout or is admin
  if (workout.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only view your own workouts', 403);
  }

  res.json(workout);
}));

// Create a new workout
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const workoutData = {
    ...req.body,
    userId: req.user.id // Always set userId to the authenticated user
  };

  const workout = await Workout.create(workoutData);
  res.status(201).json(workout);
}));

// Update a workout
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const workout = await Workout.findByPk(req.params.id);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  // Check if user owns the workout or is admin
  if (workout.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only update your own workouts', 403);
  }

  // Prevent changing the owner
  const updateData = { ...req.body };
  delete updateData.userId;

  await workout.update(updateData);
  res.json(workout);
}));

// Delete a workout
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const workout = await Workout.findByPk(req.params.id);
  
  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  // Check if user owns the workout or is admin
  if (workout.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own workouts', 403);
  }

  await workout.destroy();
  res.status(204).send();
}));

module.exports = router;
