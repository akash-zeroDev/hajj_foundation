const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  clerkOrganizationId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  companyNumber: {
    type: String,
    required: true
  },
  registeredAddress: {
    type: String,
    required: true
  },
  annualFee: {
    type: Number,
    required: true
  },
  annualFeeStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  agreementStatus: {
    type: String,
    enum: ['pending', 'signed', 'expired'],
    default: 'signed' // Assuming they sign and upload immediately on onboarding
  },
  agreementUrl: {
    type: String,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Organisation', organisationSchema);
