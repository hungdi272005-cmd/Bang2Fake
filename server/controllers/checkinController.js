const User = require('../models/User');

/**
 * Lấy số ngày trong tháng (theo lịch dương)
 */
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/**
 * Lấy ngày trong tuần của ngày 1 (0=T2, 1=T3, ..., 6=CN)
 */
function getFirstDayOfWeek(month, year) {
  const jsDay = new Date(year, month - 1, 1).getDay();
  return (jsDay + 6) % 7;
}

/**
 * Tạo bảng phần thưởng hàng ngày (chỉ Gold, tăng dần theo ngày trong tháng)
 */
function generateDailyRewards(daysInMonth) {
  const rewards = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const gold = Math.floor(200 + (i - 1) * 45);
    rewards.push({ day: i, gold });
  }
  return rewards;
}

/**
 * Bảng milestone cố định
 */
const MILESTONES = [
  { requirement: 7,  diamonds: 5,  mysteryOrbs: 1, tankEggs: 0, label: '💎 5 KC + 🔮 1 Bóng Thần Bí' },
  { requirement: 14, diamonds: 10, mysteryOrbs: 3, tankEggs: 0, label: '💎 10 KC + 🔮 3 Bóng Thần Bí' },
  { requirement: 21, diamonds: 0,  mysteryOrbs: 0, tankEggs: 1, label: '🥚 1 Trứng Tank bất kì' }
];

/**
 * Lấy tháng + năm + ngày hiện tại
 */
function getToday() {
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

/**
 * Kiểm tra và reset nếu sang tháng mới
 */
function checkAndResetMonth(user) {
  const { month, year } = getToday();
  const savedMonth = user.checkin.currentMonth || 0;
  const savedYear = user.checkin.currentYear || 0;
  if (savedMonth !== month || savedYear !== year) {
    user.checkin.checkedDays = [];
    user.checkin.currentMonth = month;
    user.checkin.currentYear = year;
    user.checkin.claimedMilestones = [];
    return true;
  }
  return false;
}

/**
 * @route   GET /api/checkin/status
 * @desc    Lấy trạng thái điểm danh
 * @access  Private
 */
const getCheckinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    const didReset = checkAndResetMonth(user);
    if (didReset) await user.save();

    const { day, month, year } = getToday();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfWeek = getFirstDayOfWeek(month, year);
    const rewards = generateDailyRewards(daysInMonth);
    const checkedDays = user.checkin.checkedDays || [];
    const checkedInToday = checkedDays.includes(day);

    res.status(200).json({
      success: true,
      checkin: {
        checkedDays,
        checkedCount: checkedDays.length,
        totalCheckins: user.checkin.totalCheckins,
        checkedInToday,
        claimedMilestones: user.checkin.claimedMilestones || []
      },
      calendar: {
        daysInMonth,
        firstDayOfWeek,
        today: day,
        month,
        year,
        monthLabel: `Tháng ${month}/${year}`
      },
      rewards,
      milestones: MILESTONES
    });
  } catch (error) {
    console.error('Get checkin status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/**
 * @route   POST /api/checkin/claim
 * @desc    Điểm danh ngày hôm nay (chỉ ngày hôm nay, không bù ngày cũ)
 * @access  Private
 */
const claimCheckin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    checkAndResetMonth(user);

    const { day, month, year } = getToday();
    const checkedDays = user.checkin.checkedDays || [];

    // Kiểm tra đã điểm danh hôm nay chưa
    if (checkedDays.includes(day)) {
      return res.status(400).json({ success: false, message: 'Bạn đã điểm danh hôm nay rồi!' });
    }

    const daysInMonth = getDaysInMonth(month, year);
    const rewards = generateDailyRewards(daysInMonth);
    const reward = rewards[day - 1]; // Phần thưởng theo ngày lịch

    // Cộng Gold theo đúng ngày hôm nay
    user.gold = (user.gold || 0) + reward.gold;

    // Thêm ngày hôm nay vào danh sách đã điểm danh
    user.checkin.checkedDays.push(day);
    user.checkin.lastCheckinDate = new Date();
    user.checkin.totalCheckins = (user.checkin.totalCheckins || 0) + 1;
    user.checkin.currentMonth = month;
    user.checkin.currentYear = year;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Điểm danh ngày ${day} thành công! +${reward.gold} Gold`,
      reward: { day, gold: reward.gold },
      updatedUser: {
        gold: user.gold,
        diamonds: user.diamonds,
        mysteryOrbs: user.mysteryOrbs,
        tankEggs: user.tankEggs,
        checkin: {
          checkedDays: user.checkin.checkedDays,
          checkedCount: user.checkin.checkedDays.length,
          totalCheckins: user.checkin.totalCheckins,
          checkedInToday: true,
          claimedMilestones: user.checkin.claimedMilestones || []
        }
      }
    });
  } catch (error) {
    console.error('Claim checkin error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

/**
 * @route   POST /api/checkin/claim-milestone
 * @desc    Nhận thưởng mốc (7/14/21 ngày)
 * @access  Private
 */
const claimMilestone = async (req, res) => {
  try {
    const { milestone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    checkAndResetMonth(user);

    const milestoneData = MILESTONES.find(m => m.requirement === milestone);
    if (!milestoneData) {
      return res.status(400).json({ success: false, message: 'Mốc không hợp lệ!' });
    }

    const checkedCount = (user.checkin.checkedDays || []).length;
    if (checkedCount < milestone) {
      return res.status(400).json({ success: false, message: `Cần điểm danh ${milestone} ngày mới nhận được mốc này!` });
    }

    const claimed = user.checkin.claimedMilestones || [];
    if (claimed.includes(milestone)) {
      return res.status(400).json({ success: false, message: 'Bạn đã nhận mốc này rồi!' });
    }

    user.diamonds = (user.diamonds || 0) + milestoneData.diamonds;
    user.mysteryOrbs = (user.mysteryOrbs || 0) + milestoneData.mysteryOrbs;
    user.tankEggs = (user.tankEggs || 0) + milestoneData.tankEggs;
    user.checkin.claimedMilestones.push(milestone);

    await user.save();

    res.status(200).json({
      success: true,
      message: `Đã nhận thưởng mốc ${milestone} ngày!`,
      milestone: milestoneData,
      updatedUser: {
        gold: user.gold,
        diamonds: user.diamonds,
        mysteryOrbs: user.mysteryOrbs,
        tankEggs: user.tankEggs,
        checkin: {
          checkedDays: user.checkin.checkedDays,
          checkedCount: user.checkin.checkedDays.length,
          totalCheckins: user.checkin.totalCheckins,
          claimedMilestones: user.checkin.claimedMilestones
        }
      }
    });
  } catch (error) {
    console.error('Claim milestone error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = { getCheckinStatus, claimCheckin, claimMilestone };
