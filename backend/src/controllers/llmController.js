const logger = require('../utils/logger');
const config = require('../config/config');
const User = require('../models/User');
const { LLMService } = require('../services/llmService');
const { ResponseManagerService } = require('../services/responseManagerService');
const crypto = require('crypto');
const Message = require('../models/Message');

// Initialize services
const llmService = new LLMService();
const responseManager = new ResponseManagerService();

// Encryption settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || config.security.encryptionKey;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt API key for secure storage
 * @param {string} apiKey - Plain text API key to encrypt
 * @returns {string} - Encrypted API key with IV prefix
 */
const encryptApiKey = (apiKey) => {
  if (!apiKey) return null;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(apiKey);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    logger.error(`Error encrypting API key: ${error.message}`);
    return null;
  }
};

/**
 * Decrypt stored API key
 * @param {string} encryptedApiKey - Encrypted API key with IV prefix
 * @returns {string} - Decrypted plain text API key
 */
const decryptApiKey = (encryptedApiKey) => {
  if (!encryptedApiKey) return null;
  
  try {
    const parts = encryptedApiKey.split(':');
    if (parts.length !== 2) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    logger.error(`Error decrypting API key: ${error.message}`);
    return null;
  }
};

/**
 * Get available LLM providers with their details
 */
exports.getProviders = async (req, res) => {
  try {
    // Use the existing service to get providers
    const providers = llmService.getAvailableProviders()
      .map(provider => {
        // Map provider details for frontend consumption
        return {
          id: provider.id,
          name: provider.name,
          models: llmService.getAvailableModels(provider.id)
        };
      });
    
    return res.status(200).json({
      success: true,
      data: providers
    });
  } catch (error) {
    logger.error(`Error getting LLM providers: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve LLM providers'
    });
  }
};

/**
 * Get user's LLM preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const preferences = {
      provider: user.llmPreferences?.provider || config.defaultLLMProvider,
      model: user.llmPreferences?.model || config.defaultLLMModel,
      apiKey: user.llmPreferences?.apiKey ? '********' : null
    };
    
    return res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    logger.error(`Error getting LLM preferences: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve LLM preferences'
    });
  }
};

/**
 * Update user's LLM preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider, model, apiKey } = req.body;
    
    // Validate provider and model
    const availableProviders = llmService.getAvailableProviders();
    const providerExists = availableProviders.some(p => p.id === provider);
    
    if (!providerExists) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported LLM provider'
      });
    }
    
    const availableModels = llmService.getAvailableModels(provider);
    if (!availableModels.includes(model)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported model for selected provider'
      });
    }
    
    // Update user's preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Encrypt API key if provided
    let encryptedKey = user.llmPreferences?.apiKey;
    if (apiKey) {
      encryptedKey = encryptApiKey(apiKey);
    }
    
    user.llmPreferences = {
      provider,
      model,
      apiKey: encryptedKey
    };
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'LLM preferences updated successfully',
      data: {
        provider,
        model,
        apiKey: encryptedKey ? '********' : null
      }
    });
  } catch (error) {
    logger.error(`Error updating LLM preferences: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to update LLM preferences'
    });
  }
};

/**
 * Send message to LLM provider
 */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // Get user's LLM preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Use user's preferences or defaults
    const provider = user.llmPreferences?.provider || config.defaultLLMProvider;
    const model = user.llmPreferences?.model || config.defaultLLMModel;
    
    // Get API key - try user's key first, then fallback to system key
    let apiKey = null;
    if (user.llmPreferences?.apiKey) {
      apiKey = decryptApiKey(user.llmPreferences.apiKey);
    }
    
    if (!apiKey) {
      apiKey = config.llmApiKeys[provider];
    }
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'No API key available for selected provider'
      });
    }
    
    // Set options with API key
    const options = {
      model,
      apiKey,
      userId
    };
    
    // Add request start time for monitoring
    const startTime = Date.now();
    
    // Process the message with intent detection
    const responseData = await responseManager.processMessage(message, context, {
      provider,
      model,
      apiKey
    });
    
    // Log performance metrics
    const responseTime = Date.now() - startTime;
    logger.info({
      type: 'llm_performance',
      provider,
      model,
      responseTime,
      userId,
      chars: message.length,
      timestamp: new Date()
    });
    
    return res.status(200).json({
      success: true,
      data: {
        response: responseData.response,
        provider: responseData.metadata.provider,
        model: responseData.metadata.model,
        intent: responseData.intent
      }
    });
  } catch (error) {
    logger.error(`Error sending message to LLM: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to send message to LLM provider'
    });
  }
};

/**
 * Compare responses from multiple LLM models for the same message
 */
exports.compareModels = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, models } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    if (!models || !Array.isArray(models) || models.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one model configuration is required'
      });
    }
    
    // Get user for API keys
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Decrypt user's API key if available
    let userApiKeys = {};
    if (user.llmPreferences?.apiKey) {
      userApiKeys[user.llmPreferences.provider] = decryptApiKey(user.llmPreferences.apiKey);
    }
    
    // Process with each model
    const results = {};
    const errors = {};
    
    await Promise.all(models.map(async (modelConfig) => {
      try {
        const { provider, model } = modelConfig;
        
        // Validate provider and model
        const availableProviders = llmService.getAvailableProviders();
        const providerExists = availableProviders.some(p => p.id === provider);
        
        if (!providerExists) {
          errors[`${provider}-${model}`] = 'Unsupported provider';
          return;
        }
        
        const availableModels = llmService.getAvailableModels(provider);
        if (!availableModels.includes(model)) {
          errors[`${provider}-${model}`] = 'Unsupported model';
          return;
        }
        
        // Get API key - try user's key first, then fallback to system key
        let apiKey = userApiKeys[provider] || config.llmApiKeys[provider];
        
        if (!apiKey) {
          errors[`${provider}-${model}`] = 'No API key available';
          return;
        }
        
        // Generate response
        const startTime = Date.now();
        const response = await llmService.generateResponse([{role: 'user', content: message}], { model, apiKey }, provider);
        const responseTime = Date.now() - startTime;
        
        results[`${provider}-${model}`] = {
          response,
          responseTime,
          provider,
          model
        };
        
        // Log performance for comparison
        logger.info({
          type: 'llm_comparison',
          provider,
          model,
          responseTime,
          userId,
          chars: message.length,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error(`Error in model comparison for ${modelConfig.provider}-${modelConfig.model}: ${error.message}`);
        errors[`${modelConfig.provider}-${modelConfig.model}`] = error.message;
      }
    }));
    
    return res.status(200).json({
      success: true,
      data: {
        results,
        errors: Object.keys(errors).length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    logger.error(`Error comparing LLM models: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare LLM models'
    });
  }
};

/**
 * Send message to LLM provider with streaming response
 * This endpoint supports SSE (Server-Sent Events) for real-time streaming responses
 */
exports.streamMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // Get user's LLM preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Use user's preferences or defaults
    const provider = user.llmPreferences?.provider || config.defaultLLMProvider;
    const model = user.llmPreferences?.model || config.defaultLLMModel;
    
    // Get API key - try user's key first, then fallback to system key
    let apiKey = null;
    if (user.llmPreferences?.apiKey) {
      apiKey = decryptApiKey(user.llmPreferences.apiKey);
    }
    
    if (!apiKey) {
      apiKey = config.llmApiKeys[provider];
    }
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'No API key available for selected provider'
      });
    }
    
    // Store the request in global service to be processed when SSE connection is established
    // Use a random ID for the request
    const requestId = crypto.randomBytes(16).toString('hex');
    
    // Store message details in a global storage
    if (!global.streamRequestsStorage) {
      global.streamRequestsStorage = new Map();
    }
    
    global.streamRequestsStorage.set(userId, {
      requestId,
      message,
      provider,
      model,
      apiKey,
      context,
      timestamp: Date.now()
    });
    
    // Successful response
    return res.status(200).json({
      success: true,
      message: 'Streaming request initiated',
      requestId
    });
    
  } catch (error) {
    logger.error(`Error preparing streaming request: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to prepare streaming request'
    });
  }
};

/**
 * Process streaming request when SSE connection is established
 * To be called from the stream-events endpoint
 */
exports.processStreamingRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if there's a pending request for this user
    if (!global.streamRequestsStorage || !global.streamRequestsStorage.has(userId)) {
      res.write(`data: ${JSON.stringify({ error: 'No pending streaming request found' })}\n\n`);
      return;
    }
    
    // Get the request data
    const requestData = global.streamRequestsStorage.get(userId);
    global.streamRequestsStorage.delete(userId); // Remove to prevent reprocessing
    
    // Extract request data
    const { message, provider, model, apiKey, context } = requestData;
    
    // Start time for performance tracking
    const startTime = Date.now();
    
    // Setup callback for handling stream chunks
    const onChunk = (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    };
    
    // Setup callback for stream end
    const onComplete = (fullResponse, metadata) => {
      // Log performance metrics
      const responseTime = Date.now() - startTime;
      logger.info({
        type: 'llm_streaming_performance',
        provider,
        model,
        responseTime,
        userId,
        chars: message.length,
        timestamp: new Date()
      });
      
      // Store the message in database
      try {
        // Create user message
        const userMessage = new Message({
          userId,
          role: 'user',
          content: message,
          timestamp: new Date()
        });
        
        // Create assistant message
        const assistantMessage = new Message({
          userId,
          role: 'assistant',
          content: fullResponse,
          metadata: {
            provider: metadata.provider,
            model: metadata.model,
            responseTime
          },
          timestamp: new Date()
        });
        
        // Save messages
        Promise.all([userMessage.save(), assistantMessage.save()])
          .catch(error => logger.error(`Error saving stream messages: ${error.message}`));
        
      } catch (error) {
        logger.error(`Error processing stream completion: ${error.message}`);
      }
      
      // Send final message with completion signal
      res.write(`data: ${JSON.stringify({ done: true, metadata })}\n\n`);
    };
    
    // Handle errors in the stream
    const onError = (error) => {
      logger.error(`Streaming error: ${error.message}`);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    };
    
    // Process streaming message
    await llmService.generateStreamingResponse(
      [{ role: 'user', content: message }],
      { model, apiKey, userId },
      provider,
      onChunk,
      onComplete,
      onError
    );
    
  } catch (error) {
    logger.error(`Error in stream processing: ${error.message}`);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  }
}; 