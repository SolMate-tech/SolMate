const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

/**
 * @route POST /api/chat/message
 * @desc Send a message to the AI assistant
 * @access Private
 */
router.post('/message', protect, sendMessage);

/**
 * @route GET /api/chat/history
 * @desc Get chat history
 * @access Private
 */
router.get('/history', protect, getHistory);

/**
 * @route DELETE /api/chat/history
 * @desc Clear chat history
 * @access Private
 */
router.delete('/history', protect, clearHistory);

module.exports = router;
