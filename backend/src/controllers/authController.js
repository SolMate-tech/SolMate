const nacl = require('tweetnacl');
const bs58 = require('bs58');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Verify wallet signature and authenticate user
 * @route POST /api/auth/verify-wallet
 * @access Public
 */
const verifyWallet = async (req, res) => {
  try {
    const { publicKey, signature, message } = req.body;

    if (!publicKey || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert signature from base64 to Uint8Array
    const signatureUint8 = Buffer.from(signature, 'base64');
    
    // Convert message to Uint8Array
    const messageUint8 = new TextEncoder().encode(message);
    
    // Convert public key from string to Uint8Array
    const publicKeyUint8 = bs58.decode(publicKey);

    // Verify signature
    const isValid = nacl.sign.detached.verify(
      messageUint8,
      signatureUint8,
      publicKeyUint8
    );

    if (!isValid) {
      logger.warn(`Invalid signature for public key: ${publicKey}`);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await User.findOne({ publicKey });

    if (!user) {
      user = await User.create({
        publicKey,
        username: `User_${publicKey.substring(0, 6)}`,
      });
      logger.info(`New user created: ${user._id}`);
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        publicKey: user.publicKey,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    logger.error(`Wallet verification error: ${error.message}`);
    res.status(500).json({ error: 'Server error during wallet verification' });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/user
 * @access Private
 */
const getUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      publicKey: user.publicKey,
      username: user.username,
      email: user.email,
      preferences: user.preferences,
      privacy: user.privacy,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({ error: 'Server error while fetching user data' });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/user
 * @access Private
 */
const updateUser = async (req, res) => {
  try {
    const { username, email, preferences, privacy } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (preferences) {
      // Only update provided preference fields
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }
    if (privacy) {
      // Only update provided privacy fields
      user.privacy = {
        ...user.privacy,
        ...privacy,
      };
    }

    await user.save();

    res.json({
      publicKey: user.publicKey,
      username: user.username,
      email: user.email,
      preferences: user.preferences,
      privacy: user.privacy,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(500).json({ error: 'Server error while updating user data' });
  }
};

module.exports = {
  verifyWallet,
  getUser,
  updateUser,
}; 