const mongoose = require('mongoose');

const awardDrawSchema = new mongoose.Schema({
  drawName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending_approval', 'completed', 'discarded'],
    default: 'pending_approval',
  },
  numberOfWinners: {
    type: Number,
    required: true,
  },
  winners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  executedBy: {
    type: String, // Clerk User ID of the admin who ran it
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('AwardDraw', awardDrawSchema);
