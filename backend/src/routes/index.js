const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const analyticsRoutes = require('./analytics');
const chatRoutes = require('./chat');
const strategiesRoutes = require('./strategies');
const tokenRoutes = require('./tokens');

// Register routes
router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/chat', chatRoutes);
router.use('/strategies', strategiesRoutes);
router.use('/tokens', tokenRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'SolMate API',
    version: '0.1.0',
    description: 'Solana-Focused AI Trading Assistant API',
  });
});

module.exports = router; 