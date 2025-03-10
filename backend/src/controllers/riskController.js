const { PublicKey } = require('@solana/web3.js');
const riskScoringService = require('../services/riskScoringService');
const solanaService = require('../services/solanaService');
const logger = require('../utils/logger');

/**
 * Analyze token risk
 * @route POST /api/risk/token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const analyzeTokenRisk = async (req, res, next) => {
  try {
    const { tokenAddress } = req.body;
    
    // Validate token address
    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        error: 'Token address is required'
      });
    }
    
    // Validate Solana address format
    try {
      new PublicKey(tokenAddress);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana token address format'
      });
    }
    
    logger.info(`Analyzing risk for token: ${tokenAddress}`);
    
    // Calculate risk score
    const riskAnalysis = await riskScoringService.calculateRiskScore(tokenAddress);
    
    res.json({
      success: true,
      data: riskAnalysis
    });
  } catch (error) {
    logger.error(`Error analyzing token risk: ${error.message}`);
    next(error);
  }
};

/**
 * Get risk factors
 * @route GET /api/risk/factors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRiskFactors = async (req, res, next) => {
  try {
    // Get risk factors from service
    const riskFactors = riskScoringService.riskFactors;
    
    // Format risk factors for response
    const formattedFactors = Object.entries(riskFactors).map(([key, weight]) => ({
      id: key,
      name: formatFactorName(key),
      weight,
      description: getFactorDescription(key)
    }));
    
    res.json({
      success: true,
      data: {
        factors: formattedFactors
      }
    });
  } catch (error) {
    logger.error(`Error fetching risk factors: ${error.message}`);
    next(error);
  }
};

/**
 * Compare token risks
 * @route POST /api/risk/compare
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const compareTokenRisks = async (req, res, next) => {
  try {
    const { tokenAddresses } = req.body;
    
    // Validate token addresses
    if (!tokenAddresses || !Array.isArray(tokenAddresses) || tokenAddresses.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least two valid token addresses are required for comparison'
      });
    }
    
    // Limit the number of tokens to compare
    if (tokenAddresses.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 tokens can be compared at once'
      });
    }
    
    // Validate each address
    for (const address of tokenAddresses) {
      try {
        new PublicKey(address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `Invalid Solana token address format: ${address}`
        });
      }
    }
    
    logger.info(`Comparing risks for tokens: ${tokenAddresses.join(', ')}`);
    
    // Calculate risk scores for all tokens
    const riskAnalyses = await Promise.all(
      tokenAddresses.map(address => riskScoringService.calculateRiskScore(address))
    );
    
    // Format comparison data
    const comparison = {
      tokens: riskAnalyses.map(analysis => ({
        address: analysis.tokenAddress,
        overallScore: analysis.overallScore,
        riskCategory: analysis.riskCategory
      })),
      factorComparison: {}
    };
    
    // Compare each risk factor across tokens
    Object.keys(riskScoringService.riskFactors).forEach(factor => {
      comparison.factorComparison[factor] = riskAnalyses.map(analysis => ({
        address: analysis.tokenAddress,
        score: analysis.factors[factor].score,
        details: analysis.factors[factor].details
      }));
    });
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    logger.error(`Error comparing token risks: ${error.message}`);
    next(error);
  }
};

/**
 * Get historical risk data for a token
 * @route GET /api/risk/history/:tokenAddress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getHistoricalRisk = async (req, res, next) => {
  try {
    const { tokenAddress } = req.params;
    const { days = 30 } = req.query;
    
    // Validate token address
    try {
      new PublicKey(tokenAddress);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana token address format'
      });
    }
    
    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        error: 'Days parameter must be a number between 1 and 365'
      });
    }
    
    logger.info(`Fetching historical risk data for token: ${tokenAddress}, days: ${daysNum}`);
    
    // In a real implementation, this would fetch historical data from a database
    // For now, we'll generate simulated historical data
    const historicalData = generateHistoricalRiskData(tokenAddress, daysNum);
    
    res.json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    logger.error(`Error fetching historical risk data: ${error.message}`);
    next(error);
  }
};

/**
 * Generate simulated historical risk data
 * @param {string} tokenAddress - Token address
 * @param {number} days - Number of days of historical data
 * @returns {Object} Historical risk data
 */
const generateHistoricalRiskData = (tokenAddress, days) => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Generate daily data points
  const dataPoints = [];
  let baseScore = 40 + Math.random() * 30; // Start with a random base score between 40-70
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - (i * dayMs));
    
    // Add some random variation to the score
    const dailyVariation = (Math.random() * 10) - 5; // -5 to +5
    baseScore = Math.max(10, Math.min(90, baseScore + dailyVariation));
    
    dataPoints.push({
      date: date.toISOString().split('T')[0],
      overallScore: Math.round(baseScore),
      liquidityScore: Math.round(baseScore + (Math.random() * 20 - 10)),
      codeQualityScore: Math.round(baseScore + (Math.random() * 20 - 10)),
      socialSentimentScore: Math.round(baseScore + (Math.random() * 20 - 10))
    });
  }
  
  return {
    tokenAddress,
    period: `${days} days`,
    dataPoints
  };
};

/**
 * Format risk factor name for display
 * @param {string} factor - Risk factor key
 * @returns {string} Formatted factor name
 */
const formatFactorName = (factor) => {
  // Convert camelCase to Title Case with spaces
  return factor
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

/**
 * Get description for a risk factor
 * @param {string} factor - Risk factor key
 * @returns {string} Factor description
 */
const getFactorDescription = (factor) => {
  const descriptions = {
    liquidity: 'Measures the ease with which a token can be bought or sold without causing a significant price change.',
    codeQuality: 'Evaluates the security, efficiency, and maintainability of the token\'s smart contract code.',
    teamTransparency: 'Assesses the openness and accountability of the project team behind the token.',
    tokenDistribution: 'Examines how widely the token is distributed among holders and whether there is concentration risk.',
    marketVolatility: 'Measures the degree of variation in the token\'s price over time.',
    socialSentiment: 'Analyzes the perception and discussion of the token across social media and community channels.',
    auditStatus: 'Evaluates whether the token\'s code has been professionally audited and the results of those audits.'
  };
  
  return descriptions[factor] || 'No description available';
};

module.exports = {
  analyzeTokenRisk,
  getRiskFactors,
  compareTokenRisks,
  getHistoricalRisk
}; 