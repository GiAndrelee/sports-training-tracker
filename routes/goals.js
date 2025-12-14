const express = require('express');
const router = express.Router();
const { Goal } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');

// Get all goals (admin sees all, athletes see only their own)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
  const goals = await Goal.findAll({ where });
  res.json(goals);
}));

// Get goal by ID
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const goal = await Goal.findByPk(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }

  // Check if user owns the goal or is admin
  if (goal.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only view your own goals', 403);
  }

  res.json(goal);
}));

// Create a new goal
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const goalData = {
    ...req.body,
    userId: req.user.id // Always set userId to the authenticated user
  };

  const goal = await Goal.create(goalData);
  res.status(201).json(goal);
}));

// Update a goal
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const goal = await Goal.findByPk(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }

  // Check if user owns the goal or is admin
  if (goal.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only update your own goals', 403);
  }

  // Prevent changing the owner
  const updateData = { ...req.body };
  delete updateData.userId;

  await goal.update(updateData);
  res.json(goal);
}));

// Delete a goal
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const goal = await Goal.findByPk(req.params.id);
  
  if (!goal) {
    throw new AppError('Goal not found', 404);
  }

  // Check if user owns the goal or is admin
  if (goal.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own goals', 403);
  }

  await goal.destroy();
  res.status(204).send();
}));

module.exports = router;

