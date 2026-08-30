const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { requireSuperAdmin } = require('../middleware/auth');

router.get('/', requireSuperAdmin, bankController.getBankAccounts);
router.post('/update', requireSuperAdmin, bankController.updateBankAccount);

module.exports = router;
