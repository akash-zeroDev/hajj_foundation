const { requireSuperAdmin } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', requireSuperAdmin, userController.getAllUsers);

module.exports = router;
