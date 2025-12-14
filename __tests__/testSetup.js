const { sequelize } = require('../models');

// Setup function to run before all tests
const setupTestDB = async () => {
  await sequelize.sync({ force: true });
};

// Teardown function to run after all tests
const teardownTestDB = async () => {
  await sequelize.close();
};

// Clear all tables between tests
const clearDatabase = async () => {
  await sequelize.sync({ force: true });
};

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearDatabase
};
