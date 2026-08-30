const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'GBP',
  },
  type: {
    type: String,
    enum: ['employer_fee', 'employee_contribution'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending',
  },
  stripeSessionId: {
    type: String,
    required: true,
  },
  payerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // This can refer to either an Organisation or an Employee
    refPath: 'payerModel'
  },
  payerModel: {
    type: String,
    required: true,
    enum: ['Organisation', 'Employee']
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: false // Only really needed for employee_contribution to filter easily, but good to have globally
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
