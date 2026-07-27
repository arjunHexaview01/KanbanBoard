const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

router.use(auth);

router.get('/', taskController.getTasks);
router.post('/', validateTask, taskController.createTask);
router.patch('/:id', validateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
