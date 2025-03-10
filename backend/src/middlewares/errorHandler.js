const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error with request details
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: JSON.stringify(req.body).substring(0, 1000), // Truncate long request bodies
    query: req.query,
    ip: req.ip,
    userId: req.user ? req.user._id : 'unauthenticated'
  });

  // Set default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = Object.values(err.errors).map(e => e.message);
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // MongoDB error
    statusCode = 500;
    if (err.code === 11000) {
      // Duplicate key error
      statusCode = 409;
      message = 'Duplicate Key Error';
      // Extract the duplicate key field
      const field = Object.keys(err.keyValue)[0];
      errorDetails = `The ${field} '${err.keyValue[field]}' already exists`;
    }
  } else if (err.name === 'CastError') {
    // Mongoose cast error (e.g., invalid ObjectId)
    statusCode = 400;
    message = 'Invalid ID format';
    errorDetails = `Cannot cast '${err.value}' to ${err.kind}`;
  } else if (err.name === 'JsonWebTokenError') {
    // JWT validation error
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expiration error
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'UnauthorizedError') {
    // Authentication error
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    // Authorization error
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    // Resource not found
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    // External service connection error
    statusCode = 503;
    message = 'Service Unavailable';
    errorDetails = 'Failed to connect to an external service';
  } else if (err.code === 'ETIMEDOUT') {
    // Timeout error
    statusCode = 504;
    message = 'Gateway Timeout';
    errorDetails = 'Request timed out';
  }

  // Prepare the error response
  const errorResponse = {
    success: false,
    error: {
      message,
      status: statusCode,
      ...(errorDetails && { details: errorDetails }),
      // Include stack trace in development mode
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  // Add request ID if available
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler; 