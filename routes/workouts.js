const express = require('express');
const router = express.Router();
const { Workout } = require('../models');

router.get('/', async (req, res) => {
  const workouts = await Workout.findAll();
  res.json(workouts);
});

router.post('/', async (req, res) => {
  const workout = await Workout.create(req.body);
  res.status(201).json(workout);
});

router.put('/:id', async (req, res) => {
  const workout = await Workout.findByPk(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Not found' });
  await workout.update(req.body);
  res.json(workout);
});

router.delete('/:id', async (req, res) => {
  const workout = await Workout.findByPk(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Not found' });
  await workout.destroy();
  res.status(204).send();
});

module.exports = router;