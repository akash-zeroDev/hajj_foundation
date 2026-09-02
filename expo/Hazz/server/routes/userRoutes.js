const { requireSuperAdmin } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', requireSuperAdmin, userController.getAllUsers);


router.post('/:id/reset-password', requireSuperAdmin, userController.resetPassword);
router.post('/:id/toggle-suspend', requireSuperAdmin, userController.toggleSuspend);
router.delete('/:id', requireSuperAdmin, userController.deleteUser);

module.exports = router;
