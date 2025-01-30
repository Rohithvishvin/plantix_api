const User = require('../models/User');

// Fetch all users (protected route)
exports.getAllUsers = async (req, res) => {
  try {
    // Ensure only authenticated users can access this endpoint
    const users = await User.find().select('-password'); // Exclude passwords from the response
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};