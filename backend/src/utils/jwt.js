const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('./logger');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  try {
    const payload = {
      id: user._id,
      publicKey: user.publicKey,
    };

    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN || '7d' }
    );

    return token;
  } catch (error) {
    logger.error(`Failed to generate token: ${error.message}`);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`);
    // Re-throw with specific error types for better error handling
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

/**
 * Extract token from authorization header
 * @param {String} authHeader - Authorization header
 * @returns {String|null} JWT token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

/**
 * Decode a JWT token without verification
 * @param {String} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.warn(`Token decode failed: ${error.message}`);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  decodeToken,
}; 