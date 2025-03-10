require('dotenv').config();

module.exports = {
  app: {
    name: 'SolMate API',
    version: '1.0.2',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    jwtExpiry: process.env.JWT_EXPIRY || '1d',
  },
  db: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/solmate',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
  solana: {
    network: process.env.SOLANA_NETWORK || 'devnet',
    endpoint: process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
  },
  // LLM服务配置
  defaultLLMProvider: process.env.DEFAULT_LLM_PROVIDER || 'openai',
  defaultLLMModel: process.env.DEFAULT_LLM_MODEL || 'gpt-3.5-turbo',
  llmApiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    llama: process.env.LLAMA_API_KEY
  },
  // 安全设置
  security: {
    rateLimiting: {
      windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
      max: process.env.RATE_LIMIT_MAX || 100, // 每个IP限制请求次数
    },
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    },
    // Encryption settings
    encryptionKey: process.env.ENCRYPTION_KEY || 'a-32-character-key-for-aes256-encr', // Should be a 32-byte key for AES-256
    apiRateLimits: {
      // Rate limits for specific API endpoints (requests per hour)
      llm: {
        message: parseInt(process.env.LLM_MESSAGE_RATE_LIMIT) || 100,
        compare: parseInt(process.env.LLM_COMPARE_RATE_LIMIT) || 20
      }
    }
  },
}; 