const mongoose = require('mongoose');

/**
 * Event Schema - Lưu thông tin sự kiện game
 * Hệ thống data-driven: tạo event mới chỉ cần thêm document vào DB
 */
const eventSchema = new mongoose.Schema({
  // ID sự kiện duy nhất (dùng cho logic, không phải _id)
  eventId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // Tên sự kiện
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Mô tả ngắn
  description: {
    type: String,
    default: ''
  },

  // Loại sự kiện (template)
  type: {
    type: String,
    required: true,
    enum: ['login_reward', 'collection', 'exchange', 'milestone']
  },

  // Thời gian bắt đầu & kết thúc
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  // Trạng thái sự kiện
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended'],
    default: 'scheduled'
  },

  // Banner / hình nền sự kiện
  banner: {
    type: String,
    default: ''
  },

  // Icon emoji cho sự kiện
  icon: {
    type: String,
    default: '🎁'
  },

  // Tên token sự kiện (VD: "Lì xì", "Bí ngô", ...)
  tokenName: {
    type: String,
    default: 'Token'
  },

  // Icon token sự kiện
  tokenIcon: {
    type: String,
    default: '🎟️'
  },

  // Phần thưởng đăng nhập hàng ngày
  loginRewards: [{
    day: { type: Number, required: true },       // Ngày thứ mấy (1, 2, 3, ...)
    item: { type: String, required: true },       // gold | diamonds | eventToken
    amount: { type: Number, required: true },     // Số lượng
    label: { type: String, default: '' }          // Label hiển thị
  }],

  // Items có thể đổi bằng token sự kiện
  exchangeItems: [{
    itemId: { type: String, required: true },     // ID item
    name: { type: String, required: true },       // Tên hiển thị
    icon: { type: String, default: '🎁' },        // Icon
    cost: { type: Number, required: true },       // Giá (token sự kiện)
    rewardType: { type: String, required: true }, // gold | diamonds | tankEgg
    rewardAmount: { type: Number, default: 1 },   // Số lượng nhận
    stock: { type: Number, default: -1 },         // -1 = không giới hạn
    description: { type: String, default: '' }
  }],

  // Điều kiện tham gia
  conditions: {
    minLevel: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index cho query nhanh
eventSchema.index({ status: 1, startDate: 1, endDate: 1 });

/**
 * Static method: Lấy events đang active
 */
eventSchema.statics.getActiveEvents = async function() {
  const now = new Date();
  
  // Tự động cập nhật status dựa trên thời gian
  await this.updateMany(
    { status: 'scheduled', startDate: { $lte: now } },
    { $set: { status: 'active' } }
  );
  await this.updateMany(
    { status: 'active', endDate: { $lt: now } },
    { $set: { status: 'ended' } }
  );

  return this.find({ status: 'active' }).sort({ startDate: -1 });
};

module.exports = mongoose.model('Event', eventSchema);
