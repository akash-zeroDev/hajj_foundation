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
      'DISCARDED_DRAW',
      'DOWNLOADED_LEDGER_CSV',
      'DOWNLOADED_OPS_PDF',
      'DOWNLOADED_SAVINGS_STATEMENT',
      'VIEWED_SIGNED_CONTRACT'
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
