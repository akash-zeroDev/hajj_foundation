const { requireSelf, isAuthenticated } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/clerk/:clerkId', requireSelf, employeeController.getEmployeeProfile);
router.patch('/:id/complete-onboarding', requireSelf, employeeController.completeOnboarding);

module.exports = router;
