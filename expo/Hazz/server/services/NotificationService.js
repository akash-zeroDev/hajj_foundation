const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Send a notification to all superadmins
   */
  static async notifySuperAdmin({ senderId, senderName, type, title, message, actionUrl }) {
    try {
      await Notification.create({
        recipientRole: 'superadmin',
        senderId,
        senderName,
        type,
        title,
        message,
        actionUrl
      });
    } catch (error) {
      console.error('Failed to create superadmin notification:', error);
    }
  }

  /**
   * Send a notification to all admins of a specific organization
   */
  static async notifyOrgAdmins({ orgId, senderId, senderName, type, title, message, actionUrl }) {
    try {
      if (!orgId) throw new Error('orgId is required for org:admin notifications');
      await Notification.create({
        recipientRole: 'org:admin',
        recipientOrgId: orgId,
        senderId,
        senderName,
        type,
        title,
        message,
        actionUrl
      });
    } catch (error) {
      console.error('Failed to create org admin notification:', error);
    }
  }

  /**
   * Send a notification to a specific user
   */
  static async notifyUser({ userId, senderId, senderName, type, title, message, actionUrl }) {
    try {
      await Notification.create({
        recipientUserId: userId,
        senderId,
        senderName,
        type,
        title,
        message,
        actionUrl
      });
    } catch (error) {
      console.error('Failed to create user notification:', error);
    }
  }
}

module.exports = NotificationService;
