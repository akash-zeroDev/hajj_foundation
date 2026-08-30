const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireSuperAdmin } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Public/Employee readable route
router.get('/active', documentController.getActiveDocument);

// Super Admin restricted routes
router.get('/', requireSuperAdmin, documentController.getAllDocuments);
router.post('/upload', requireSuperAdmin, upload.single('agreementFile'), documentController.uploadDocument);

module.exports = router;
