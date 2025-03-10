require('dotenv').config();

// Environment Variables
module.exports = {
  // Server Settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Database Settings
  MONGODB_URI: process.env.MONGODB_URI,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '27017',
  DB_NAME: process.env.DB_NAME || 'solmate',
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  
  // JWT Settings
  JWT_SECRET: process.env.JWT_SECRET || 'solmate-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Logging Settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // LLM Provider Settings
  DEFAULT_LLM_PROVIDER: process.env.DEFAULT_LLM_PROVIDER || 'openai',
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION,
  
  // DeepSeek
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  
  // Anthropic
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  
  // Llama
  LLAMA_API_KEY: process.env.LLAMA_API_KEY,
  LLAMA_API_ENDPOINT: process.env.LLAMA_API_ENDPOINT,
  
  // Mistral
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  
  // LLM Settings
  LLM_TEMPERATURE: process.env.LLM_TEMPERATURE || 0.7,
  LLM_MAX_TOKENS: process.env.LLM_MAX_TOKENS || 1000,
  LLM_TOP_P: process.env.LLM_TOP_P || 1,
}; 