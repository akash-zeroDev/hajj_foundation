const { isAuthenticated, requireSuperAdmin, requireOrgAdmin } = require('../middleware/auth');
const express = require('express');
const multer = require('multer');
const { getEmployeeAgreements, onboardOrganisation, getOrganisations, getOrganisationById, getOrganisationEmployees, updateOrganisation, toggleSuspension, archiveOrganisation, getOrganisationByClerkId, acceptAgreement } = require('../controllers/organisationController');
const { requireAuth } = require('@clerk/express'); 

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all organisations
router.get('/', requireSuperAdmin, getOrganisations);

// GET organisation by Clerk ID (Used by Org Admin frontend)
router.get('/clerk/:clerkId', isAuthenticated, getOrganisationByClerkId);

// GET employee agreements tracking for an organisation
router.get('/clerk/:clerkId/employee-agreements', requireOrgAdmin, getEmployeeAgreements);

// PATCH accept agreement by Clerk ID
router.patch('/clerk/:clerkId/accept-agreement', requireOrgAdmin, acceptAgreement);

// GET single organisation by ID
router.get('/:id', requireSuperAdmin, getOrganisationById);

// PUT edit single organisation
router.put('/:id', requireSuperAdmin, updateOrganisation);

// PATCH toggle suspension
router.patch('/:id/suspend', requireSuperAdmin, toggleSuspension);

// PATCH archive organisation
router.patch('/:id/archive', requireSuperAdmin, archiveOrganisation);

// GET employees for an organisation
router.get('/:id/employees', requireSuperAdmin, getOrganisationEmployees);

// POST onboard new organisation
router.post(
  '/onboard',
  isAuthenticated, 
  upload.single('agreementFile'), 
  onboardOrganisation
);

module.exports = router;
