const { Task, User, sequelize } = require('../models');

exports.getWorkloadReport = async (req, res) => {
  try {
    const report = await Task.findAll({
      attributes: [
        'assigneeId',
        'status',
        [sequelize.fn('COUNT', sequelize.col('Task.id')), 'taskCount'],
      ],
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
      group: [
        'Task.assigneeId',
        'Task.status',
        'assignee.id',
        'assignee.name',
        'assignee.email',
        'assignee.role',
      ],
      order: [
        ['status', 'ASC'],
      ],
    });

    return res.status(200).json(report);
  } catch (error) {
    console.error('Workload report aggregation error:', error);
    return res.status(500).json({ error: 'Server error generating workload report.' });
  }
};
