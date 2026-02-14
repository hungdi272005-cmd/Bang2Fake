const express = require('express');
const router = express.Router();
const {
  getActiveEvents,
  getEventDetail,
  claimLoginReward,
  exchangeReward,
  seedTetEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/events/active
 * @desc    Lấy danh sách sự kiện đang active
 * @access  Private
 */
router.get('/active', protect, getActiveEvents);

/**
 * @route   GET /api/events/:eventId
 * @desc    Chi tiết sự kiện + tiến trình user
 * @access  Private
 */
router.get('/:eventId', protect, getEventDetail);

/**
 * @route   POST /api/events/:eventId/claim-login
 * @desc    Nhận quà đăng nhập hàng ngày
 * @access  Private
 */
router.post('/:eventId/claim-login', protect, claimLoginReward);

/**
 * @route   POST /api/events/:eventId/exchange
 * @desc    Đổi token sự kiện lấy phần thưởng
 * @access  Private
 */
router.post('/:eventId/exchange', protect, exchangeReward);

/**
 * @route   POST /api/events/seed-tet
 * @desc    Seed data sự kiện Tết (admin)
 * @access  Admin
 */
router.post('/seed-tet', seedTetEvent);

module.exports = router;
