const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  pictureUrl: {
    type: String
  },
  text: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    enum: ['general', 'admin'],
    default: 'general',
    index: true
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// 最新のメッセージから取得するためのインデックス
chatMessageSchema.index({ timestamp: -1 });
chatMessageSchema.index({ channel: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

