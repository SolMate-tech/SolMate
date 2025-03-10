const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Authentication middleware to protect routes
 * Validates JWT token and adds user to request
 */
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.app.jwtSecret);

      // Find user by id
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error(`JWT verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

/**
 * Admin-only middleware
 * Ensures the user has admin role
 */
exports.adminOnly = (req, res, next) => {
  // Check if user exists and has admin role
  if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Admin privileges required'
    });
  }
  
  next();
}; 