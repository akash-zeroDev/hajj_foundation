const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { requireSuperAdmin } = require('../middleware/auth');

router.get('/', requireSuperAdmin, auditController.getAuditLogs);

module.exports = router;
