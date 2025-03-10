const logger = require('../utils/logger');
const config = require('../config');
const llmService = require('./llmService');
const nlpService = require('./nlpService');

/**
 * ResponseManagerService handles LLM responses and adapts them to the application's needs
 */
class ResponseManagerService {
  constructor() {
    // Set default LLM options
    this.defaultOptions = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
    };
    
    // Define system prompts for different intents
    this.systemPrompts = {
      default: `You are SolMate, an AI trading assistant for the Solana blockchain. You provide helpful, accurate, and concise information about Solana tokens, trading strategies, and market analysis. Always be respectful and focus on providing value. If you don't know something, admit it rather than making things up.`,
      
      risk_analysis: `You are SolMate's risk analysis expert. Focus on providing balanced, data-driven assessments of token risks. Consider factors like liquidity, code security, team transparency, token distribution, market dynamics, and community sentiment. Present risks clearly without being alarmist.`,
      
      price_info: `You are SolMate's price information specialist. Provide accurate price data and trends for Solana tokens. Stick to factual information and avoid making price predictions. Help users understand market movements rather than speculating on future prices.`,
      
      market_overview: `You are SolMate's market analyst. Provide comprehensive overviews of the Solana market, including major token performance, sector trends, and overall market sentiment. Focus on data-driven insights rather than speculation.`,
      
      token_info: `You are SolMate's token information expert. Provide detailed information about Solana tokens, including their use cases, team, technology, partnerships, and market performance. Focus on factual information while highlighting both strengths and potential concerns.`,
      
      transaction_info: `You are SolMate's transaction analyst. Help users understand Solana transactions, explaining what happened in a clear, accessible way. Break down complex transactions into understandable components, highlighting important details like amounts, participants, and transaction types.`,
      
      strategy_creation: `You are SolMate's strategy building expert. Help users develop sound trading and investment strategies for Solana. Focus on risk management, diversification, and sustainable approaches rather than high-risk tactics. Tailor strategies to individual user needs and risk tolerance.`,
      
      help: `You are SolMate's user guide. Provide clear, helpful information about SolMate's features and capabilities. Explain how users can get the most out of the platform in a friendly, accessible way.`
    };
    
    logger.info('Response manager service initialized');
  }

  /**
   * Build a prompt for the LLM based on user message and intent
   * @param {string} message - User message
   * @param {string} intent - Detected intent
   * @param {Object} entities - Extracted entities
   * @param {Object} context - Conversation context
   * @returns {Array} Formatted messages for LLM
   */
  buildPrompt(message, intent, entities, context) {
    // Select appropriate system prompt based on intent
    const systemPrompt = this.systemPrompts[intent] || this.systemPrompts.default;
    
    // Start with system message
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
    
    // Add context information if available
    if (intent === 'risk_analysis' && (entities.tokenAddresses.length > 0 || context.tokenAddressForRisk)) {
      const tokenAddress = entities.tokenAddresses[0] || context.tokenAddressForRisk;
      messages.push({
        role: 'system',
        content: `The user is asking about token with address: ${tokenAddress}. Provide a comprehensive risk analysis for this token.`
      });
    } else if (intent === 'token_info' && (entities.tokenNames.length > 0 || context.tokenName)) {
      const tokenName = entities.tokenNames[0] || context.tokenName;
      messages.push({
        role: 'system',
        content: `The user is asking about the token: ${tokenName}. Provide comprehensive information about this token.`
      });
    }
    
    // Add conversation history from context if available
    if (context.conversationHistory && Array.isArray(context.conversationHistory)) {
      // Add up to 5 most recent messages for context
      const recentHistory = context.conversationHistory.slice(-5);
      messages.push(...recentHistory);
    }
    
    // Add the current user message
    messages.push({
      role: 'user',
      content: message
    });
    
    return messages;
  }

  /**
   * Process user message and generate AI response
   * @param {string} message - User message
   * @param {Object} context - Conversation context
   * @param {Object} options - LLM options
   * @returns {Promise<Object>} AI response with context
   */
  async processMessage(message, context = {}, options = {}) {
    try {
      logger.info(`Processing message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      
      // Use NLP service to detect intent and extract entities
      const processedMessage = nlpService.processMessage(message, context);
      const { intent, entities, context: updatedContext } = processedMessage;
      
      logger.info(`Detected intent: ${intent}`);
      
      // Determine LLM provider and model
      const provider = options.provider || context.preferredProvider || null;
      const model = options.model || null;
      
      // Merge default options with provided options
      const llmOptions = {
        ...this.defaultOptions,
        ...options,
        model
      };
      
      // Build prompt for LLM
      const prompt = this.buildPrompt(message, intent, entities, updatedContext);
      
      // Generate LLM response
      const llmResponse = await llmService.generateResponse(prompt, llmOptions, provider);
      
      // Process the LLM response based on intent
      const processedResponse = this.processLLMResponse(llmResponse, intent, entities, updatedContext);
      
      // Update context with LLM provider and model for future reference
      processedResponse.context = {
        ...processedResponse.context,
        lastProvider: llmResponse.provider,
        lastModel: llmResponse.model
      };
      
      return processedResponse;
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`);
      
      // Provide a fallback response
      return {
        message: "I'm sorry, I encountered an error while processing your request. Please try again.",
        error: error.message,
        context: context
      };
    }
  }

  /**
   * Process LLM response based on intent
   * @param {Object} llmResponse - Raw LLM response
   * @param {string} intent - Detected intent
   * @param {Object} entities - Extracted entities
   * @param {Object} context - Updated conversation context
   * @returns {Object} Processed response
   */
  processLLMResponse(llmResponse, intent, entities, context) {
    try {
      // Extract content from LLM response
      const { content, provider, model } = llmResponse;
      
      // Default response structure
      const response = {
        message: content,
        provider,
        model,
        intent,
        context: context
      };
      
      // Add visual elements based on intent
      switch (intent) {
        case 'risk_analysis':
          // Extract risk score and category if possible
          const riskScoreMatch = content.match(/risk score of (\d+)(?:\/100)?/i);
          const riskCategoryMatch = content.match(/\((.*?risk.*?)\)/i);
          
          if (riskScoreMatch || riskCategoryMatch) {
            response.data = {
              tokenAddress: entities.tokenAddresses[0] || context.tokenAddressForRisk,
              riskScore: riskScoreMatch ? parseInt(riskScoreMatch[1]) : 50,
              riskCategory: riskCategoryMatch ? riskCategoryMatch[1] : 'Moderate Risk'
            };
            response.visualType = 'risk_summary';
          }
          break;
          
        case 'price_info':
          // Extract price and change information if possible
          const priceMatch = content.match(/\$(\d+(?:\.\d+)?)/);
          const changeMatch = content.match(/(up|down)\s+(\d+(?:\.\d+)?)%/i);
          
          if (priceMatch) {
            response.data = {
              token: entities.tokenNames[0] || context.tokenName,
              price: priceMatch ? priceMatch[1] : '0.00',
              change24h: changeMatch ? (changeMatch[1].toLowerCase() === 'up' ? parseFloat(changeMatch[2]) : -parseFloat(changeMatch[2])) : '0.00'
            };
            response.visualType = 'price_info';
          }
          break;
          
        case 'market_overview':
          response.visualType = 'market_overview';
          break;
          
        case 'token_info':
          response.visualType = 'token_info';
          break;
          
        case 'transaction_info':
          response.visualType = 'transaction_info';
          break;
          
        case 'strategy_creation':
          response.visualType = 'strategy_outline';
          break;
      }
      
      return response;
    } catch (error) {
      logger.error(`Error processing LLM response: ${error.message}`);
      return {
        message: llmResponse.content,
        context: context
      };
    }
  }

  /**
   * Get available LLM providers
   * @returns {Object} Available providers
   */
  getAvailableProviders() {
    return llmService.getAvailableProviders();
  }

  /**
   * Get available models for a provider
   * @param {string} provider - Provider ID
   * @returns {Array} Available models
   */
  getAvailableModels(provider) {
    return llmService.getAvailableModels(provider);
  }
}

// Create singleton instance
const responseManagerService = new ResponseManagerService();

module.exports = responseManagerService; 