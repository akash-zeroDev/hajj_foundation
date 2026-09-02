const Notification = require('../models/Notification');
const { getAuth } = require('@clerk/express');
const Employee = require('../models/Employee');
const Organisation = require('../models/Organisation');

exports.getUnreadNotifications = async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;
    if (!clerkId) return res.status(401).json({ message: 'Unauthorized' });

    // Determine user's roles
    const userRole = auth.sessionClaims?.metadata?.role || 'employee';
    const orgRole = auth.orgRole; // e.g., 'org:admin'
    const orgIdStr = auth.orgId; // Clerk org ID
    
    // Build query to find notifications that apply to this user
    const orConditions = [];

    // 1. Direct messages to this user
    orConditions.push({ recipientUserId: clerkId });

    // 2. Superadmin messages
    if (userRole === 'superadmin') {
      orConditions.push({ recipientRole: 'superadmin' });
    }

    // 3. Org Admin messages
    if (orgRole === 'org:admin' && orgIdStr) {
      // We need the Mongo ObjectId for this Clerk Org ID
      const org = await Organisation.findOne({ clerkOrganizationId: orgIdStr });
      if (org) {
        orConditions.push({ 
          recipientRole: 'org:admin', 
          recipientOrgId: org._id 
        });
      }
    }

    if (orConditions.length === 0) {
      return res.status(200).json({ notifications: [], unreadCount: 0 });
    }

    const query = {
      $or: orConditions,
      readBy: { $ne: clerkId } // Only unread
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50

    res.status(200).json({
      notifications,
      unreadCount: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const auth = getAuth(req);
    const clerkId = auth.userId;
    
    if (!clerkId || !notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $addToSet: { readBy: clerkId } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
