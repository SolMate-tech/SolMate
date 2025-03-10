const Message = require('../models/Message');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Send a message to the AI assistant
 * @route POST /api/chat/message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, context = {} } = req.body;
    const userId = req.user._id;

    // Validate message
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Validate context object
    if (typeof context !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Context must be an object'
      });
    }

    // Log the incoming message
    logger.info(`Received message from user ${userId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

    // Save user message to database
    const userMessage = await Message.create({
      user: userId,
      role: 'user',
      message,
      context
    });

    // Process the message and generate AI response
    // In a real implementation, this would call an AI service
    // For now, we'll simulate an AI response with a small delay for realism
    
    // Simple pre-defined responses for demonstration
    const responses = [
      "I've analyzed this token and found its volatility to be relatively low compared to market averages.",
      "Based on recent market movements, I'd suggest monitoring this position closely.",
      "The on-chain data for this token shows increasing adoption and utility.",
      "Looking at historical patterns, this token has shown resilience during market downturns.",
      "I've detected several whale movements for this token in the past 24 hours.",
      "The liquidity for this token is distributed across multiple DEXs, which is generally positive for stability.",
      "There appears to be growing social sentiment around this project.",
      "Risk assessment shows a moderate risk profile for this token."
    ];
    
    // Select a random response
    const aiResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add a small processing delay (50-300ms) for realism
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 250));

    // Save AI response to database
    const assistantMessage = await Message.create({
      user: userId,
      role: 'assistant',
      message: aiResponse,
      context
    });

    // Return both messages
    res.status(201).json({
      success: true,
      data: {
        userMessage: userMessage,
        assistantMessage: assistantMessage
      }
    });
  } catch (error) {
    logger.error(`Error in sendMessage: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Get chat history for a user
 * @route GET /api/chat/history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Optional query parameters for pagination
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    
    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }
    
    if (skip < 0) {
      return res.status(400).json({
        success: false,
        error: 'Skip cannot be negative'
      });
    }

    // Get messages from database with pagination
    const messages = await Message.find({ user: userId })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    
    // Get total count for pagination info
    const total = await Message.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          limit,
          skip,
          hasMore: total > skip + limit
        }
      }
    });
  } catch (error) {
    logger.error(`Error in getHistory: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Clear chat history for a user
 * @route DELETE /api/chat/history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete all messages for this user
    const result = await Message.deleteMany({ user: userId });

    // Add a system message indicating that history was cleared
    await Message.create({
      user: userId,
      role: 'system',
      message: 'Chat history has been cleared.'
    });

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    logger.error(`Error in clearHistory: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory
}; 