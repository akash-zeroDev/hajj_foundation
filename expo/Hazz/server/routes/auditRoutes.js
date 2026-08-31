const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { requireSuperAdmin } = require('../middleware/auth');

router.get('/', requireSuperAdmin, auditController.getAuditLogs);

// Tracking route for any authenticated user (employee or superadmin)
router.post('/track', auditController.trackAction);

module.exports = router;
