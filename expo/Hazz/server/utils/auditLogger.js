const AuditLog = require('../models/AuditLog');

const logAudit = async (req, clerkUserId, action, details) => {
  try {
    // Extract IP address from request (handles proxies if configured)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || 'Unknown IP';
    
    await AuditLog.create({
      clerkUserId,
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // We intentionally don't throw the error so we don't break the main feature flow if logging fails,
    // though in a strict system you might want to throw.
  }
};

module.exports = logAudit;
