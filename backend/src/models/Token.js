const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  decimals: {
    type: Number,
    default: 9,
  },
  totalSupply: {
    type: String,
    default: '0',
  },
  circulatingSupply: {
    type: String,
    default: '0',
  },
  holders: {
    type: Number,
    default: 0,
  },
  price: {
    usd: {
      type: Number,
      default: 0,
    },
    sol: {
      type: Number,
      default: 0,
    },
  },
  marketCap: {
    type: Number,
    default: 0,
  },
  volume24h: {
    type: Number,
    default: 0,
  },
  change24h: {
    type: Number,
    default: 0,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High'],
    default: 'Medium',
  },
  metrics: {
    liquidity: {
      type: String,
      enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
      default: 'Medium',
    },
    holderConcentration: {
      type: String,
      enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
      default: 'Medium',
    },
    auditStatus: {
      type: String,
      enum: ['Audited', 'Partially Audited', 'Unaudited', 'Unknown'],
      default: 'Unknown',
    },
    creationDate: {
      type: Date,
    },
    socialSentiment: {
      type: String,
      enum: ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'],
      default: 'Neutral',
    },
    technicalSignals: {
      type: String,
      enum: ['Very Bearish', 'Bearish', 'Neutral', 'Bullish', 'Very Bullish'],
      default: 'Neutral',
    },
    whaleActivity: {
      type: String,
      enum: ['Decreasing', 'Stable', 'Increasing'],
      default: 'Stable',
    },
  },
  links: {
    website: String,
    twitter: String,
    telegram: String,
    github: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the lastUpdated field on save
TokenSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Calculate risk level based on risk score
TokenSchema.pre('save', function(next) {
  const score = this.riskScore;
  
  if (score <= 25) {
    this.riskLevel = 'Low';
  } else if (score <= 50) {
    this.riskLevel = 'Medium';
  } else if (score <= 75) {
    this.riskLevel = 'High';
  } else {
    this.riskLevel = 'Very High';
  }
  
  next();
});

module.exports = mongoose.model('Token', TokenSchema); 