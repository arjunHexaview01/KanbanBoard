const { Task, User } = require('../models');

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    });

    const fullTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] }]
    });

    return res.status(201).json(fullTask);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Server error creating task.' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, assigneeId, priority, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] }]
    });

    return res.status(200).json({
      tasks,
      totalItems: count,
      currentPage: parsedPage,
      totalPages: Math.ceil(count / parsedLimit),
    });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({ error: 'Server error fetching tasks.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] }]
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Server error updating task.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await task.destroy();
    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Server error deleting task.' });
  }
};
