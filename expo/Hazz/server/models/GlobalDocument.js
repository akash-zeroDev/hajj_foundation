const mongoose = require('mongoose');

const globalDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: String, // Clerk ID of Super Admin
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('GlobalDocument', globalDocumentSchema);
