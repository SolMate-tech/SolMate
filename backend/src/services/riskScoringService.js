const logger = require('../utils/logger');
const solanaService = require('./solanaService');

/**
 * RiskScoringService provides methods for assessing token risk
 */
class RiskScoringService {
  constructor() {
    // Risk factor weights (out of 100)
    this.riskFactors = {
      liquidity: 25,
      codeQuality: 20,
      teamTransparency: 15,
      tokenDistribution: 15,
      marketVolatility: 10,
      socialSentiment: 10,
      auditStatus: 5
    };
    
    logger.info('Risk scoring service initialized');
  }

  /**
   * Calculate overall risk score for a token
   * @param {string} tokenAddress - Token mint address
   * @returns {Promise<Object>} Risk assessment results
   */
  async calculateRiskScore(tokenAddress) {
    try {
      logger.info(`Calculating risk score for token: ${tokenAddress}`);
      
      // Gather token data
      const tokenData = await this.gatherTokenData(tokenAddress);
      
      // Calculate individual risk scores
      const liquidityScore = await this.assessLiquidityRisk(tokenData);
      const codeQualityScore = await this.assessCodeQuality(tokenData);
      const teamScore = await this.assessTeamTransparency(tokenData);
      const distributionScore = await this.assessTokenDistribution(tokenData);
      const volatilityScore = await this.assessMarketVolatility(tokenData);
      const sentimentScore = await this.assessSocialSentiment(tokenData);
      const auditScore = await this.assessAuditStatus(tokenData);
      
      // Calculate weighted average risk score (0-100, lower is better)
      const overallScore = (
        (liquidityScore * this.riskFactors.liquidity) +
        (codeQualityScore * this.riskFactors.codeQuality) +
        (teamScore * this.riskFactors.teamTransparency) +
        (distributionScore * this.riskFactors.tokenDistribution) +
        (volatilityScore * this.riskFactors.marketVolatility) +
        (sentimentScore * this.riskFactors.socialSentiment) +
        (auditScore * this.riskFactors.auditStatus)
      ) / 100;
      
      // Determine risk category
      let riskCategory;
      if (overallScore < 20) {
        riskCategory = 'Very Low Risk';
      } else if (overallScore < 40) {
        riskCategory = 'Low Risk';
      } else if (overallScore < 60) {
        riskCategory = 'Moderate Risk';
      } else if (overallScore < 80) {
        riskCategory = 'High Risk';
      } else {
        riskCategory = 'Very High Risk';
      }
      
      return {
        tokenAddress,
        overallScore: Math.round(overallScore),
        riskCategory,
        factors: {
          liquidity: {
            score: liquidityScore,
            weight: this.riskFactors.liquidity,
            details: tokenData.liquidityDetails
          },
          codeQuality: {
            score: codeQualityScore,
            weight: this.riskFactors.codeQuality,
            details: tokenData.codeDetails
          },
          teamTransparency: {
            score: teamScore,
            weight: this.riskFactors.teamTransparency,
            details: tokenData.teamDetails
          },
          tokenDistribution: {
            score: distributionScore,
            weight: this.riskFactors.tokenDistribution,
            details: tokenData.distributionDetails
          },
          marketVolatility: {
            score: volatilityScore,
            weight: this.riskFactors.marketVolatility,
            details: tokenData.volatilityDetails
          },
          socialSentiment: {
            score: sentimentScore,
            weight: this.riskFactors.socialSentiment,
            details: tokenData.sentimentDetails
          },
          auditStatus: {
            score: auditScore,
            weight: this.riskFactors.auditStatus,
            details: tokenData.auditDetails
          }
        },
        recommendations: this.generateRecommendations(overallScore, tokenData)
      };
    } catch (error) {
      logger.error(`Error calculating risk score for ${tokenAddress}: ${error.message}`);
      throw new Error(`Failed to calculate risk score: ${error.message}`);
    }
  }

  /**
   * Gather token data for risk assessment
   * @param {string} tokenAddress - Token mint address
   * @returns {Promise<Object>} Token data
   */
  async gatherTokenData(tokenAddress) {
    try {
      // In a production environment, this would gather real data from various sources
      // For now, we'll use simulated data for demonstration
      
      // Basic token info
      const tokenInfo = {
        address: tokenAddress,
        name: `Token_${tokenAddress.substring(0, 6)}`,
        symbol: `TKN${tokenAddress.substring(0, 3)}`,
        decimals: 9,
        totalSupply: 1000000000,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      };
      
      // Simulated liquidity data
      const liquidityDetails = {
        totalLiquidity: Math.random() * 10000000,
        liquidityDepth: Math.random() * 100,
        slippageImpact: Math.random() * 10,
        liquidityProviders: Math.floor(Math.random() * 1000),
        largestPoolShare: Math.random() * 50
      };
      
      // Simulated code quality data
      const codeDetails = {
        isVerified: Math.random() > 0.3,
        hasOpenSource: Math.random() > 0.4,
        complexityScore: Math.random() * 100,
        securityIssues: Math.floor(Math.random() * 10),
        lastCodeUpdate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
      };
      
      // Simulated team data
      const teamDetails = {
        isDoxxed: Math.random() > 0.5,
        socialPresence: Math.random() * 100,
        communitySize: Math.floor(Math.random() * 50000),
        projectAge: Math.floor(Math.random() * 36), // months
        previousProjects: Math.floor(Math.random() * 5)
      };
      
      // Simulated distribution data
      const distributionDetails = {
        topHoldersConcentration: Math.random() * 80,
        teamAllocation: Math.random() * 30,
        circulatingSupply: Math.random() * 80, // percentage
        unlockSchedule: Math.random() > 0.5,
        vestingPeriod: Math.floor(Math.random() * 36) // months
      };
      
      // Simulated volatility data
      const volatilityDetails = {
        dailyVolatility: Math.random() * 20,
        weeklyPriceChange: (Math.random() * 40) - 20, // -20% to +20%
        monthlyPriceChange: (Math.random() * 80) - 40, // -40% to +40%
        correlationWithSOL: Math.random(),
        averageDailyVolume: Math.random() * 5000000
      };
      
      // Simulated sentiment data
      const sentimentDetails = {
        socialScore: Math.random() * 100,
        communityGrowth: (Math.random() * 30) - 5, // -5% to +25%
        developerActivity: Math.random() * 100,
        newsImpact: Math.random() * 100,
        influencerMentions: Math.floor(Math.random() * 50)
      };
      
      // Simulated audit data
      const auditDetails = {
        hasAudit: Math.random() > 0.6,
        auditFirms: Math.random() > 0.6 ? ['Certik', 'Hacken', 'SlowMist'].slice(0, Math.floor(Math.random() * 3) + 1) : [],
        auditDate: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) : null,
        criticalIssues: Math.floor(Math.random() * 3),
        resolvedIssues: Math.random() > 0.7
      };
      
      return {
        tokenInfo,
        liquidityDetails,
        codeDetails,
        teamDetails,
        distributionDetails,
        volatilityDetails,
        sentimentDetails,
        auditDetails
      };
    } catch (error) {
      logger.error(`Error gathering token data for ${tokenAddress}: ${error.message}`);
      throw new Error(`Failed to gather token data: ${error.message}`);
    }
  }

  /**
   * Assess liquidity risk
   * @param {Object} tokenData - Token data
   * @returns {number} Risk score (0-100, lower is better)
   */
  async assessLiquidityRisk(tokenData) {
    const { liquidityDetails } = tokenData;
    
    // Higher liquidity = lower risk
    let score = 100 - (liquidityDetails.liquidityDepth);
    
    // Adjust for slippage impact (higher slippage = higher risk)
    score += liquidityDetails.slippageImpact * 5;
    
    // Adjust for liquidity provider count (more providers = lower risk)
    score -= Math.min(20, liquidityDetails.liquidityProviders / 50);
    
    // Adjust for largest pool share (higher concentration = higher risk)
    score += liquidityDetails.largestPoolShare / 2;
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess code quality risk
   * @param {Object} tokenData - Token data
   * @returns {number} Risk score (0-100, lower is better)
   */
  async assessCodeQuality(tokenData) {
    const { codeDetails } = tokenData;
    
    // Start with a baseline score
    let score = 50;
    
    // Verified code reduces risk
    if (codeDetails.isVerified) {
      score -= 20;
    }
    
    // Open source code reduces risk
    if (codeDetails.hasOpenSource) {
      score -= 15;
    }
    
    // Higher complexity = higher risk
    score += (codeDetails.complexityScore / 5);
    
    // Security issues increase risk
    score += (codeDetails.securityIssues * 10);
    
    // Recent code updates reduce risk
    const daysSinceUpdate = (Date.now() - codeDetails.lastCodeUpdate) / (24 * 60 * 60 * 1000);
    score += Math.min(20, daysSinceUpdate / 30);
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess team transparency risk
   * @param {Object} tokenData - Token data
   * @returns {number} Risk score (0-100, lower is better)
   */
  async assessTeamTransparency(tokenData) {
    const { teamDetails } = tokenData;
    
    // Start with a baseline score
    let score = 70;
    
    // Doxxed team reduces risk
    if (teamDetails.isDoxxed) {
      score -= 30;
    }
    
    // Higher social presence reduces risk
    score -= (teamDetails.socialPresence / 5);
    
    // Larger community reduces risk
    score -= Math.min(15, teamDetails.communitySize / 5000);
    
    // Older projects reduce risk
    score -= Math.min(15, teamDetails.projectAge / 2);
    
    // Previous projects reduce risk
    score -= (teamDetails.previousProjects * 3);
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess token distribution risk
   * @param {Object} tokenData - Token data
   * @returns {number} Risk score (0-100, lower is better)
   */
  async assessTokenDistribution(tokenData) {
    const { distributionDetails } = tokenData;
    
    // Start with a baseline score
    let score = 40;
    
    // Higher top holder concentration increases risk
    score += (distributionDetails.topHoldersConcentration / 2);
    
    // Higher team allocation increases risk
    score += (distributionDetails.teamAllocation * 2);
    
    // Lower circulating supply increases risk
    score += (100 - distributionDetails.circulatingSupply) / 2;
    
    // No unlock schedule increases risk
    if (!distributionDetails.unlockSchedule) {
      score += 15;
    }
    
    // Shorter vesting period increases risk
    score += Math.max(0, 20 - distributionDetails.vestingPeriod / 2);
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess market volatility risk
   * @param {Object} tokenData - Token data
   * @returns {number} Risk score (0-100, lower is better)
   */
  async assessMarketVolatility(tokenData) {
    const { volatilityDetails } = tokenData;
    
    // Start with a baseline score
    let score = 30;
    
    // Higher daily volatility increases risk
    score += (volatilityDetails.dailyVolatility * 3);
    
    // Extreme price changes increase risk
    score += Math.abs(volatilityDetails.weeklyPriceChange) * 1.5;
    score += Math.abs(volatilityDetails.monthlyPriceChange) * 0.5;
    
    // Lower correlation with SOL increases risk (assuming SOL is more stable)
    score += (1 - volatilityDetails.correlationWithSOL) * 10;
    
    // Lower volume increases risk
    score += Math.max(0, 20 - (volatilityDetails.averageDailyVolume / 500000));
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess social sentiment risk
   * @param {Object} tokenData - Token data
   * @returns {number} Risk score (0-100, lower is better)
   */
  async assessSocialSentiment(tokenData) {
    const { sentimentDetails } = tokenData;
    
    // Start with a baseline score
    let score = 50;
    
    // Higher social score reduces risk
    score -= (sentimentDetails.socialScore / 2);
    
    // Positive community growth reduces risk
    score -= sentimentDetails.communityGrowth * 2;
    
    // Higher developer activity reduces risk
    score -= (sentimentDetails.developerActivity / 5);
    
    // Higher news impact can reduce risk
    score -= (sentimentDetails.newsImpact / 5);
    
    // More influencer mentions can reduce risk
    score -= Math.min(15, sentimentDetails.influencerMentions / 5);
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess audit status risk
   * @param {Object} tokenData - Token data
   * @returns {number} Risk score (0-100, lower is better)
   */
  async assessAuditStatus(tokenData) {
    const { auditDetails } = tokenData;
    
    // Start with a baseline score
    let score = 80;
    
    // Having an audit reduces risk
    if (auditDetails.hasAudit) {
      score -= 40;
      
      // Multiple audit firms further reduce risk
      score -= (auditDetails.auditFirms.length * 10);
      
      // Recent audit reduces risk
      if (auditDetails.auditDate) {
        const daysSinceAudit = (Date.now() - auditDetails.auditDate) / (24 * 60 * 60 * 1000);
        score += Math.min(30, daysSinceAudit / 30);
      }
      
      // Critical issues increase risk
      score += (auditDetails.criticalIssues * 15);
      
      // Resolved issues reduce risk
      if (auditDetails.resolvedIssues) {
        score -= 15;
      }
    }
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations based on risk assessment
   * @param {number} overallScore - Overall risk score
   * @param {Object} tokenData - Token data
   * @returns {Array<string>} List of recommendations
   */
  generateRecommendations(overallScore, tokenData) {
    const recommendations = [];
    
    // General recommendation based on overall risk
    if (overallScore < 30) {
      recommendations.push('This token appears to have a relatively low risk profile.');
    } else if (overallScore < 60) {
      recommendations.push('This token has a moderate risk profile. Consider diversifying your exposure.');
    } else {
      recommendations.push('This token has a high risk profile. Exercise caution and consider limiting your exposure.');
    }
    
    // Liquidity recommendations
    if (tokenData.liquidityDetails.liquidityDepth < 50) {
      recommendations.push('Limited liquidity depth may lead to higher slippage. Consider using smaller trade sizes.');
    }
    if (tokenData.liquidityDetails.largestPoolShare > 30) {
      recommendations.push('High concentration of liquidity in a single pool increases vulnerability to liquidity removal events.');
    }
    
    // Code quality recommendations
    if (!tokenData.codeDetails.isVerified) {
      recommendations.push('The token contract is not verified, which limits transparency and increases risk.');
    }
    if (tokenData.codeDetails.securityIssues > 3) {
      recommendations.push('Multiple security issues have been identified in the code. Review audit reports carefully.');
    }
    
    // Team recommendations
    if (!tokenData.teamDetails.isDoxxed) {
      recommendations.push('The team is anonymous, which may increase accountability risk.');
    }
    
    // Distribution recommendations
    if (tokenData.distributionDetails.topHoldersConcentration > 50) {
      recommendations.push('High token concentration among top holders increases potential for price manipulation.');
    }
    
    // Volatility recommendations
    if (tokenData.volatilityDetails.dailyVolatility > 10) {
      recommendations.push('High daily volatility suggests significant price risk. Consider using stop-loss orders.');
    }
    
    // Audit recommendations
    if (!tokenData.auditDetails.hasAudit) {
      recommendations.push('The token has not been audited by a recognized security firm, increasing potential for undiscovered vulnerabilities.');
    }
    
    return recommendations;
  }
}

// Create singleton instance
const riskScoringService = new RiskScoringService();

module.exports = riskScoringService; 