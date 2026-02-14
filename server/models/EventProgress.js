const mongoose = require('mongoose');

/**
 * EventProgress Schema - Tiến trình của user trong mỗi sự kiện
 */
const eventProgressSchema = new mongoose.Schema({
  // User tham gia
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ID sự kiện (match với Event.eventId)
  eventId: {
    type: String,
    required: true
  },

  // Các ngày đã đăng nhập nhận quà (lưu date string: "2026-02-14")
  loginDays: [{
    type: String
  }],

  // Token sự kiện tích lũy
  eventTokens: {
    type: Number,
    default: 0,
    min: 0
  },

  // Phần thưởng login đã nhận (day number)
  claimedLoginRewards: [{
    type: Number
  }],

  // Lịch sử đổi quà
  exchangeHistory: [{
    itemId: { type: String },
    itemName: { type: String },
    cost: { type: Number },
    exchangedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Compound index: mỗi user chỉ có 1 progress per event
eventProgressSchema.index({ userId: 1, eventId: 1 }, { unique: true });

/**
 * Static: Lấy hoặc tạo progress cho user
 */
eventProgressSchema.statics.getOrCreate = async function(userId, eventId) {
  let progress = await this.findOne({ userId, eventId });
  if (!progress) {
    progress = await this.create({ userId, eventId });
  }
  return progress;
};

module.exports = mongoose.model('EventProgress', eventProgressSchema);
