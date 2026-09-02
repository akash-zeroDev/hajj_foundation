const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireOrgAdmin, requireSelf, isAuthenticated } = require('../middleware/auth');

// Protected route: Only the Org Admin can initiate this checkout
router.post('/create-annual-fee-checkout', requireOrgAdmin, paymentController.createAnnualFeeCheckout);

router.get('/verify-annual-fee', requireOrgAdmin, paymentController.verifyAnnualFeeCheckout);


// Protected route: Only the specific employee can initiate this subscription
router.post('/create-employee-subscription', isAuthenticated, paymentController.createEmployeeSubscription);
router.get('/verify-employee-subscription', isAuthenticated, paymentController.verifyEmployeeSubscription);

router.post('/customer-portal', isAuthenticated, paymentController.createCustomerPortal);
router.post('/cancel-employee-subscription', isAuthenticated, paymentController.cancelSubscription);

module.exports = router;
