const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Only superadmin can create a user
router.post('/', verifyToken, authorizeRoles('superadmin'), createUser);

module.exports = router;
