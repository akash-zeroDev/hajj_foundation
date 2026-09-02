const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientRole: { 
    type: String, 
    enum: ['superadmin', 'org:admin', 'employee'] 
  },
  recipientOrgId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organisation',
    required: function() { return this.recipientRole === 'org:admin'; }
  },
  recipientUserId: { type: String }, // Specific Clerk ID, if targeting an individual
  
  senderId: { type: String }, // Clerk ID of who performed the action
  senderName: { type: String }, 
  
  type: { type: String, required: true }, 
  title: { type: String, required: true },
  message: { type: String, required: true },
  actionUrl: { type: String }, 
  
  readBy: [{ type: String }], // Array of Clerk IDs who have read this
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
