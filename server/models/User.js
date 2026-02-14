const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema - Lưu thông tin người chơi
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng nhập tên tài khoản'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên tài khoản phải có ít nhất 3 ký tự'],
    maxlength: [20, 'Tên tài khoản không được quá 20 ký tự']
  },
  // Google OAuth fields
  googleId: {
    type: String,
    // Index được định nghĩa bên dưới với partialFilterExpression
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số']
  },
  password: {
    type: String,
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  // Character setup fields
  avatar: {
    type: String,
    enum: ['male', 'female'],
    default: null
  },
  displayName: {
    type: String,
    trim: true,
    minlength: [3, 'Tên hiển thị phải có ít nhất 3 ký tự'],
    maxlength: [20, 'Tên hiển thị không được quá 20 ký tự'],
    default: null
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 }
  },
  // VIP fields
  vipLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  gold: {
    type: Number,
    default: 1000, // Tặng 1000 vàng mặc định
    min: 0
  },
  diamonds: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDeposited: {
    type: Number,
    default: 0, // Tổng tiền đã nạp (VND)
    min: 0
  },
  // Check-in (Điểm danh) fields
  checkin: {
    lastCheckinDate: { type: Date, default: null },
    checkedDays: { type: [Number], default: [] },  // Mảng các ngày đã điểm danh (VD: [1, 3, 5, 12])
    currentMonth: { type: Number, default: 0 },
    currentYear: { type: Number, default: 0 },
    totalCheckins: { type: Number, default: 0 },
    claimedMilestones: { type: [Number], default: [] }
  },
  // Vật phẩm đặc biệt
  mysteryOrbs: {
    type: Number,
    default: 0, // Bóng thần bí (dùng để quay vòng quay)
    min: 0
  },
  tankEggs: {
    type: Number,
    default: 0, // Trứng tank (mở ra tank ngẫu nhiên)
    min: 0
  },
  selectedTank: {
    type: String,
    default: 'Gundam',
    enum: ['Gundam', 'Phoenix', 'Kakashi', 'Deepool']
  },
  // ==================== HỆ THỐNG NGỌC ====================
  runeInventory: {
    type: Map,
    of: Number,
    default: () => new Map([
      // Tier 1: 10 viên mỗi loại
      ['atk_1', 10], ['def_1', 10], ['spd_1', 10], ['crit_1', 10], ['vamp_1', 10], ['all_1', 10],
      // Tier 2: 3 viên mỗi loại
      ['atk_2', 3], ['def_2', 3], ['spd_2', 3], ['crit_2', 3], ['vamp_2', 3], ['all_2', 3],
      // Tier 3: 0 viên (phải nâng cấp)
      ['atk_3', 0], ['def_3', 0], ['spd_3', 0], ['crit_3', 0], ['vamp_3', 0], ['all_3', 0],
    ])
  },
  runePages: {
    type: [{
      pageId: { type: String, required: true },
      name: { type: String, maxlength: 20, default: 'Trang 1' },
      slots: { type: [String], default: [null, null, null, null, null, null] }
    }],
    default: [{
      pageId: 'page_1',
      name: 'Tấn Công',
      slots: [null, null, null, null, null, null]
    }]
  },
  tankRuneMapping: {
    type: Map,
    of: String,  // tankId → pageId
    default: () => new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Sử dụng Partial Filter Expression - Đây là cách chính xác nhất để ignore null trong Unique Index
userSchema.index(
  { phone: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { phone: { $type: "string" } } 
  }
);

userSchema.index(
  { googleId: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { googleId: { $type: "string" } } 
  }
);

/**
 * Middleware: Hash password trước khi lưu vào database
 */
userSchema.pre('save', async function(next) {
  // Chỉ hash nếu password được thay đổi hoặc user mới
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  // Hash password với bcrypt (salt rounds = 10)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Method: So sánh password khi đăng nhập
 * @param {string} enteredPassword - Password người dùng nhập
 * @returns {boolean} - True nếu password đúng
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
