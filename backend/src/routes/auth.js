const express = require('express');
const router = express.Router();
const { verifyWallet, getUser, updateUser } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

/**
 * @route POST /api/auth/verify-wallet
 * @desc Verify wallet signature
 * @access Public
 */
router.post('/verify-wallet', verifyWallet);

/**
 * @route GET /api/auth/user
 * @desc Get user profile
 * @access Private
 */
router.get('/user', protect, getUser);

/**
 * @route PUT /api/auth/user
 * @desc Update user profile
 * @access Private
 */
router.put('/user', protect, updateUser);

module.exports = router;
