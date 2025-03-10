const Message = require('../models/Message');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Send a message to the AI assistant
 * @route POST /api/chat/message
 * @access Private
 */
const sendMessage = async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const user = req.user;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message to database
    const userMessage = await Message.create({
      user: user._id,
      role: 'user',
      message,
      context,
    });

    // In a real implementation, this would call an AI service
    // For now, we'll simulate a response
    const responses = [
      "I've analyzed the recent price action for SOL and noticed a bullish divergence on the 4-hour chart. This could indicate a potential reversal.",
      "Based on on-chain data, there's been an increase in whale accumulation over the past 48 hours. This is often a positive signal.",
      "Looking at the Jupiter liquidity pools, I can see that SOL/USDC has deepened by 15% since yesterday, which should reduce slippage for larger trades.",
      "I've detected a new token launch that matches your risk profile. Would you like me to analyze its contract for potential security issues?",
      "The strategy you described would have yielded approximately 12.3% over the past month, outperforming a simple buy-and-hold approach by 3.7%."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Save AI response to database
    const aiMessage = await Message.create({
      user: user._id,
      role: 'assistant',
      message: randomResponse,
      context,
    });

    res.json({
      id: aiMessage._id,
      message: aiMessage.message,
      timestamp: aiMessage.timestamp,
    });
  } catch (error) {
    logger.error(`Send message error: ${error.message}`);
    res.status(500).json({ error: 'Server error while processing message' });
  }
};

/**
 * Get chat history
 * @route GET /api/chat/history
 * @access Private
 */
const getHistory = async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 50;
    
    // Get messages for this user, sorted by timestamp
    const messages = await Message.find({ user: user._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse().map(msg => ({
      id: msg._id,
      role: msg.role,
      message: msg.message,
      timestamp: msg.timestamp,
    }));

    res.json({
      messages: chronologicalMessages,
    });
  } catch (error) {
    logger.error(`Get chat history error: ${error.message}`);
    res.status(500).json({ error: 'Server error while fetching chat history' });
  }
};

/**
 * Clear chat history
 * @route DELETE /api/chat/history
 * @access Private
 */
const clearHistory = async (req, res) => {
  try {
    const user = req.user;
    
    // Delete all messages for this user
    await Message.deleteMany({ user: user._id });
    
    // Add a system message indicating history was cleared
    await Message.create({
      user: user._id,
      role: 'assistant',
      message: 'Chat history cleared. How can I help you today?',
    });

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    logger.error(`Clear chat history error: ${error.message}`);
    res.status(500).json({ error: 'Server error while clearing chat history' });
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory,
}; 