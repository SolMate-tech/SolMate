const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');

/**
 * @route GET /api/tokens
 * @description Get list of popular SPL tokens
 * @access Public
 */
router.get('/', tokenController.getPopularTokens);

/**
 * @route GET /api/tokens/:address
 * @description Get detailed information about a specific token
 * @access Public
 */
router.get('/:address', tokenController.getTokenInfo);

/**
 * @route GET /api/tokens/:address/price
 * @description Get current price and 24h change for a token
 * @access Public
 */
router.get('/:address/price', tokenController.getTokenPrice);

/**
 * @route GET /api/tokens/:address/historical-price
 * @description Get historical price data for a token
 * @access Public
 */
router.get('/:address/historical-price', tokenController.getHistoricalPriceData);

/**
 * @route GET /api/tokens/:address/holders
 * @description Get information about token holders
 * @access Public
 */
router.get('/:address/holders', tokenController.getTokenHolders);

/**
 * @route GET /api/tokens/search
 * @description Search for tokens by name or symbol
 * @access Public
 */
router.get('/search', tokenController.searchTokens);

module.exports = router; 