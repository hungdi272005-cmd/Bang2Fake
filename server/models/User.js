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
  selectedTank: {
    type: String,
    default: 'Gundam',
    enum: ['Gundam', 'Phoenix', 'Kakashi'] // Các tanks có sẵn
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
