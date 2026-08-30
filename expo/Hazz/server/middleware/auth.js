const { requireAuth, getAuth } = require('@clerk/express');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const Employee = require('../models/Employee');
const Organisation = require('../models/Organisation');

// 1. Basic Auth (Any logged-in user)
const isAuthenticated = requireAuth();

// 2. Super Admin Only
const requireSuperAdmin = async (req, res, next) => {
  try {
        if (!getAuth(req) || !getAuth(req).userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing Clerk Token' });
    }
    const user = await clerk.users.getUser(getAuth(req).userId);
    if (user.publicMetadata?.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Super Admin Auth Error:', err);
    res.status(500).json({ message: 'Internal Server Error verifying role' });
  }
};

// 3. Org Admin Only (For a specific organisation)
const requireOrgAdmin = async (req, res, next) => {
  try {
    if (!getAuth(req) || !getAuth(req).userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // getAuth(req).orgId comes from the Clerk session token if the user is acting on behalf of an org
    // getAuth(req).orgRole should be 'org:admin'
    
    // Some routes use /clerk/:clerkId, others use MongoDB /:id
    // We'll verify they have an active org:admin role in ANY org for general org admin routes
    // For specific routes, they should only access their own.
        const user = await clerk.users.getUser(getAuth(req).userId);
    if (user.publicMetadata?.role === 'superadmin') {
      return next(); // Super Admin bypasses all checks
    }
    if (getAuth(req).orgRole !== 'org:admin') {
      return res.status(403).json({ message: 'Forbidden: Organisation Admin required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Authorization error' });
  }
};

// 4. Employee Self Access
const requireSelf = async (req, res, next) => {
  try {
    if (!getAuth(req) || !getAuth(req).userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // In our routes, we often use /api/employees/clerk/:clerkId
        const user = await clerk.users.getUser(getAuth(req).userId);
    if (user.publicMetadata?.role === 'superadmin') {
      return next(); // Super Admin bypasses all checks
    }
    const clerkIdParam = req.params.clerkId;
    
    // If accessing via Mongo ID:
    const mongoIdParam = req.params.id;
    
    if (clerkIdParam) {
      if (getAuth(req).userId !== clerkIdParam) {
        return res.status(403).json({ message: 'Forbidden: Can only access your own data' });
      }
    } else if (mongoIdParam) {
      const employee = await Employee.findById(mongoIdParam);
      if (!employee || employee.clerkUserId !== getAuth(req).userId) {
        return res.status(403).json({ message: 'Forbidden: Can only access your own data' });
      }
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Authorization error' });
  }
};

module.exports = {
  isAuthenticated,
  requireSuperAdmin,
  requireOrgAdmin,
  requireSelf
};
