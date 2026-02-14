const User = require('../models/User');

/**
 * Bảng phần thưởng vòng quay (phải khớp với frontend SPIN_REWARDS)
 */
const SPIN_REWARDS = [
  { id: 0, type: 'diamonds', amount: 100 },
  { id: 1, type: 'gold',     amount: 500 },
  { id: 2, type: 'orbs',     amount: 1 },
  { id: 3, type: 'gold',     amount: 2000 },
  { id: 4, type: 'diamonds', amount: 10 },
  { id: 5, type: 'gold',     amount: 1000 },
  { id: 6, type: 'diamonds', amount: 5 },
  { id: 7, type: 'gold',     amount: 3000 }
];

/**
 * Tỷ lệ trúng (weighted random)
 * Index 0 (100 KC) tỷ lệ thấp nhất, Gold tỷ lệ cao
 */
const SPIN_WEIGHTS = [1, 20, 5, 10, 12, 15, 18, 8];

/**
 * Chọn ô trúng theo tỷ lệ
 */
function getWeightedRandom() {
  const totalWeight = SPIN_WEIGHTS.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < SPIN_WEIGHTS.length; i++) {
    random -= SPIN_WEIGHTS[i];
    if (random <= 0) return i;
  }
  return SPIN_WEIGHTS.length - 1;
}

/**
 * @route   GET /api/spin/status
 * @desc    Lấy số bóng thần bí hiện có
 * @access  Private
 */
const getSpinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    res.json({
      success: true,
      mysteryOrbs: user.mysteryOrbs || 0,
      gold: user.gold,
      diamonds: user.diamonds
    });
  } catch (error) {
    console.error('Spin status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * @route   POST /api/spin/spin
 * @desc    Quay vòng quay (tốn 1 Bóng Thần Bí)
 * @access  Private
 */
const spinWheel = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    if ((user.mysteryOrbs || 0) < 1) {
      return res.status(400).json({ success: false, message: 'Không đủ Bóng Thần Bí! Điểm danh để nhận thêm.' });
    }

    // Trừ 1 bóng
    user.mysteryOrbs -= 1;

    // Random ô thắng (theo tỷ lệ)
    const winIndex = getWeightedRandom();
    const reward = SPIN_REWARDS[winIndex];

    // Cộng phần thưởng
    switch (reward.type) {
      case 'gold':
        user.gold = (user.gold || 0) + reward.amount;
        break;
      case 'diamonds':
        user.diamonds = (user.diamonds || 0) + reward.amount;
        break;
      case 'orbs':
        user.mysteryOrbs = (user.mysteryOrbs || 0) + reward.amount;
        break;
    }

    await user.save();

    res.json({
      success: true,
      winIndex,
      reward,
      updatedUser: {
        gold: user.gold,
        diamonds: user.diamonds,
        mysteryOrbs: user.mysteryOrbs
      }
    });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getSpinStatus, spinWheel };
