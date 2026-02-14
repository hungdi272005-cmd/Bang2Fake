const express = require('express');
const router = express.Router();
const { getCheckinStatus, claimCheckin, claimMilestone } = require('../controllers/checkinController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/checkin/status
 * @desc    Lấy trạng thái điểm danh + lịch tháng
 * @access  Private
 */
router.get('/status', protect, getCheckinStatus);

/**
 * @route   POST /api/checkin/claim
 * @desc    Điểm danh hàng ngày (nhận Gold)
 * @access  Private
 */
router.post('/claim', protect, claimCheckin);

/**
 * @route   POST /api/checkin/claim-milestone
 * @desc    Nhận thưởng mốc (7/14/21 ngày)
 * @access  Private
 */
router.post('/claim-milestone', protect, claimMilestone);

module.exports = router;
