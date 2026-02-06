const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Tạo JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    // Validation
    if (!username || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên tài khoản, số điện thoại và mật khẩu'
      });
    }

    // Kiểm tra username đã tồn tại chưa
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản đã tồn tại'
      });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const phoneExists = await User.findOne({ phone });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được đăng ký'
      });
    }

    // Tạo user mới
    const user = await User.create({
      username,
      phone,
      password // Password sẽ được hash tự động bởi pre-save middleware
    });

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        stats: user.stats,
        selectedTank: user.selectedTank,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu'
      });
    }

    // Tìm user (bao gồm cả password để so sánh)
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không đúng'
      });
    }

    // Cập nhật lastLogin
    user.lastLogin = Date.now();
    await user.save();

    // Tạo token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        stats: user.stats,
        selectedTank: user.selectedTank,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // req.user đã được set bởi protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        stats: user.stats,
        selectedTank: user.selectedTank,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
