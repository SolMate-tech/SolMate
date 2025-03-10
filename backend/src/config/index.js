require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/solmate',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'development_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Solana configuration
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  SOLANA_NETWORK: process.env.SOLANA_NETWORK || 'mainnet-beta',
  
  // API keys
  AI_API_KEY: process.env.AI_API_KEY,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
}; 