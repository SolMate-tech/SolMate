const express = require('express');
const router = express.Router();
const { 
  analyzeTokenRisk, 
  getRiskFactors, 
  compareTokenRisks, 
  getHistoricalRisk 
} = require('../controllers/riskController');
const { protect, optionalAuth } = require('../middlewares/auth');

/**
 * @route POST /api/risk/token
 * @desc Analyze risk for a specific token
 * @access Private
 */
router.post('/token', protect, analyzeTokenRisk);

/**
 * @route GET /api/risk/factors
 * @desc Get all risk factors used in analysis
 * @access Public
 */
router.get('/factors', getRiskFactors);

/**
 * @route POST /api/risk/compare
 * @desc Compare risks between multiple tokens
 * @access Private
 */
router.post('/compare', protect, compareTokenRisks);

/**
 * @route GET /api/risk/history/:tokenAddress
 * @desc Get historical risk data for a token
 * @access Private
 */
router.get('/history/:tokenAddress', protect, getHistoricalRisk);

module.exports = router; 