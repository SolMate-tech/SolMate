const express = require('express');
const router = express.Router();
const aiConversationController = require('../controllers/aiConversation.controller');

/**
 * @route POST /api/ai-conversation/message
 * @description Send a message to the AI assistant and get a response
 * @access Public
 */
router.post('/message', aiConversationController.sendMessage);

/**
 * @route POST /api/ai-conversation/sessions
 * @description Create a new conversation session
 * @access Public
 */
router.post('/sessions', aiConversationController.createSession);

/**
 * @route GET /api/ai-conversation/sessions/:sessionId
 * @description Get conversation history for a specific session
 * @access Public
 */
router.get('/sessions/:sessionId', aiConversationController.getSessionHistory);

/**
 * @route DELETE /api/ai-conversation/sessions/:sessionId
 * @description Delete a conversation session
 * @access Public
 */
router.delete('/sessions/:sessionId', aiConversationController.deleteSession);

/**
 * @route POST /api/ai-conversation/analyze-image
 * @description Send an image for analysis by the AI
 * @access Public
 */
router.post('/analyze-image', aiConversationController.analyzeImage);

/**
 * @route POST /api/ai-conversation/token-strategy
 * @description Generate a trading strategy recommendation for a token
 * @access Public
 */
router.post('/token-strategy', aiConversationController.generateTokenStrategy);

module.exports = router; 