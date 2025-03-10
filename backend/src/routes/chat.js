const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getHistory, 
  clearHistory,
  getLLMProviders,
  setPreferredLLMProvider
} = require('../controllers/chatController');
const { protect, optionalAuth } = require('../middlewares/auth');

/**
 * @route POST /api/chat/message
 * @desc Send a message to the AI assistant
 * @access Private
 */
router.post('/message', protect, sendMessage);

/**
 * @route GET /api/chat/history
 * @desc Get chat history for user
 * @access Private
 */
router.get('/history', protect, getHistory);

/**
 * @route DELETE /api/chat/history
 * @desc Clear chat history for user
 * @access Private
 */
router.delete('/history', protect, clearHistory);

/**
 * @route GET /api/chat/llm-providers
 * @desc Get available LLM providers and models
 * @access Private
 */
router.get('/llm-providers', protect, getLLMProviders);

/**
 * @route PUT /api/chat/llm-provider
 * @desc Set preferred LLM provider for user
 * @access Private
 */
router.put('/llm-provider', protect, setPreferredLLMProvider);

module.exports = router;
