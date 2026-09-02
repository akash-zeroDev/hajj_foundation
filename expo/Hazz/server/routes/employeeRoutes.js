const { requireSelf, isAuthenticated, requireOrgAdmin } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/clerk/:clerkId', requireSelf, employeeController.getEmployeeProfile);
router.get('/clerk/:clerkId/admin', requireOrgAdmin, employeeController.getEmployeeForAdmin);
router.patch('/:id/complete-onboarding', requireSelf, employeeController.completeOnboarding);
router.patch('/:id/bank-settings', requireSelf, employeeController.updateBankSettings);

module.exports = router;
