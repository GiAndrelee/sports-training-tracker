const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  res.json(users);
}));

// Get user by ID (authenticated users can view their own, admin can view all)
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  // Check if user is accessing their own data or is an admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new AppError('You can only view your own profile', 403);
  }

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.json(user);
}));

// Update user (users can update their own, admin can update all)
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  // Check if user is updating their own data or is an admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new AppError('You can only update your own profile', 403);
  }

  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent role escalation (only admins can change roles)
  if (req.body.role && req.user.role !== 'admin') {
    throw new AppError('Only admins can change user roles', 403);
  }

  // Don't allow email changes to prevent conflicts
  if (req.body.email && req.body.email !== user.email) {
    throw new AppError('Email cannot be changed', 400);
  }

  await user.update(req.body);
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}));

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  await user.destroy();
  res.status(204).send();
}));

module.exports = router;
