const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParameterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const BacktestSchema = new Schema({
  period: {
    type: String,
    default: '3 months',
  },
  profit: {
    type: String,
    default: '0%',
  },
  drawdown: {
    type: String,
    default: '0%',
  },
  winRate: {
    type: String,
    default: '0%',
  },
  sharpeRatio: {
    type: String,
    default: '0',
  },
});

const TransactionSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['Buy', 'Sell', 'Deposit', 'Withdraw'],
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed',
  },
});

const StrategySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  parameters: [ParameterSchema],
  backtest: {
    type: BacktestSchema,
    default: () => ({}),
  },
  status: {
    type: String,
    enum: ['Draft', 'Ready to deploy', 'Active', 'Paused', 'Archived'],
    default: 'Draft',
  },
  performance: {
    profit: {
      type: String,
      default: '0%',
    },
    timeframe: {
      type: String,
      default: '1 day',
    },
  },
  transactions: [TransactionSchema],
  tokens: [{
    type: String, // Token addresses
  }],
  lastExecuted: {
    type: Date,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

// Update the updated field on save
StrategySchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Strategy', StrategySchema); 