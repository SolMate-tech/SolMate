const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Find user by ID
      const user = await User.findById(decoded.id);

      if (!user) {
        logger.warn(`User not found for token: ${token}`);
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      return res.status(401).json({ error: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

/**
 * Middleware to check if user is authenticated, but doesn't block the request
 */
const optionalAuth = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Find user by ID
      const user = await User.findById(decoded.id);

      if (user) {
        // Set user in request object
        req.user = user;
      }
    } catch (error) {
      // Just log the error but don't block the request
      logger.warn(`Optional auth error: ${error.message}`);
    }
  }

  next();
};

module.exports = {
  protect,
  optionalAuth,
}; 