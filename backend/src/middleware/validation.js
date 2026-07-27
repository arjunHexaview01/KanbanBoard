const User = require('../models/user');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isDateInPast(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  return date < today;
}

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }
  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }
  if (role && !['Admin', 'Member'].includes(role)) {
    errors.push({ field: 'role', message: 'Role must be either Admin or Member' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

const validateTask = async (req, res, next) => {
  const { title, status, priority, assigneeId, dueDate } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!title || title.trim() === '') {
      errors.push({ field: 'title', message: 'Title is required' });
    }
  }

  if (status && !['Todo', 'In Progress', 'Done'].includes(status)) {
    errors.push({ field: 'status', message: "Status must be one of: 'Todo', 'In Progress', 'Done'" });
  }

  if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
    errors.push({ field: 'priority', message: "Priority must be one of: 'Low', 'Medium', 'High'" });
  }

  if (dueDate) {
    const isInvalidDate = isNaN(Date.parse(dueDate));
    if (isInvalidDate) {
      errors.push({ field: 'dueDate', message: 'Due date must be a valid date format (YYYY-MM-DD)' });
    } else if (isDateInPast(dueDate)) {
      errors.push({ field: 'dueDate', message: 'Due date cannot be in the past' });
    }
  }

  if (assigneeId !== undefined && assigneeId !== null) {
    const parsedId = parseInt(assigneeId, 10);
    if (isNaN(parsedId)) {
      errors.push({ field: 'assigneeId', message: 'Assignee ID must be an integer' });
    } else {
      try {
        const userExists = await User.findByPk(parsedId);
        if (!userExists) {
          errors.push({ field: 'assigneeId', message: `Assignee user with ID ${parsedId} does not exist` });
        }
      } catch (err) {
        errors.push({ field: 'assigneeId', message: 'Failed to verify assignee ID' });
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask,
};
