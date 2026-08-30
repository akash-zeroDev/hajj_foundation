const express = require('express');
const router = express.Router();
const awardController = require('../controllers/awardController');
const { requireSuperAdmin } = require('../middleware/auth');

router.get('/', requireSuperAdmin, awardController.getDraws);
router.post('/run-draw', requireSuperAdmin, awardController.runDraw);
router.post('/approve-draw/:id', requireSuperAdmin, awardController.approveDraw);
router.post('/discard-draw/:id', requireSuperAdmin, awardController.discardDraw);

module.exports = router;
