const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  lineUserId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  pictureUrl: String,
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

