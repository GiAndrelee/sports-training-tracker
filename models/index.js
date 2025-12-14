const sequelize = require('../db/sequelize');
const User = require('./User');
const Workout = require('./Workout');
const Goal = require('./Goal');

User.hasMany(Workout, { foreignKey: 'userId' });
Workout.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { foreignKey: 'userId' });
Goal.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Workout, Goal };