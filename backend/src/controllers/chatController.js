const Message = require('../models/Message');
const logger = require('../utils/logger');
const config = require('../config');
const responseManagerService = require('../services/responseManagerService');
const User = require('../models/User');

/**
 * Send a message to the AI assistant
 * @route POST /api/chat/message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, context = {}, llmOptions = {} } = req.body;
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

    logger.info(`Received message from user ${userId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

    // Save user message to database
    const userMessage = await Message.create({
      user: userId,
      role: 'user',
      message,
      context
    });

    // Get recent conversation history to provide context to the LLM
    const recentMessages = await Message.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
    
    // Format conversation history for the LLM
    const conversationHistory = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.message
      }));
    
    // Set up context with conversation history
    const enrichedContext = {
      ...context,
      conversationHistory
    };
    
    // Process message with response manager
    const aiResponse = await responseManagerService.processMessage(
      message, 
      enrichedContext, 
      llmOptions
    );

    // Save AI response to database with the updated context
    const assistantMessage = await Message.create({
      user: userId,
      role: 'assistant',
      message: aiResponse.message,
      context: {
        ...aiResponse.context,
        provider: aiResponse.provider,
        model: aiResponse.model,
        data: aiResponse.data,
        visualType: aiResponse.visualType,
        intent: aiResponse.intent
      }
    });

    // Return both messages with enhanced data
    res.status(201).json({
      success: true,
      data: {
        userMessage: {
          id: userMessage._id,
          message: userMessage.message,
          timestamp: userMessage.timestamp
        },
        assistantMessage: {
          id: assistantMessage._id,
          message: assistantMessage.message,
          timestamp: assistantMessage.timestamp,
          provider: aiResponse.provider,
          model: aiResponse.model,
          data: aiResponse.data,
          visualType: aiResponse.visualType,
          intent: aiResponse.intent
        },
        context: aiResponse.context
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

    // Process messages for response
    const formattedMessages = messages.map(msg => {
      const formattedMsg = {
        id: msg._id,
        role: msg.role,
        message: msg.message,
        timestamp: msg.timestamp
      };
      
      // Include additional data for assistant messages
      if (msg.role === 'assistant' && msg.context) {
        if (msg.context.data) {
          formattedMsg.data = msg.context.data;
        }
        if (msg.context.visualType) {
          formattedMsg.visualType = msg.context.visualType;
        }
        if (msg.context.provider) {
          formattedMsg.provider = msg.context.provider;
        }
        if (msg.context.model) {
          formattedMsg.model = msg.context.model;
        }
        if (msg.context.intent) {
          formattedMsg.intent = msg.context.intent;
        }
      }
      
      return formattedMsg;
    });

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
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

/**
 * Get available LLM providers and models
 * @route GET /api/chat/llm-providers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLLMProviders = async (req, res, next) => {
  try {
    const providers = responseManagerService.getAvailableProviders();
    
    // For each available provider, get its models
    const providersWithModels = {};
    Object.entries(providers).forEach(([key, provider]) => {
      if (provider.available) {
        providersWithModels[key] = {
          ...provider,
          models: responseManagerService.getAvailableModels(provider.id)
        };
      }
    });
    
    res.json({
      success: true,
      data: {
        providers: providersWithModels
      }
    });
  } catch (error) {
    logger.error(`Error in getLLMProviders: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Set preferred LLM provider for user
 * @route PUT /api/chat/llm-provider
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const setPreferredLLMProvider = async (req, res, next) => {
  try {
    const { provider, model } = req.body;
    const userId = req.user._id;
    
    // Validate provider
    const providers = responseManagerService.getAvailableProviders();
    const providerIds = Object.values(providers).map(p => p.id);
    
    if (!provider || !providerIds.includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider'
      });
    }
    
    // If model is specified, validate it
    if (model) {
      const models = responseManagerService.getAvailableModels(provider);
      if (!models.includes(model)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid model for the selected provider'
        });
      }
    }
    
    // Update user's profile with preferred provider and model
    await User.findByIdAndUpdate(userId, {
      $set: {
        'preferences.llmProvider': provider,
        ...(model && { 'preferences.llmModel': model }),
      }
    });
    
    res.json({
      success: true,
      message: 'Preferred LLM provider updated successfully',
      data: {
        provider,
        model
      }
    });
  } catch (error) {
    logger.error(`Error in setPreferredLLMProvider: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory,
  getLLMProviders,
  setPreferredLLMProvider
}; 