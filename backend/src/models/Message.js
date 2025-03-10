const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  context: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for efficient querying of user messages
MessageSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema); 