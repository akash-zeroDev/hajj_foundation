const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireSuperAdmin } = require('../middleware/auth');

router.get('/superadmin', requireSuperAdmin, dashboardController.getSuperAdminOverview);

module.exports = router;
