const logger = require('../utils/logger');
const { LLMService } = require('../services/llmService');
const cacheService = require('../services/cacheService');
const User = require('../models/User');
const Message = require('../models/Message');

const llmService = new LLMService();

/**
 * Get system stats for monitoring
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSystemStats = async (req, res) => {
  try {
    // LLM service metrics
    const llmMetrics = llmService.getMetrics();
    
    // Cache stats
    const cacheStats = cacheService.getStats();
    
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsersLast24h = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Message stats
    const totalMessages = await Message.countDocuments();
    const messagesLast24h = await Message.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Provider usage - which providers are most used
    const providerUsage = await Message.aggregate([
      {
        $match: {
          role: 'assistant',
          'metadata.provider': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$metadata.provider',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Model usage - which models are most used
    const modelUsage = await Message.aggregate([
      {
        $match: {
          role: 'assistant',
          'metadata.model': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$metadata.model',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        llm: {
          ...llmMetrics,
          cacheHitRate: llmMetrics.totalCalls > 0 
            ? (llmMetrics.cacheHits / llmMetrics.totalCalls * 100).toFixed(2) + '%' 
            : '0%',
          errorRate: llmMetrics.totalCalls > 0 
            ? (llmMetrics.errors / llmMetrics.totalCalls * 100).toFixed(2) + '%' 
            : '0%'
        },
        cache: cacheStats,
        users: {
          total: totalUsers,
          activeLastDay: activeUsersLast24h
        },
        messages: {
          total: totalMessages,
          lastDay: messagesLast24h,
          providerUsage,
          modelUsage
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting system stats: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system stats'
    });
  }
};

/**
 * Clear the LLM response cache
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.clearCache = async (req, res) => {
  try {
    cacheService.clear();
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    logger.error(`Error clearing cache: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
}; 