const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  signedDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GlobalDocument'
  },
  agreementStatus: {
    type: String,
    enum: ['pending', 'signed'],
    default: 'pending'
  },
  monthlyContribution: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  awardStatus: {
    type: String,
    enum: ['none', 'won', 'claimed'],
    default: 'none'
  },

  
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  subscriptionStatus: { type: String, enum: ['pending', 'active', 'past_due', 'canceled'], default: 'pending' },
  
  autoPayEnabled: { type: Boolean, default: false },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    sortCode: String
  },

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
