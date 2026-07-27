const app = require('./app');
const { sequelize, User, Task } = require('./models');
const { ensureDatabaseExists } = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function seedDatabase() {
  const userCount = await User.count();
  if (userCount > 0) {
    return;
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  const users = await User.bulkCreate([
    { name: 'System Admin', email: 'admin@company.com', password: adminPassword, role: 'Admin' },
    { name: 'John Doe', email: 'john@company.com', password: memberPassword, role: 'Member' },
    { name: 'Jane Smith', email: 'jane@company.com', password: memberPassword, role: 'Member' },
    { name: 'Bob Johnson', email: 'bob@company.com', password: memberPassword, role: 'Member' },
    { name: 'Alice Brown', email: 'alice@company.com', password: memberPassword, role: 'Member' },
  ], { returning: true });

  const admin = users[0];
  const john = users[1];
  const jane = users[2];
  const bob = users[3];
  const alice = users[4];

  const getDateOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  await Task.bulkCreate([
    { title: 'Configure OAuth login flow', description: 'Implement secure authentication via standard identity providers.', status: 'Todo', priority: 'High', assigneeId: john.id, dueDate: getDateOffset(3) },
    { title: 'Design database schemas', description: 'Normalize relations and define indices for User and Task tables.', status: 'Done', priority: 'High', assigneeId: john.id, dueDate: getDateOffset(-2) },
    { title: 'Build reports dashboard view', description: 'Create interactive charts and aggregation lists for the workload tracker.', status: 'In Progress', priority: 'Medium', assigneeId: jane.id, dueDate: getDateOffset(5) },
    { title: 'Write integration tests', description: 'Establish end-to-end tests for the Express routing and validation middleware.', status: 'Todo', priority: 'Low', assigneeId: bob.id, dueDate: getDateOffset(7) },
    { title: 'Deploy application staging env', description: 'Provision cloud instances and establish automatic build pipelines.', status: 'In Progress', priority: 'High', assigneeId: alice.id, dueDate: getDateOffset(2) },
    { title: 'Document API endpoints in README', description: 'Define input schemas and response structures for client consumption.', status: 'Todo', priority: 'Medium', assigneeId: admin.id, dueDate: getDateOffset(1) },
    { title: 'Refactor state management to Zustand', description: 'Migrate React context states to clean Zustand slices.', status: 'Done', priority: 'Medium', assigneeId: jane.id, dueDate: getDateOffset(0) },
    { title: 'Setup GitHub Actions CI pipeline', description: 'Build and lint tasks on each pull request.', status: 'Todo', priority: 'Low', assigneeId: admin.id, dueDate: getDateOffset(4) },
    { title: 'Audit npm package dependencies', description: 'Fix vulnerability warnings and resolve deprecated packages.', status: 'Done', priority: 'Low', assigneeId: bob.id, dueDate: getDateOffset(-1) },
    { title: 'Refactor backend error handlers', description: 'Return standard JSON error bodies instead of raw stack traces.', status: 'In Progress', priority: 'Medium', assigneeId: john.id, dueDate: getDateOffset(2) },
    { title: 'Optimize Sequelize query performance', description: 'Add database indices on foreign keys and compound fields.', status: 'Todo', priority: 'High', assigneeId: jane.id, dueDate: getDateOffset(6) },
    { title: 'Design client landing page', description: 'Mock up user interface wireframes in Figma.', status: 'Done', priority: 'Low', assigneeId: alice.id, dueDate: getDateOffset(-5) },
    { title: 'Implement JWT refresh tokens', description: 'Maintain user login sessions securely.', status: 'Todo', priority: 'High', assigneeId: john.id, dueDate: getDateOffset(10) },
    { title: 'Configure production MySQL backup', description: 'Schedule daily cron jobs to upload database dumps to S3.', status: 'Todo', priority: 'High', assigneeId: admin.id, dueDate: getDateOffset(8) },
    { title: 'Implement CSS dark mode support', description: 'Allow users to switch between light and dark visual aesthetics.', status: 'Done', priority: 'Medium', assigneeId: jane.id, dueDate: getDateOffset(-4) },
    { title: 'Write React component unit tests', description: 'Use React Testing Library to verify form inputs validation.', status: 'Todo', priority: 'Low', assigneeId: bob.id, dueDate: getDateOffset(9) },
    { title: 'Configure CORS headers securely', description: 'Restrict access to the backend API to trusted domains.', status: 'In Progress', priority: 'High', assigneeId: alice.id, dueDate: getDateOffset(1) },
    { title: 'Format source code with Prettier', description: 'Establish consistent styling rules across all source files.', status: 'Done', priority: 'Low', assigneeId: john.id, dueDate: getDateOffset(-3) }
  ]);
}

async function startServer() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('Connected to MySQL database successfully.');
    await sequelize.sync({ alter: true });
    console.log('Sequelize tables synced.');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
