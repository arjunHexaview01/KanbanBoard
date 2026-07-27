const { sequelize } = require('../config/database');
const User = require('./user');
const Task = require('./task');

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'tasks', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

module.exports = {
  sequelize,
  User,
  Task,
};
