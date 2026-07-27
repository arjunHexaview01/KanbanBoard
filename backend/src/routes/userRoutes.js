const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/', validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);
router.get('/', auth, userController.getAllUsers);

module.exports = router;
