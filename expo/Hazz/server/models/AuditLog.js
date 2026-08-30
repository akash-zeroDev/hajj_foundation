const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'UPDATED_BANK_ROUTING',
      'UPLOADED_DOCUMENT',
      'EXECUTED_DRAW',
      'APPROVED_DRAW',
      'DISCARDED_DRAW'
    ]
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
