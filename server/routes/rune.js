const express = require('express');
const router = express.Router();
const {
  getRuneData,
  equipRune,
  unequipRune,
  upgradeRune,
  createPage,
  renamePage,
  deletePage,
  setTankMapping
} = require('../controllers/runeController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/runes/data
 * @desc    Lấy toàn bộ dữ liệu ngọc (inventory + pages + tank mapping)
 */
router.get('/data', protect, getRuneData);

/**
 * @route   POST /api/runes/equip
 * @desc    Gắn ngọc vào slot
 */
router.post('/equip', protect, equipRune);

/**
 * @route   POST /api/runes/unequip
 * @desc    Gỡ ngọc khỏi slot
 */
router.post('/unequip', protect, unequipRune);

/**
 * @route   POST /api/runes/upgrade
 * @desc    Nâng cấp ngọc: 5x → 1x
 */
router.post('/upgrade', protect, upgradeRune);

/**
 * @route   POST /api/runes/pages
 * @desc    Tạo trang ngọc mới
 */
router.post('/pages', protect, createPage);

/**
 * @route   PUT /api/runes/pages/:pageId
 * @desc    Đổi tên trang ngọc
 */
router.put('/pages/:pageId', protect, renamePage);

/**
 * @route   DELETE /api/runes/pages/:pageId
 * @desc    Xóa trang ngọc
 */
router.delete('/pages/:pageId', protect, deletePage);

/**
 * @route   POST /api/runes/tank-mapping
 * @desc    Gắn trang ngọc cho tank
 */
router.post('/tank-mapping', protect, setTankMapping);

module.exports = router;
