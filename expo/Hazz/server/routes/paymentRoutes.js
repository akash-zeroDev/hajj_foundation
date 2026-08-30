const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireOrgAdmin } = require('../middleware/auth');

// Protected route: Only the Org Admin can initiate this checkout
router.post('/create-annual-fee-checkout', requireOrgAdmin, paymentController.createAnnualFeeCheckout);

module.exports = router;
