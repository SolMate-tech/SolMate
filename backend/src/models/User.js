const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  publicKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    default: function() {
      return `User_${this.publicKey.substring(0, 6)}`;
    },
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
  },
  nonce: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: String,
  bio: String,
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY'],
      default: 'USD',
    },
    riskTolerance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    defaultSlippage: {
      type: Number,
      default: 1.0,
      min: 0.1,
      max: 5.0,
    },
    llmProvider: {
      type: String,
      enum: ['openai', 'deepseek', 'anthropic', 'llama', 'mistral'],
      default: 'openai',
    },
    llmModel: {
      type: String,
      default: 'gpt-4',
    },
    llmTemperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      }
    }
  },
  privacy: {
    shareAnalytics: {
      type: Boolean,
      default: true,
    },
    storeHistory: {
      type: Boolean,
      default: true,
    },
    localExecution: {
      type: Boolean,
      default: false,
    },
  },
  llmPreferences: {
    provider: {
      type: String,
      default: 'openai'
    },
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    apiKey: {
      type: String,
      select: false
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  roles: {
    type: [String],
    enum: ['user', 'admin', 'moderator'],
    default: ['user']
  }
});

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// Create a method to return user data without sensitive information
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

// Generate a random nonce
UserSchema.methods.generateNonce = async function() {
  const nonce = Math.floor(Math.random() * 1000000).toString();
  this.nonce = nonce;
  await this.save();
  return nonce;
};

module.exports = mongoose.model('User', UserSchema); 