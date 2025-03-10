const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a method to return user data without sensitive information
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', UserSchema); 