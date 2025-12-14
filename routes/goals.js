const express = require('express');
const router = express.Router();
const { Goal } = require('../models');

router.get('/', async (req, res) => {
  res.json(await Goal.findAll());
});

router.post('/', async (req, res) => {
  const goal = await Goal.create(req.body);
  res.status(201).json(goal);
});

module.exports = router;
