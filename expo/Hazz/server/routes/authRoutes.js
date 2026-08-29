const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);


router.get('/superadmin-data', verifyToken, authorizeRoles('superadmin'), (req, res) => {
  res.json({ data: 'This is highly sensitive superadmin data' });
});

module.exports = router;
