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
  phone: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 }
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
});

/**
 * Middleware: Hash password trước khi lưu vào database
 */
userSchema.pre('save', async function(next) {
  // Chỉ hash nếu password được thay đổi hoặc user mới
  if (!this.isModified('password')) {
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
