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
  isSuspended: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
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
    enum: ['pending', 'signed'],
    default: 'pending' // They must log in and accept the agreement
  },
  agreementUrl: {
    type: String,
    required: false
  },
  adminEmail: {
    type: String,
    required: false
  },
  adminFirstName: {
    type: String,
    required: false
  },
  adminLastName: {
    type: String,
    required: false
  },
  adminPhone: {
    type: String,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Organisation', organisationSchema);
