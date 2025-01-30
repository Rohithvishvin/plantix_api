const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../utils/tokenBlacklist');

exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Check if the token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token is invalidated. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};