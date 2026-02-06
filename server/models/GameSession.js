const mongoose = require('mongoose');

/**
 * GameSession Schema - Lưu thông tin phiên chơi
 */
const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    socketId: String,
    tank: String,
    status: {
      type: String,
      enum: ['waiting', 'ready', 'playing', 'disconnected'],
      default: 'waiting'
    }
  }],
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  winner: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
