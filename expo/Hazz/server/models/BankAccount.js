const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  accountType: {
    type: String,
    enum: ['operating_revenue', 'hajj_trust_pool'],
    required: true,
    unique: true // Only one active account per type at a time
  },
  accountHolderName: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  last4: {
    type: String,
    required: true
  },
  stripeBankAccountId: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
