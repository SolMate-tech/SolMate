const logger = require('../utils/logger');
const config = require('../config');
const riskScoringService = require('./riskScoringService');
const solanaService = require('./solanaService');

/**
 * NLPService provides natural language processing capabilities for the chat interface
 */
class NLPService {
  constructor() {
    // Initialize predefined intents
    this.intents = {
      GREETING: 'greeting',
      RISK_ANALYSIS: 'risk_analysis',
      PRICE_INFO: 'price_info',
      MARKET_OVERVIEW: 'market_overview',
      TOKEN_INFO: 'token_info',
      TRANSACTION_INFO: 'transaction_info',
      STRATEGY_CREATION: 'strategy_creation',
      HELP: 'help',
      UNKNOWN: 'unknown'
    };
    
    // Define intent patterns (simplified version - in a production environment, this would use ML models)
    this.intentPatterns = {
      [this.intents.GREETING]: [
        /\b(hi|hello|hey|greetings|howdy|good morning|good afternoon|good evening)\b/i
      ],
      [this.intents.RISK_ANALYSIS]: [
        /\b(risk|analyze|assessment|evaluate|check|safe|risky|danger|secure)\b.*\b(token|project|investment|coin)\b/i,
        /\bhow\b.*\b(risky|safe)\b/i,
        /\bwhat('s| is) the risk\b/i
      ],
      [this.intents.PRICE_INFO]: [
        /\b(price|worth|value|cost|market cap|market value|dollar|usd)\b/i,
        /\bhow much (is|does|are|costs)\b/i,
        /\bprice of\b/i
      ],
      [this.intents.MARKET_OVERVIEW]: [
        /\b(market|overall|trend|trends|stats|statistics|overview)\b/i,
        /\bhow is the market\b/i,
        /\bmarket (overview|status|condition|health)\b/i
      ],
      [this.intents.TOKEN_INFO]: [
        /\b(tell me about|what is|describe|information|details|tokenomics)\b.*\b(token|coin|project)\b/i,
        /\btoken (info|details|summary)\b/i
      ],
      [this.intents.TRANSACTION_INFO]: [
        /\b(transaction|tx|hash|transfer|send|receive)\b/i,
        /\bwhat('s| is) this (transaction|tx)\b/i
      ],
      [this.intents.STRATEGY_CREATION]: [
        /\b(create|build|setup|configure|make|start)\b.*\b(strategy|trading plan|investment plan)\b/i,
        /\bstrategy for\b/i,
        /\bhow (to|should|can) I (invest|trade)\b/i
      ],
      [this.intents.HELP]: [
        /\b(help|assist|support|guide|explain|show me how)\b/i,
        /\bwhat can you do\b/i,
        /\bhow (to use|does this work)\b/i
      ]
    };

    logger.info('NLP service initialized');
  }

  /**
   * Process message and extract intent, entities, and context
   * @param {string} message - User message
   * @param {Object} context - Current conversation context
   * @returns {Object} Processed message with intent, entities, and updated context
   */
  processMessage(message, context = {}) {
    try {
      logger.info(`Processing message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      
      // Detect intent
      const intent = this.detectIntent(message);
      
      // Extract entities
      const entities = this.extractEntities(message);
      
      // Update context based on intent and entities
      const updatedContext = this.updateContext(intent, entities, context);
      
      logger.info(`Processed message with intent: ${intent}`);
      
      return {
        originalMessage: message,
        intent,
        entities,
        context: updatedContext
      };
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  /**
   * Detect intent from message
   * @param {string} message - User message
   * @returns {string} Detected intent
   */
  detectIntent(message) {
    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return intent;
        }
      }
    }
    
    // Default to unknown intent
    return this.intents.UNKNOWN;
  }

  /**
   * Extract entities from message
   * @param {string} message - User message
   * @returns {Object} Extracted entities
   */
  extractEntities(message) {
    const entities = {
      tokenAddresses: [],
      tokenNames: [],
      transactionIds: [],
      numbers: [],
      dates: [],
      strategies: []
    };
    
    // Extract Solana token addresses (simple regex for demonstration)
    const tokenAddressRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
    const addressMatches = message.match(tokenAddressRegex);
    if (addressMatches) {
      entities.tokenAddresses = addressMatches;
    }
    
    // Extract transaction IDs (simplified)
    const txRegex = /\b[1-9A-HJ-NP-Za-km-z]{64,88}\b/g;
    const txMatches = message.match(txRegex);
    if (txMatches) {
      entities.transactionIds = txMatches;
    }
    
    // Extract token names (simplified - would be more sophisticated in production)
    const tokenNameRegex = /\b(SOL|BTC|ETH|USDT|USDC|BONK|JitoSOL|PYTH|RAY|SRM|mSOL|stSOL|ORCA|MNGO)\b/gi;
    const tokenMatches = message.match(tokenNameRegex);
    if (tokenMatches) {
      entities.tokenNames = tokenMatches.map(match => match.toUpperCase());
    }
    
    // Extract numbers
    const numberRegex = /\b\d+(\.\d+)?\b/g;
    const numberMatches = message.match(numberRegex);
    if (numberMatches) {
      entities.numbers = numberMatches.map(Number);
    }
    
    // Extract dates (simplified)
    const dateRegex = /\b(today|yesterday|tomorrow|last week|next week|this month|last month)\b/gi;
    const dateMatches = message.match(dateRegex);
    if (dateMatches) {
      entities.dates = dateMatches;
    }
    
    // Extract strategy types (simplified)
    const strategyRegex = /\b(DCA|dollar cost averaging|swing|day trading|hodl|staking|yield farming)\b/gi;
    const strategyMatches = message.match(strategyRegex);
    if (strategyMatches) {
      entities.strategies = strategyMatches;
    }
    
    return entities;
  }

  /**
   * Update conversation context based on intent and entities
   * @param {string} intent - Detected intent
   * @param {Object} entities - Extracted entities
   * @param {Object} currentContext - Current conversation context
   * @returns {Object} Updated context
   */
  updateContext(intent, entities, currentContext = {}) {
    // Create a copy of the current context
    const context = { ...currentContext };
    
    // Update last intent
    context.lastIntent = intent;
    
    // Update entities in context based on intent
    switch (intent) {
      case this.intents.RISK_ANALYSIS:
        if (entities.tokenAddresses.length > 0) {
          context.tokenAddressForRisk = entities.tokenAddresses[0];
        } else if (entities.tokenNames.length > 0) {
          context.tokenNameForRisk = entities.tokenNames[0];
        }
        break;
        
      case this.intents.PRICE_INFO:
      case this.intents.TOKEN_INFO:
        if (entities.tokenAddresses.length > 0) {
          context.tokenAddress = entities.tokenAddresses[0];
        } else if (entities.tokenNames.length > 0) {
          context.tokenName = entities.tokenNames[0];
        }
        break;
        
      case this.intents.TRANSACTION_INFO:
        if (entities.transactionIds.length > 0) {
          context.transactionId = entities.transactionIds[0];
        }
        break;
        
      case this.intents.STRATEGY_CREATION:
        if (entities.strategies.length > 0) {
          context.strategyType = entities.strategies[0];
        }
        if (entities.tokenNames.length > 0) {
          context.strategyToken = entities.tokenNames[0];
        }
        break;
    }
    
    // Update context with timestamp
    context.lastUpdated = new Date().toISOString();
    
    return context;
  }

  /**
   * Generate AI response based on processed message
   * @param {Object} processedMessage - Processed message with intent and entities
   * @returns {Object} AI response
   */
  async generateResponse(processedMessage) {
    try {
      const { intent, entities, context } = processedMessage;
      
      // Generate response based on intent
      let response = null;
      
      switch (intent) {
        case this.intents.GREETING:
          response = this.generateGreetingResponse(context);
          break;
          
        case this.intents.RISK_ANALYSIS:
          response = await this.generateRiskAnalysisResponse(entities, context);
          break;
          
        case this.intents.PRICE_INFO:
          response = await this.generatePriceInfoResponse(entities, context);
          break;
          
        case this.intents.MARKET_OVERVIEW:
          response = await this.generateMarketOverviewResponse(context);
          break;
          
        case this.intents.TOKEN_INFO:
          response = await this.generateTokenInfoResponse(entities, context);
          break;
          
        case this.intents.TRANSACTION_INFO:
          response = await this.generateTransactionInfoResponse(entities, context);
          break;
          
        case this.intents.STRATEGY_CREATION:
          response = await this.generateStrategyResponse(entities, context);
          break;
          
        case this.intents.HELP:
          response = this.generateHelpResponse(context);
          break;
          
        default:
          response = this.generateFallbackResponse(context);
          break;
      }
      
      return {
        message: response.message,
        data: response.data || null,
        visualType: response.visualType || null,
        context: response.context || context
      };
    } catch (error) {
      logger.error(`Error generating response: ${error.message}`);
      return {
        message: "I'm sorry, I encountered an error while processing your request. Please try again.",
        error: error.message
      };
    }
  }

  /**
   * Generate greeting response
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  generateGreetingResponse(context) {
    const greetings = [
      "Hello! How can I assist you with Solana today?",
      "Hi there! I'm your Solana trading assistant. What would you like to know?",
      "Greetings! What can I help you with in the Solana ecosystem?",
      "Hello! I'm here to help with your Solana trading and analytics needs.",
      "Hi! How can I help you navigate the Solana ecosystem today?"
    ];
    
    return {
      message: greetings[Math.floor(Math.random() * greetings.length)]
    };
  }

  /**
   * Generate risk analysis response
   * @param {Object} entities - Extracted entities
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  async generateRiskAnalysisResponse(entities, context) {
    // Check if we have a token address or name
    let tokenAddress = null;
    
    if (entities.tokenAddresses.length > 0) {
      tokenAddress = entities.tokenAddresses[0];
    } else if (context.tokenAddressForRisk) {
      tokenAddress = context.tokenAddressForRisk;
    } else if (context.tokenAddress) {
      tokenAddress = context.tokenAddress;
    }
    
    if (!tokenAddress) {
      return {
        message: "I'd be happy to analyze the risk of a token for you. Could you please provide the token's address?"
      };
    }
    
    try {
      // In a real implementation, we would call the risk scoring service
      // For demonstration purposes, we'll generate simulated risk analysis
      const riskScore = Math.floor(Math.random() * 100);
      
      let riskCategory, riskAnalysis;
      
      if (riskScore < 20) {
        riskCategory = "Very Low Risk";
        riskAnalysis = "This token appears to have a strong foundation with good liquidity, code quality, and team transparency.";
      } else if (riskScore < 40) {
        riskCategory = "Low Risk";
        riskAnalysis = "This token shows good overall health with only minor risk factors to consider.";
      } else if (riskScore < 60) {
        riskCategory = "Moderate Risk";
        riskAnalysis = "This token has some potential risk factors that should be evaluated before investing significantly.";
      } else if (riskScore < 80) {
        riskCategory = "High Risk";
        riskAnalysis = "This token has several concerning risk factors including limited liquidity and potential code issues.";
      } else {
        riskCategory = "Very High Risk";
        riskAnalysis = "This token has multiple severe risk indicators and should be approached with extreme caution.";
      }
      
      return {
        message: `I've analyzed token ${tokenAddress.substring(0, 6)}...${tokenAddress.substring(tokenAddress.length - 4)}. It has a risk score of ${riskScore}/100 (${riskCategory}). ${riskAnalysis} Would you like a more detailed breakdown of the risk factors?`,
        data: {
          tokenAddress,
          riskScore,
          riskCategory
        },
        visualType: 'risk_summary'
      };
    } catch (error) {
      logger.error(`Error in risk analysis: ${error.message}`);
      return {
        message: "I'm sorry, I encountered an error while analyzing this token. Please try again or provide a different token address."
      };
    }
  }

  /**
   * Generate price information response
   * @param {Object} entities - Extracted entities
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  async generatePriceInfoResponse(entities, context) {
    // Check if we have a token
    let tokenName = null;
    
    if (entities.tokenNames.length > 0) {
      tokenName = entities.tokenNames[0];
    } else if (context.tokenName) {
      tokenName = context.tokenName;
    }
    
    if (!tokenName) {
      return {
        message: "I'd be happy to check the price for you. Which token are you interested in?"
      };
    }
    
    try {
      // In a real implementation, we would fetch real price data
      // For demonstration purposes, we'll generate simulated price data
      const price = (Math.random() * (tokenName === 'SOL' ? 100 : 10)).toFixed(2);
      const change24h = (Math.random() * 20 - 10).toFixed(2);
      
      return {
        message: `The current price of ${tokenName} is $${price}, which is ${change24h >= 0 ? 'up' : 'down'} ${Math.abs(change24h)}% in the last 24 hours. Would you like to see more detailed price information or historical data?`,
        data: {
          token: tokenName,
          price,
          change24h
        },
        visualType: 'price_info'
      };
    } catch (error) {
      logger.error(`Error fetching price info: ${error.message}`);
      return {
        message: `I'm sorry, I encountered an error while fetching the price information for ${tokenName}. Please try again later.`
      };
    }
  }

  /**
   * Generate market overview response
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  async generateMarketOverviewResponse(context) {
    try {
      // In a real implementation, we would fetch real market data
      // For demonstration purposes, we'll generate simulated market data
      const solPrice = (Math.random() * 100 + 50).toFixed(2);
      const solChange = (Math.random() * 20 - 10).toFixed(2);
      const marketSentiment = ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)];
      const tradingVolume = (Math.random() * 1000 + 500).toFixed(2);
      
      return {
        message: `The Solana market is currently ${marketSentiment}. SOL is trading at $${solPrice} (${solChange >= 0 ? '+' : ''}${solChange}%) with a 24h trading volume of $${tradingVolume}M. Overall, ${
          marketSentiment === 'bullish' 
            ? 'there seems to be positive momentum in the market.' 
            : marketSentiment === 'bearish' 
              ? 'the market is showing some downward pressure.' 
              : 'the market is showing relatively stable conditions.'
        } Would you like more specific information about top tokens or market trends?`,
        data: {
          solPrice,
          solChange,
          marketSentiment,
          tradingVolume
        },
        visualType: 'market_overview'
      };
    } catch (error) {
      logger.error(`Error generating market overview: ${error.message}`);
      return {
        message: "I'm sorry, I encountered an error while fetching the market overview. Please try again later."
      };
    }
  }

  /**
   * Generate token information response
   * @param {Object} entities - Extracted entities
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  async generateTokenInfoResponse(entities, context) {
    // Check if we have a token
    let tokenName = null;
    let tokenAddress = null;
    
    if (entities.tokenNames.length > 0) {
      tokenName = entities.tokenNames[0];
    } else if (entities.tokenAddresses.length > 0) {
      tokenAddress = entities.tokenAddresses[0];
      tokenName = `Token at ${tokenAddress.substring(0, 6)}...${tokenAddress.substring(tokenAddress.length - 4)}`;
    } else if (context.tokenName) {
      tokenName = context.tokenName;
    } else if (context.tokenAddress) {
      tokenAddress = context.tokenAddress;
      tokenName = `Token at ${tokenAddress.substring(0, 6)}...${tokenAddress.substring(tokenAddress.length - 4)}`;
    }
    
    if (!tokenName && !tokenAddress) {
      return {
        message: "I'd be happy to provide information about a token. Which token are you interested in?"
      };
    }
    
    try {
      // In a real implementation, we would fetch real token data
      // For demonstration purposes, we'll generate simulated token data
      const marketCap = (Math.random() * 10000 + 1000).toFixed(2);
      const supply = (Math.random() * 1000000000).toFixed(0);
      const holders = (Math.random() * 100000 + 10000).toFixed(0);
      
      return {
        message: `${tokenName} has a market cap of $${marketCap}M with a circulating supply of ${supply} tokens across ${holders} holders. It's a ${['DeFi', 'NFT', 'Infrastructure', 'Gaming', 'DAO'][Math.floor(Math.random() * 5)]} project in the Solana ecosystem. Would you like to know more about its tokenomics, risk profile, or price history?`,
        data: {
          token: tokenName,
          address: tokenAddress,
          marketCap,
          supply,
          holders
        },
        visualType: 'token_info'
      };
    } catch (error) {
      logger.error(`Error fetching token info: ${error.message}`);
      return {
        message: `I'm sorry, I encountered an error while fetching information for ${tokenName}. Please try again later.`
      };
    }
  }

  /**
   * Generate transaction information response
   * @param {Object} entities - Extracted entities
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  async generateTransactionInfoResponse(entities, context) {
    // Check if we have a transaction ID
    let transactionId = null;
    
    if (entities.transactionIds.length > 0) {
      transactionId = entities.transactionIds[0];
    } else if (context.transactionId) {
      transactionId = context.transactionId;
    }
    
    if (!transactionId) {
      return {
        message: "I can help you analyze a transaction. Please provide the transaction signature or ID."
      };
    }
    
    try {
      // In a real implementation, we would fetch real transaction data
      // For demonstration purposes, we'll generate simulated transaction data
      const timestamp = new Date(Date.now() - Math.random() * 864000000).toISOString(); // Random time in last 10 days
      const succeeded = Math.random() > 0.2;
      const fee = (Math.random() * 0.001).toFixed(6);
      
      return {
        message: `Transaction ${transactionId.substring(0, 8)}...${transactionId.substring(transactionId.length - 8)} was processed on ${new Date(timestamp).toLocaleString()} and ${succeeded ? 'succeeded' : 'failed'}. It had a fee of ${fee} SOL. ${succeeded ? 'The transaction involved a token transfer of approximately $XX.XX.' : 'The transaction failed due to insufficient funds or slippage.'} Would you like me to provide more details about this transaction?`,
        data: {
          transaction: transactionId,
          timestamp,
          succeeded,
          fee
        },
        visualType: 'transaction_info'
      };
    } catch (error) {
      logger.error(`Error fetching transaction info: ${error.message}`);
      return {
        message: `I'm sorry, I couldn't retrieve information for transaction ${transactionId.substring(0, 8)}... Please check if the transaction ID is correct and try again.`
      };
    }
  }

  /**
   * Generate strategy response
   * @param {Object} entities - Extracted entities
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  async generateStrategyResponse(entities, context) {
    // Check if we have strategy type
    let strategyType = null;
    let tokenName = null;
    
    if (entities.strategies.length > 0) {
      strategyType = entities.strategies[0];
    } else if (context.strategyType) {
      strategyType = context.strategyType;
    }
    
    if (entities.tokenNames.length > 0) {
      tokenName = entities.tokenNames[0];
    } else if (context.strategyToken) {
      tokenName = context.strategyToken;
    } else if (context.tokenName) {
      tokenName = context.tokenName;
    }
    
    if (!strategyType && !tokenName) {
      return {
        message: "I can help you create a trading strategy. What type of strategy are you interested in (e.g., DCA, swing trading, staking) and for which token?"
      };
    } else if (!strategyType) {
      return {
        message: `I can help you create a strategy for ${tokenName}. What type of strategy are you interested in (e.g., DCA, swing trading, staking)?`,
        context: { ...context, strategyToken: tokenName }
      };
    } else if (!tokenName) {
      return {
        message: `I can help you create a ${strategyType} strategy. Which token would you like to use for this strategy?`,
        context: { ...context, strategyType }
      };
    }
    
    try {
      // In a real implementation, we would generate a real strategy
      // For demonstration purposes, we'll generate a simulated strategy response
      let strategyDescription = "";
      
      if (strategyType.toLowerCase().includes('dca') || strategyType.toLowerCase().includes('dollar cost')) {
        strategyDescription = `For a DCA strategy with ${tokenName}, I recommend investing a fixed amount (e.g., $100) every week regardless of price. This approach averages your entry price over time and reduces the impact of volatility.`;
      } else if (strategyType.toLowerCase().includes('swing')) {
        strategyDescription = `For swing trading ${tokenName}, I recommend looking for key support and resistance levels, using technical indicators like RSI and MACD for entry and exit points, and setting strict stop losses at 5-10% below entry.`;
      } else if (strategyType.toLowerCase().includes('day')) {
        strategyDescription = `For day trading ${tokenName}, you'll need to monitor short-term price movements closely. I suggest focusing on 5-15 minute charts, using volume indicators, and closing all positions at the end of each trading session.`;
      } else if (strategyType.toLowerCase().includes('hodl') || strategyType.toLowerCase().includes('holding')) {
        strategyDescription = `For a long-term holding strategy with ${tokenName}, I recommend setting up a secure wallet, dollar-cost averaging into your position, and having clear price targets for taking partial profits over time.`;
      } else if (strategyType.toLowerCase().includes('staking')) {
        strategyDescription = `For staking ${tokenName}, look for reputable validators with high uptime and reasonable commission rates. Consider liquid staking options like Marinade or Lido for greater flexibility while still earning yield.`;
      } else {
        strategyDescription = `For a ${strategyType} strategy with ${tokenName}, I recommend starting with a small position size, defining clear entry and exit points, and implementing risk management with stop losses.`;
      }
      
      return {
        message: `${strategyDescription} Would you like me to help you implement this strategy or customize it further to your needs?`,
        data: {
          token: tokenName,
          strategyType,
          timeframe: strategyType.toLowerCase().includes('day') ? 'Short-term' : strategyType.toLowerCase().includes('swing') ? 'Medium-term' : 'Long-term'
        },
        visualType: 'strategy_outline'
      };
    } catch (error) {
      logger.error(`Error generating strategy: ${error.message}`);
      return {
        message: `I'm sorry, I encountered an error while creating a ${strategyType} strategy for ${tokenName}. Please try again with different parameters.`
      };
    }
  }

  /**
   * Generate help response
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  generateHelpResponse(context) {
    return {
      message: "I'm SolMate, your AI assistant for Solana trading and analytics. I can help you with:\n\n" +
        "🔍 Token Risk Analysis - Evaluate the risk of any Solana token\n" +
        "💰 Price Information - Check current prices and trends\n" +
        "📊 Market Overview - Get insights on the overall Solana market\n" +
        "ℹ️ Token Information - Learn about specific tokens and projects\n" +
        "🔎 Transaction Analysis - Understand what happened in a transaction\n" +
        "📈 Strategy Creation - Build customized trading strategies\n\n" +
        "Just ask me in natural language, and I'll do my best to help! What would you like to know about today?"
    };
  }

  /**
   * Generate fallback response
   * @param {Object} context - Conversation context
   * @returns {Object} Response object
   */
  generateFallbackResponse(context) {
    const fallbacks = [
      "I'm not sure I understood that correctly. Could you please rephrase your question?",
      "I'm still learning about the Solana ecosystem. Could you provide more details about what you're looking for?",
      "I didn't quite catch that. Are you asking about token analysis, prices, or trading strategies?",
      "I'm sorry, but I'm not sure how to help with that request. Could you try asking in a different way?",
      "I'm having trouble understanding your request. Could you be more specific about what you're looking for in the Solana ecosystem?"
    ];
    
    return {
      message: fallbacks[Math.floor(Math.random() * fallbacks.length)]
    };
  }
}

// Create singleton instance
const nlpService = new NLPService();

module.exports = nlpService; 