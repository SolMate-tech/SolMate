const express = require('express');
const router = express.Router();
const riskAnalysisController = require('../controllers/riskAnalysis.controller');

/**
 * @route POST /api/risk-analysis/token
 * @description Analyze risk for a specific token
 * @access Public
 */
router.post('/token', riskAnalysisController.analyzeTokenRisk);

/**
 * @route GET /api/risk-analysis/token/:address
 * @description Get stored risk analysis for a token
 * @access Public
 */
router.get('/token/:address', riskAnalysisController.getTokenRiskAnalysis);

/**
 * @route GET /api/risk-analysis/factors
 * @description Get all risk factors used in analysis
 * @access Public
 */
router.get('/factors', riskAnalysisController.getRiskFactors);

/**
 * @route GET /api/risk-analysis/token/:address/liquidity
 * @description Get detailed liquidity analysis for a token
 * @access Public
 */
router.get('/token/:address/liquidity', riskAnalysisController.getLiquidityAnalysis);

/**
 * @route GET /api/risk-analysis/token/:address/code
 * @description Get code quality and security analysis for a token
 * @access Public
 */
router.get('/token/:address/code', riskAnalysisController.getCodeAnalysis);

/**
 * @route GET /api/risk-analysis/token/:address/concentration
 * @description Get holder concentration analysis for a token
 * @access Public
 */
router.get('/token/:address/concentration', riskAnalysisController.getConcentrationAnalysis);

module.exports = router; 