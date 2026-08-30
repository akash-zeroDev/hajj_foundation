const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireSuperAdmin } = require('../middleware/auth');

router.get('/operational-stats', requireSuperAdmin, reportController.getOperationalStats);
router.get('/ledger-export', requireSuperAdmin, reportController.getLedgerExport);

module.exports = router;
