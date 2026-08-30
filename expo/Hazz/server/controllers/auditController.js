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
