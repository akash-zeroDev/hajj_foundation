const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const Employee = require('../models/Employee');
const Organisation = require('../models/Organisation');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await clerk.users.getUserList();
    let rawUsers = Array.isArray(users) ? users : (users.data || []);
    
    // Fetch all clerk organizations and their members to build a map
    // This provides exact organisation names for all users (admins and employees)
    const orgs = await clerk.organizations.getOrganizationList();
    const rawOrgs = Array.isArray(orgs) ? orgs : (orgs.data || []);
    
    const userOrgMap = {};
    for (const org of rawOrgs) {
      try {
        const mems = await clerk.organizations.getOrganizationMembershipList({ organizationId: org.id });
        const rawMems = Array.isArray(mems) ? mems : (mems.data || []);
        rawMems.forEach(m => {
          if (m.publicUserData && m.publicUserData.userId) {
            userOrgMap[m.publicUserData.userId] = org.name;
          }
        });
      } catch (err) {
        console.error('Error fetching memberships for org:', org.id, err);
      }
    }

    // Convert users to plain objects and inject the org name
    const enrichedUsers = rawUsers.map(u => {
      // clerk users are class instances, converting to plain object so we can append properties easily
      const plainUser = { ...u, hasImage: u.hasImage };
      // Fallback to our map
      plainUser.injectedOrgName = userOrgMap[u.id] || null;
      return plainUser;
    });

    res.status(200).json(enrichedUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate a secure temporary password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let tempPassword = '';
    for (let i = 0; i < 16; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure it meets standard complexity (at least one upper, one lower, one number, one special)
    tempPassword = 'A1!' + tempPassword;

    await clerk.users.updateUser(id, {
      password: tempPassword
    });

    res.status(200).json({ success: true, tempPassword });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};

exports.toggleSuspend = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch user to check current banned status
    const user = await clerk.users.getUser(id);
    
    let updatedUser;
    const action = user.banned ? 'unban' : 'ban';
    
    const response = await fetch(`https://api.clerk.com/v1/users/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || `Failed to ${action} user`);
    }

    updatedUser = await response.json();

    res.status(200).json({ success: true, banned: updatedUser.banned });
  } catch (error) {
    console.error('Error toggling suspend:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle suspend status' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete from Clerk
    await clerk.users.deleteUser(id);
    
    // Delete from MongoDB Employee collection to keep things clean
    const Employee = require('../models/Employee');
    await Employee.deleteMany({ clerkUserId: id });
    
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};
