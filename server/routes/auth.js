const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, setupCharacter } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/google
 * @desc    Đăng nhập bằng Google OAuth
 * @access  Public
 */
router.post('/google', googleLogin);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private (cần JWT token)
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/setup-character
 * @desc    Thiết lập nhân vật (avatar + tên hiển thị)
 * @access  Private (cần JWT token)
 */
router.post('/setup-character', protect, setupCharacter);

module.exports = router;
