const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/unread', isAuthenticated, notificationController.getUnreadNotifications);
router.post('/mark-read', isAuthenticated, notificationController.markAsRead);

module.exports = router;
