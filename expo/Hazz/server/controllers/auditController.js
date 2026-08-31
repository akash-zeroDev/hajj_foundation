const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    // Return newest logs first, limit to 500 for performance
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
};


const logAudit = require('../utils/auditLogger');

exports.trackAction = async (req, res) => {
  try {
    const { action, details } = req.body;
    
    // Fallback to clerk auth parsing
    let clerkId = 'Unknown User';
    if (req.auth && req.auth.userId) clerkId = req.auth.userId;
    else if (req.auth && typeof req.auth === 'function' && req.auth().userId) {
      clerkId = req.auth().userId;
    }
    
    // We already have logAudit doing the IP and db save
    await logAudit(req, clerkId, action, details);
    
    res.status(200).json({ success: true, message: 'Action tracked' });
  } catch (error) {
    console.error('Error tracking action:', error);
    res.status(500).json({ success: false, message: 'Server error tracking action' });
  }
};
