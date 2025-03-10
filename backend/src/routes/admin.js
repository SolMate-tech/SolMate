const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getSystemStats, clearCache } = require('../controllers/adminController');

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics for monitoring
 * @access  Admin only
 */
router.get('/stats', protect, adminOnly, getSystemStats);

/**
 * @route   POST /api/admin/cache/clear
 * @desc    Clear the LLM response cache
 * @access  Admin only
 */
router.post('/cache/clear', protect, adminOnly, clearCache);

module.exports = router; 