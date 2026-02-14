/**
 * Rune Controller
 * Xử lý logic ngọc: inventory, trang ngọc, nâng cấp, gắn/gỡ, tank mapping
 * Tất cả validation trên server để chống hack
 */

const User = require('../models/User');

// ==================== DANH SÁCH NGỌC HỢP LỆ ====================
// Dùng để validate runeId từ client
const VALID_RUNES = {
  atk_1: { stat: 'atk', tier: 1 }, atk_2: { stat: 'atk', tier: 2 }, atk_3: { stat: 'atk', tier: 3 },
  def_1: { stat: 'def', tier: 1 }, def_2: { stat: 'def', tier: 2 }, def_3: { stat: 'def', tier: 3 },
  spd_1: { stat: 'spd', tier: 1 }, spd_2: { stat: 'spd', tier: 2 }, spd_3: { stat: 'spd', tier: 3 },
  crit_1: { stat: 'crit', tier: 1 }, crit_2: { stat: 'crit', tier: 2 }, crit_3: { stat: 'crit', tier: 3 },
  vamp_1: { stat: 'vamp', tier: 1 }, vamp_2: { stat: 'vamp', tier: 2 }, vamp_3: { stat: 'vamp', tier: 3 },
  all_1: { stat: 'all', tier: 1 }, all_2: { stat: 'all', tier: 2 }, all_3: { stat: 'all', tier: 3 },
};

// Tìm ngọc tier cao hơn cùng stat
function getNextTierRuneId(runeId) {
  const rune = VALID_RUNES[runeId];
  if (!rune || rune.tier >= 3) return null;
  return `${rune.stat}_${rune.tier + 1}`;
}

// ==================== GET RUNE DATA ====================

/**
 * @route   GET /api/runes/data
 * @desc    Lấy toàn bộ dữ liệu ngọc của user
 */
const getRuneData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        inventory: Object.fromEntries(user.runeInventory || new Map()),
        pages: user.runePages || [],
        tankMapping: Object.fromEntries(user.tankRuneMapping || new Map()),
      }
    });
  } catch (error) {
    console.error('❌ getRuneData error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== EQUIP RUNE ====================

/**
 * @route   POST /api/runes/equip
 * @desc    Gắn ngọc vào slot (trừ inventory, lưu vào page)
 * @body    { pageId, slotIndex, runeId }
 */
const equipRune = async (req, res) => {
  try {
    const { pageId, slotIndex, runeId } = req.body;

    // Validate inputs
    if (!pageId || slotIndex === undefined || !runeId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }
    if (!VALID_RUNES[runeId]) {
      return res.status(400).json({ success: false, message: 'Ngọc không hợp lệ' });
    }
    if (slotIndex < 0 || slotIndex > 5) {
      return res.status(400).json({ success: false, message: 'Slot không hợp lệ' });
    }

    const user = await User.findById(req.user._id);

    // Tìm page
    const page = user.runePages.find(p => p.pageId === pageId);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Trang ngọc không tồn tại' });
    }

    // Kiểm tra inventory
    const currentQty = user.runeInventory.get(runeId) || 0;
    if (currentQty <= 0) {
      return res.status(400).json({ success: false, message: 'Không đủ ngọc' });
    }

    // Nếu slot đã có ngọc cũ → trả lại inventory
    const oldRune = page.slots[slotIndex];
    if (oldRune) {
      const oldQty = user.runeInventory.get(oldRune) || 0;
      user.runeInventory.set(oldRune, oldQty + 1);
    }

    // Trừ ngọc mới từ inventory
    user.runeInventory.set(runeId, currentQty - 1);

    // Gắn vào slot
    page.slots[slotIndex] = runeId;

    await user.save();

    res.json({
      success: true,
      message: 'Đã gắn ngọc',
      data: {
        inventory: Object.fromEntries(user.runeInventory),
        pages: user.runePages,
      }
    });
  } catch (error) {
    console.error('❌ equipRune error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== UNEQUIP RUNE ====================

/**
 * @route   POST /api/runes/unequip
 * @desc    Gỡ ngọc khỏi slot (trả lại inventory)
 * @body    { pageId, slotIndex }
 */
const unequipRune = async (req, res) => {
  try {
    const { pageId, slotIndex } = req.body;

    if (!pageId || slotIndex === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    const user = await User.findById(req.user._id);

    const page = user.runePages.find(p => p.pageId === pageId);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Trang ngọc không tồn tại' });
    }

    const runeInSlot = page.slots[slotIndex];
    if (!runeInSlot) {
      return res.status(400).json({ success: false, message: 'Slot trống' });
    }

    // Trả ngọc về inventory
    const qty = user.runeInventory.get(runeInSlot) || 0;
    user.runeInventory.set(runeInSlot, qty + 1);

    // Gỡ khỏi slot
    page.slots[slotIndex] = null;

    await user.save();

    res.json({
      success: true,
      message: 'Đã gỡ ngọc',
      data: {
        inventory: Object.fromEntries(user.runeInventory),
        pages: user.runePages,
      }
    });
  } catch (error) {
    console.error('❌ unequipRune error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== UPGRADE RUNE ====================

/**
 * @route   POST /api/runes/upgrade
 * @desc    Nâng cấp ngọc: 5x tier(n) → 1x tier(n+1)
 * @body    { runeId }
 */
const upgradeRune = async (req, res) => {
  try {
    const { runeId } = req.body;

    if (!runeId || !VALID_RUNES[runeId]) {
      return res.status(400).json({ success: false, message: 'Ngọc không hợp lệ' });
    }

    const rune = VALID_RUNES[runeId];
    if (rune.tier >= 3) {
      return res.status(400).json({ success: false, message: 'Ngọc đã ở tier cao nhất' });
    }

    const nextRuneId = getNextTierRuneId(runeId);
    if (!nextRuneId) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy ngọc tier cao hơn' });
    }

    const user = await User.findById(req.user._id);

    const currentQty = user.runeInventory.get(runeId) || 0;
    if (currentQty < 5) {
      return res.status(400).json({ success: false, message: `Cần 5 viên, hiện có ${currentQty}` });
    }

    // Trừ 5 viên nguồn
    user.runeInventory.set(runeId, currentQty - 5);

    // Cộng 1 viên đích
    const targetQty = user.runeInventory.get(nextRuneId) || 0;
    user.runeInventory.set(nextRuneId, targetQty + 1);

    await user.save();

    res.json({
      success: true,
      message: `Nâng cấp thành công: 5x ${runeId} → 1x ${nextRuneId}`,
      data: {
        sourceId: runeId,
        targetId: nextRuneId,
        inventory: Object.fromEntries(user.runeInventory),
      }
    });
  } catch (error) {
    console.error('❌ upgradeRune error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== CREATE PAGE ====================

/**
 * @route   POST /api/runes/pages
 * @desc    Tạo trang ngọc mới
 * @body    { name }
 */
const createPage = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (user.runePages.length >= 5) {
      return res.status(400).json({ success: false, message: 'Tối đa 5 trang ngọc' });
    }

    const newPage = {
      pageId: 'page_' + Date.now(),
      name: (name || `Trang ${user.runePages.length + 1}`).substring(0, 20),
      slots: [null, null, null, null, null, null],
    };

    user.runePages.push(newPage);
    await user.save();

    res.json({
      success: true,
      message: 'Đã tạo trang ngọc',
      data: { pages: user.runePages }
    });
  } catch (error) {
    console.error('❌ createPage error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== RENAME PAGE ====================

/**
 * @route   PUT /api/runes/pages/:pageId
 * @desc    Đổi tên trang ngọc
 * @body    { name }
 */
const renamePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên không hợp lệ' });
    }

    const user = await User.findById(req.user._id);
    const page = user.runePages.find(p => p.pageId === pageId);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Trang ngọc không tồn tại' });
    }

    page.name = name.trim().substring(0, 20);
    await user.save();

    res.json({
      success: true,
      message: 'Đã đổi tên',
      data: { pages: user.runePages }
    });
  } catch (error) {
    console.error('❌ renamePage error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== DELETE PAGE ====================

/**
 * @route   DELETE /api/runes/pages/:pageId
 * @desc    Xóa trang ngọc (trả ngọc về inventory)
 */
const deletePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.runePages.length <= 1) {
      return res.status(400).json({ success: false, message: 'Phải giữ ít nhất 1 trang ngọc' });
    }

    const pageIndex = user.runePages.findIndex(p => p.pageId === pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Trang ngọc không tồn tại' });
    }

    // Trả ngọc trong page về inventory
    const page = user.runePages[pageIndex];
    page.slots.forEach(runeId => {
      if (runeId) {
        const qty = user.runeInventory.get(runeId) || 0;
        user.runeInventory.set(runeId, qty + 1);
      }
    });

    user.runePages.splice(pageIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Đã xóa trang ngọc',
      data: {
        inventory: Object.fromEntries(user.runeInventory),
        pages: user.runePages,
      }
    });
  } catch (error) {
    console.error('❌ deletePage error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== TANK RUNE MAPPING ====================

/**
 * @route   POST /api/runes/tank-mapping
 * @desc    Gắn trang ngọc cho tank
 * @body    { tankId, pageId }
 */
const setTankMapping = async (req, res) => {
  try {
    const { tankId, pageId } = req.body;

    if (!tankId || !pageId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    const user = await User.findById(req.user._id);

    // Kiểm tra pageId tồn tại
    const pageExists = user.runePages.some(p => p.pageId === pageId);
    if (!pageExists) {
      return res.status(404).json({ success: false, message: 'Trang ngọc không tồn tại' });
    }

    user.tankRuneMapping.set(tankId, pageId);
    await user.save();

    res.json({
      success: true,
      message: `Đã gắn trang ngọc cho ${tankId}`,
      data: {
        tankMapping: Object.fromEntries(user.tankRuneMapping),
      }
    });
  } catch (error) {
    console.error('❌ setTankMapping error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getRuneData,
  equipRune,
  unequipRune,
  upgradeRune,
  createPage,
  renamePage,
  deletePage,
  setTankMapping,
};
