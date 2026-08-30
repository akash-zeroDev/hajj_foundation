const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const { requireSuperAdmin, requireOrgAdmin } = require('../middleware/auth');

// Super Admin Global Routes
router.get('/transactions', requireSuperAdmin, financialController.getGlobalTransactions);
router.get('/stats', requireSuperAdmin, financialController.getGlobalStats);

// Org Admin Routes
// We pass the mongo ID of the organization to get its transactions
router.get('/org-transactions/:orgId', requireOrgAdmin, financialController.getOrgTransactions);

module.exports = router;
