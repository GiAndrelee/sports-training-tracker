const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'not_started'
  }
});

module.exports = Goal;