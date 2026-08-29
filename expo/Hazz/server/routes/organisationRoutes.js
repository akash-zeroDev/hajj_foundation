const express = require('express');
const multer = require('multer');
const { onboardOrganisation } = require('../controllers/organisationController');
const { requireAuth } = require('@clerk/express'); // Clerk express middleware

const router = express.Router();

// Configure multer for memory storage (we upload buffer to Cloudinary directly)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define the route
// requireAuth() ensures only logged-in users can call this. 
// We could also add a custom middleware to check if req.auth.sessionClaims.publicMetadata.role === 'superadmin'
router.post(
  '/onboard',
  // requireAuth(), // uncomment once Clerk is fully wired up on backend
  upload.single('agreementFile'), 
  onboardOrganisation
);

module.exports = router;
