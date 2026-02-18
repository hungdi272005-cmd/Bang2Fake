const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

/**
 * Tạo JWT token (bao gồm sessionToken để kiểm tra đăng nhập 1 nơi)
 * @param {string} id - User ID
 * @param {string} sessionToken - Session token duy nhất
 * @returns {string} JWT token
 */
const generateToken = (id, sessionToken) => {
  return jwt.sign(
    { id, sessionToken },
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

    // Tạo session token (đảm bảo chỉ đăng nhập 1 nơi)
    const sessionToken = uuidv4();

    // Tạo user mới
    const user = await User.create({
      username,
      phone,
      password, // Password sẽ được hash tự động bởi pre-save middleware
      sessionToken
    });

    // Tạo JWT token
    const token = generateToken(user._id, sessionToken);

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
        isFirstLogin: user.isFirstLogin,
        vipLevel: user.vipLevel,
        diamonds: user.diamonds,
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

    // Tạo session token mới (đá phiên cũ ra)
    const sessionToken = uuidv4();

    // Cập nhật lastLogin, sessionToken & Migration Gold
    user.lastLogin = Date.now();
    user.sessionToken = sessionToken;
    if (user.gold === undefined) {
      user.gold = 1000;
    }
    await user.save();

    // Đá phiên cũ ra qua Socket.IO (real-time)
    if (req.io) {
      req.io.to(`user:${user._id.toString()}`).emit('force_logout', {
        message: 'Tài khoản đã đăng nhập ở nơi khác'
      });
    }

    // Tạo JWT token
    const token = generateToken(user._id, sessionToken);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        displayName: user.displayName,
        isFirstLogin: user.isFirstLogin,
        stats: user.stats,
        selectedTank: user.selectedTank,
        vipLevel: user.vipLevel,
        vipLevel: user.vipLevel,
        diamonds: user.diamonds,
        gold: user.gold === undefined ? 1000 : user.gold,
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

    // Lazy migration: Nếu chưa có gold thì set default
    if (user && user.gold === undefined) {
      user.gold = 1000;
      await user.save(); // Lưu lại vào DB
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        stats: user.stats,
        selectedTank: user.selectedTank,
        vipLevel: user.vipLevel,
        vipLevel: user.vipLevel,
        diamonds: user.diamonds,
        gold: user.gold === undefined ? 1000 : user.gold,
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

/**
 * @route   POST /api/auth/setup-character
 * @desc    Setup character (avatar + display name) after first login
 * @access  Private
 */
const setupCharacter = async (req, res) => {
  try {
    const { avatar, displayName } = req.body;

    // Validation
    if (!avatar || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn biểu tượng và nhập tên hiển thị'
      });
    }

    if (!['male', 'female'].includes(avatar)) {
      return res.status(400).json({
        success: false,
        message: 'Biểu tượng không hợp lệ'
      });
    }

    if (displayName.length < 3 || displayName.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Tên hiển thị phải có 3-20 ký tự'
      });
    }

    // req.user đã được set bởi protect middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Update character info
    user.avatar = avatar;
    user.displayName = displayName;
    user.isFirstLogin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Thiết lập nhân vật thành công',
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        displayName: user.displayName,
        isFirstLogin: user.isFirstLogin,
        stats: user.stats,
        selectedTank: user.selectedTank,
        vipLevel: user.vipLevel,
        diamonds: user.diamonds
      }
    });
  } catch (error) {
    console.error('Setup character error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thiết lập nhân vật',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/google
 * @desc    Đăng nhập bằng Google OAuth
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu Google credential token'
      });
    }

    // Verify Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Google token không hợp lệ'
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Tìm user theo googleId hoặc email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    // Tạo session token mới (đá phiên cũ ra)
    const sessionToken = uuidv4();

    if (user) {
      // User đã tồn tại - cập nhật googleId nếu chưa có
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.lastLogin = Date.now();
      user.sessionToken = sessionToken;
      // Lazy migration: Nếu chưa có gold thì set default
      if (user.gold === undefined) {
        user.gold = 1000;
      }
      await user.save();

      // Đá phiên cũ ra qua Socket.IO (real-time)
      if (req.io) {
        req.io.to(`user:${user._id.toString()}`).emit('force_logout', {
          message: 'Tài khoản đã đăng nhập ở nơi khác'
        });
      }
    } else {
      // Tạo user mới từ Google account
      // Tạo username unique từ tên Google
      let baseUsername = name.replace(/\s+/g, '').substring(0, 15);
      let username = baseUsername;
      let counter = 1;
      
      // Đảm bảo username unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        username,
        googleId,
        email,
        displayName: name,
        isFirstLogin: true,
        gold: 1000,
        sessionToken
      });
    }

    // Tạo JWT token
    const token = generateToken(user._id, sessionToken);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        displayName: user.displayName,
        isFirstLogin: user.isFirstLogin,
        stats: user.stats,
        selectedTank: user.selectedTank,
        vipLevel: user.vipLevel,
        diamonds: user.diamonds,
        gold: user.gold === undefined ? 1000 : user.gold,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập Google',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  setupCharacter
};
