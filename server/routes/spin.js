const express = require('express');
const router = express.Router();
const { getSpinStatus, spinWheel } = require('../controllers/spinController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/spin/status
 * @desc    Lấy số bóng thần bí
 */
router.get('/status', protect, getSpinStatus);

/**
 * @route   POST /api/spin/spin
 * @desc    Quay vòng quay (-1 Bóng Thần Bí)
 */
router.post('/spin', protect, spinWheel);

module.exports = router;
