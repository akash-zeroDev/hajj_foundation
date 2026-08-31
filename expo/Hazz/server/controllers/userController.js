const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const Employee = require('../models/Employee');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await clerk.users.getUserList();
    const rawUsers = Array.isArray(users) ? users : (users.data || []);
    

    res.status(200).json(rawUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};
