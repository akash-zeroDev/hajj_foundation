const User = require('../models/User');

exports.createUser = async (req, res) => {
  const { email, password, role, organisationId, status } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      email,
      password, // In a real app, generate a random one and email it, but we use this for now
      role,
      organisationId,
      status
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        organisationId: user.organisationId,
        status: user.status 
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
