const { logger } = require('../utils/logger');
const { Connection, PublicKey } = require('@solana/web3.js');
const { getNetworkConnection } = require('../utils/solana');

/**
 * Get a list of popular SPL tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getPopularTokens = async (req, res, next) => {
  try {
    // In a real implementation, this would fetch data from a database or external API
    const popularTokens = [
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      },
      {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Wrapped SOL',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
      },
      // Add more popular tokens as needed
    ];

    res.json({ success: true, data: popularTokens });
  } catch (error) {
    logger.error(`Error fetching popular tokens: ${error.message}`);
    next(error);
  }
};

/**
 * Get detailed information about a specific token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTokenInfo = async (req, res, next) => {
  try {
    const { address } = req.params;
    
    // Validate token address
    try {
      new PublicKey(address);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid token address' 
      });
    }
    
    // In a real implementation, this would fetch on-chain data
    // For demonstration, returning mock data
    const tokenInfo = {
      address,
      symbol: address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' ? 'USDC' : 'UNKNOWN',
      name: address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' ? 'USD Coin' : 'Unknown Token',
      decimals: 6,
      totalSupply: '5000000000000000',
      mintAuthority: address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' ? 'Disabled' : 'Enabled',
      freezeAuthority: address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' ? 'Disabled' : 'Enabled',
      logoURI: address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' 
        ? 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
        : null
    };

    res.json({ success: true, data: tokenInfo });
  } catch (error) {
    logger.error(`Error fetching token info for ${req.params.address}: ${error.message}`);
    next(error);
  }
};

/**
 * Get current price and 24h change for a token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTokenPrice = async (req, res, next) => {
  try {
    const { address } = req.params;
    
    // Mock price data for demonstration
    const priceData = {
      price: Math.random(),
      priceChange24h: (Math.random() * 10) - 5, // Random value between -5% and +5%
      volume24h: Math.random() * 1000000,
      marketCap: Math.random() * 10000000,
      lastUpdated: new Date().toISOString()
    };

    res.json({ success: true, data: priceData });
  } catch (error) {
    logger.error(`Error fetching token price for ${req.params.address}: ${error.message}`);
    next(error);
  }
};

/**
 * Get historical price data for a token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getHistoricalPriceData = async (req, res, next) => {
  try {
    const { address } = req.params;
    const { timeframe = '24h' } = req.query;
    
    // Generate mock historical data
    const now = Date.now();
    const dataPoints = timeframe === '24h' ? 24 : 
                      timeframe === '7d' ? 7 * 24 : 
                      timeframe === '30d' ? 30 : 
                      24;
                      
    const interval = timeframe === '24h' ? 60 * 60 * 1000 : 
                    timeframe === '7d' ? 6 * 60 * 60 * 1000 : 
                    timeframe === '30d' ? 24 * 60 * 60 * 1000 : 
                    60 * 60 * 1000;
    
    let lastPrice = Math.random() * 10;
    const priceHistory = Array.from({ length: dataPoints }, (_, i) => {
      const timestamp = new Date(now - (dataPoints - i) * interval).toISOString();
      // Random walk price simulation
      lastPrice = Math.max(0.001, lastPrice + (Math.random() - 0.5) * 0.5);
      return {
        timestamp,
        price: lastPrice,
        volume: Math.random() * 100000
      };
    });

    res.json({ 
      success: true, 
      data: {
        timeframe,
        interval: interval / 1000,
        prices: priceHistory
      }
    });
  } catch (error) {
    logger.error(`Error fetching historical price data for ${req.params.address}: ${error.message}`);
    next(error);
  }
};

/**
 * Get information about token holders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTokenHolders = async (req, res, next) => {
  try {
    const { address } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    // Mock holder data
    const totalHolders = 10000;
    const holders = Array.from({ length: Math.min(limit, 100) }, (_, i) => {
      const holderAddress = `${Buffer.from(Math.random().toString()).toString('hex').substring(0, 32)}`;
      return {
        address: holderAddress,
        balance: Math.floor(Math.random() * 1000000000) / 1000000,
        percentage: (Math.random() * 5).toFixed(2),
        lastTransactionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    res.json({ 
      success: true, 
      data: {
        totalHolders,
        limit: parseInt(limit),
        offset: parseInt(offset),
        holders
      }
    });
  } catch (error) {
    logger.error(`Error fetching token holders for ${req.params.address}: ${error.message}`);
    next(error);
  }
};

/**
 * Search for tokens by name or symbol
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.searchTokens = async (req, res, next) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }
    
    // Mock search results
    const searchResults = [
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      },
      {
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        symbol: 'USDT',
        name: 'USDT',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
      },
      // Add more results as needed
    ].filter(token => 
      token.name.toLowerCase().includes(query.toLowerCase()) || 
      token.symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    res.json({ 
      success: true, 
      data: searchResults
    });
  } catch (error) {
    logger.error(`Error searching tokens with query "${req.query.query}": ${error.message}`);
    next(error);
  }
}; 