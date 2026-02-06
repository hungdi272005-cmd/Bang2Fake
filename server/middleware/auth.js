const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Xác thực JWT token từ request header
 */
const protect = async (req, res, next) => {
  let token;

  // Kiểm tra header Authorization có Bearer token không
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

      // Lấy thông tin user từ database (không lấy password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      next();
    } catch (error) {
      console.error('JWT verify error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có token, truy cập bị từ chối'
    });
  }
};

/**
 * Middleware: Xác thực socket connection với JWT
 */
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

    // Lấy user info
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user info vào socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = { protect, socketAuth };
