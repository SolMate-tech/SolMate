const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const { protect } = require('../middleware/authMiddleware');
const {
  getProviders,
  getUserPreferences,
  updatePreferences,
  sendMessage,
  streamMessage,
  compareModels,
  processStreamingRequest
} = require('../controllers/llmController');

/**
 * @route   GET /api/llm/providers
 * @desc    Get all available LLM providers and their models
 * @access  Public
 */
router.get('/providers', getProviders);

/**
 * @route   GET /api/llm/preferences
 * @desc    Get authenticated user's LLM preferences
 * @access  Private
 */
router.get('/preferences', protect, getUserPreferences);

/**
 * @route   POST /api/llm/preferences
 * @desc    Update authenticated user's LLM preferences
 * @access  Private
 * @body    { provider: string, model: string, apiKey?: string }
 */
router.post('/preferences', protect, updatePreferences);

/**
 * @route   POST /api/llm/message
 * @desc    Send a message to the LLM provider
 * @access  Private
 * @body    { message: string, context?: object }
 */
router.post('/message', protect, sendMessage);

/**
 * @route   POST /api/llm/stream
 * @desc    Send a message to the LLM provider with streaming response
 * @access  Private
 * @body    { message: string, context?: object }
 */
router.post('/stream', protect, streamMessage);

/**
 * Authentication middleware for SSE connections
 * Uses token from query params
 */
const tokenAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.query.token;
    
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
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

/**
 * @route   GET /api/llm/stream-events
 * @desc    Establish SSE connection for streaming responses
 * @access  Private (via token in query params)
 */
router.get('/stream-events', tokenAuthMiddleware, (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Send initial connection success event
  res.write('data: {"connected": true}\n\n');
  
  // Handle streaming request if exists
  processStreamingRequest(req, res);
  
  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write('data: {"ping": true}\n\n');
  }, 30000);
  
  // Clean up on close
  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

/**
 * @route   POST /api/llm/compare
 * @desc    Compare responses from multiple LLM models
 * @access  Private
 * @body    { message: string, models: Array<{provider: string, model: string}> }
 */
router.post('/compare', protect, compareModels);

module.exports = router; 