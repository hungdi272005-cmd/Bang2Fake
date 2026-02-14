const Event = require('../models/Event');
const EventProgress = require('../models/EventProgress');
const User = require('../models/User');

/**
 * @desc    Lấy danh sách sự kiện đang active
 * @route   GET /api/events/active
 * @access  Private
 */
const getActiveEvents = async (req, res) => {
  try {
    const events = await Event.getActiveEvents();
    
    res.json({
      success: true,
      events: events.map(e => ({
        eventId: e.eventId,
        name: e.name,
        description: e.description,
        type: e.type,
        icon: e.icon,
        startDate: e.startDate,
        endDate: e.endDate,
        tokenName: e.tokenName,
        tokenIcon: e.tokenIcon
      }))
    });
  } catch (error) {
    console.error('❌ getActiveEvents error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * @desc    Chi tiết sự kiện + tiến trình user
 * @route   GET /api/events/:eventId
 * @access  Private
 */
const getEventDetail = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Lấy event
    const event = await Event.findOne({ eventId, status: 'active' });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Sự kiện không tồn tại hoặc đã kết thúc' });
    }

    // Lấy hoặc tạo progress cho user
    const progress = await EventProgress.getOrCreate(userId, eventId);

    // Tính ngày hiện tại trong sự kiện (day 1, 2, 3, ...)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // "2026-02-14"
    const eventStartDay = new Date(event.startDate);
    const diffTime = now.getTime() - eventStartDay.getTime();
    const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Kiểm tra hôm nay đã login chưa
    const hasLoggedToday = progress.loginDays.includes(todayStr);

    res.json({
      success: true,
      event: {
        eventId: event.eventId,
        name: event.name,
        description: event.description,
        type: event.type,
        icon: event.icon,
        startDate: event.startDate,
        endDate: event.endDate,
        tokenName: event.tokenName,
        tokenIcon: event.tokenIcon,
        loginRewards: event.loginRewards,
        exchangeItems: event.exchangeItems
      },
      progress: {
        loginDays: progress.loginDays,
        eventTokens: progress.eventTokens,
        claimedLoginRewards: progress.claimedLoginRewards,
        exchangeHistory: progress.exchangeHistory,
        totalLoginDays: progress.loginDays.length
      },
      meta: {
        currentDay,
        todayStr,
        hasLoggedToday
      }
    });
  } catch (error) {
    console.error('❌ getEventDetail error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * @desc    Nhận quà đăng nhập hàng ngày trong sự kiện
 * @route   POST /api/events/:eventId/claim-login
 * @access  Private
 */
const claimLoginReward = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Lấy event
    const event = await Event.findOne({ eventId, status: 'active' });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Sự kiện không tồn tại hoặc đã kết thúc' });
    }

    // Lấy progress
    const progress = await EventProgress.getOrCreate(userId, eventId);
    
    // Kiểm tra hôm nay đã nhận chưa
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (progress.loginDays.includes(todayStr)) {
      return res.status(400).json({ success: false, message: 'Bạn đã nhận quà hôm nay rồi!' });
    }

    // Tính ngày thứ mấy đang login (dựa trên tổng số ngày đã login + 1)
    const loginDay = progress.loginDays.length + 1;

    // Tìm phần thưởng cho ngày này
    const reward = event.loginRewards.find(r => r.day === loginDay);
    if (!reward) {
      // Không có reward cho ngày này nhưng vẫn ghi nhận login
      progress.loginDays.push(todayStr);
      await progress.save();
      return res.json({ 
        success: true, 
        message: `Đã ghi nhận đăng nhập ngày ${loginDay}`,
        reward: null
      });
    }

    // Cập nhật progress
    progress.loginDays.push(todayStr);
    progress.claimedLoginRewards.push(loginDay);

    // Phát thưởng
    const user = await User.findById(userId);
    let rewardMessage = '';

    switch (reward.item) {
      case 'gold':
        user.gold += reward.amount;
        rewardMessage = `+${reward.amount} 🪙 Vàng`;
        break;
      case 'diamonds':
        user.diamonds += reward.amount;
        rewardMessage = `+${reward.amount} 💎 Kim cương`;
        break;
      case 'eventToken':
        progress.eventTokens += reward.amount;
        rewardMessage = `+${reward.amount} ${event.tokenIcon} ${event.tokenName}`;
        break;
      default:
        rewardMessage = `+${reward.amount} ${reward.item}`;
    }

    await user.save();
    await progress.save();

    // Cập nhật localStorage user data
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: `Nhận quà ngày ${loginDay}: ${rewardMessage}`,
      reward: {
        day: loginDay,
        item: reward.item,
        amount: reward.amount,
        label: reward.label || rewardMessage
      },
      progress: {
        loginDays: progress.loginDays,
        eventTokens: progress.eventTokens,
        claimedLoginRewards: progress.claimedLoginRewards,
        totalLoginDays: progress.loginDays.length
      },
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ claimLoginReward error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * @desc    Đổi token sự kiện lấy phần thưởng
 * @route   POST /api/events/:eventId/exchange
 * @access  Private
 */
const exchangeReward = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { itemId } = req.body;
    const userId = req.user._id;

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Thiếu itemId' });
    }

    // Lấy event
    const event = await Event.findOne({ eventId, status: 'active' });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Sự kiện không tồn tại hoặc đã kết thúc' });
    }

    // Tìm item trong exchangeItems
    const item = event.exchangeItems.find(i => i.itemId === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Vật phẩm không tồn tại' });
    }

    // Kiểm tra stock
    if (item.stock === 0) {
      return res.status(400).json({ success: false, message: 'Vật phẩm đã hết hàng' });
    }

    // Lấy progress
    const progress = await EventProgress.getOrCreate(userId, eventId);

    // Kiểm tra đủ token không
    if (progress.eventTokens < item.cost) {
      return res.status(400).json({ 
        success: false, 
        message: `Không đủ ${event.tokenName}! Cần ${item.cost}, bạn có ${progress.eventTokens}` 
      });
    }

    // Trừ token
    progress.eventTokens -= item.cost;
    progress.exchangeHistory.push({
      itemId: item.itemId,
      itemName: item.name,
      cost: item.cost
    });

    // Phát thưởng
    const user = await User.findById(userId);
    let rewardMessage = '';

    switch (item.rewardType) {
      case 'gold':
        user.gold += item.rewardAmount;
        rewardMessage = `+${item.rewardAmount} 🪙 Vàng`;
        break;
      case 'diamonds':
        user.diamonds += item.rewardAmount;
        rewardMessage = `+${item.rewardAmount} 💎 Kim cương`;
        break;
      default:
        rewardMessage = `+${item.rewardAmount} ${item.rewardType}`;
    }

    // Giảm stock nếu giới hạn
    if (item.stock > 0) {
      await Event.updateOne(
        { eventId, 'exchangeItems.itemId': itemId },
        { $inc: { 'exchangeItems.$.stock': -1 } }
      );
    }

    await user.save();
    await progress.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: `Đổi thành công: ${rewardMessage}`,
      exchangedItem: {
        itemId: item.itemId,
        name: item.name,
        cost: item.cost
      },
      progress: {
        eventTokens: progress.eventTokens,
        exchangeHistory: progress.exchangeHistory
      },
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ exchangeReward error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * @desc    Seed data sự kiện Tết Nguyên Đán 2026
 * @route   POST /api/events/seed-tet
 * @access  Admin
 */
const seedTetEvent = async (req, res) => {
  try {
    // Xóa event cũ nếu có
    await Event.deleteOne({ eventId: 'tet_2026' });

    const tetEvent = new Event({
      eventId: 'tet_2026',
      name: '🧧 Tết Nguyên Đán 2026',
      description: 'Chào đón năm mới Bính Ngọ! Đăng nhập mỗi ngày để nhận Lì xì và đổi quà đặc biệt!',
      type: 'login_reward',
      startDate: new Date('2026-02-14T00:00:00+07:00'),  // Hôm nay
      endDate: new Date('2026-03-01T23:59:59+07:00'),     // 15 ngày
      status: 'active',
      icon: '🧧',
      tokenName: 'Lì xì',
      tokenIcon: '🧧',

      // Phần thưởng đăng nhập 7 ngày
      loginRewards: [
        { day: 1, item: 'gold',       amount: 500,  label: '500 Vàng' },
        { day: 2, item: 'eventToken', amount: 3,    label: '3 Lì xì' },
        { day: 3, item: 'diamonds',   amount: 10,   label: '10 Kim cương' },
        { day: 4, item: 'eventToken', amount: 5,    label: '5 Lì xì' },
        { day: 5, item: 'gold',       amount: 1000, label: '1000 Vàng' },
        { day: 6, item: 'eventToken', amount: 8,    label: '8 Lì xì' },
        { day: 7, item: 'diamonds',   amount: 50,   label: '50 Kim cương' },
        { day: 8, item: 'eventToken', amount: 5,    label: '5 Lì xì' },
        { day: 9, item: 'gold',       amount: 800,  label: '800 Vàng' },
        { day: 10, item: 'eventToken', amount: 10,  label: '10 Lì xì' },
        { day: 11, item: 'diamonds',  amount: 20,   label: '20 Kim cương' },
        { day: 12, item: 'eventToken', amount: 8,   label: '8 Lì xì' },
        { day: 13, item: 'gold',      amount: 1500, label: '1500 Vàng' },
        { day: 14, item: 'eventToken', amount: 15,  label: '15 Lì xì' },
        { day: 15, item: 'diamonds',  amount: 100,  label: '100 Kim cương 🎆' },
      ],

      // Items đổi bằng Lì xì
      exchangeItems: [
        {
          itemId: 'tet_gold_500',
          name: '500 Vàng',
          icon: '🪙',
          cost: 5,
          rewardType: 'gold',
          rewardAmount: 500,
          stock: -1,
          description: 'Đổi 5 Lì xì lấy 500 Vàng'
        },
        {
          itemId: 'tet_diamond_20',
          name: '20 Kim cương',
          icon: '💎',
          cost: 10,
          rewardType: 'diamonds',
          rewardAmount: 20,
          stock: -1,
          description: 'Đổi 10 Lì xì lấy 20 Kim cương'
        },
        {
          itemId: 'tet_gold_2000',
          name: '2000 Vàng',
          icon: '🪙',
          cost: 15,
          rewardType: 'gold',
          rewardAmount: 2000,
          stock: -1,
          description: 'Đổi 15 Lì xì lấy 2000 Vàng'
        },
        {
          itemId: 'tet_diamond_80',
          name: '80 Kim cương',
          icon: '💎',
          cost: 30,
          rewardType: 'diamonds',
          rewardAmount: 80,
          stock: -1,
          description: 'Đổi 30 Lì xì lấy 80 Kim cương'
        },
        {
          itemId: 'tet_diamond_200',
          name: '200 Kim cương 🎆',
          icon: '💎✨',
          cost: 60,
          rewardType: 'diamonds',
          rewardAmount: 200,
          stock: 50,
          description: 'Phần thưởng đặc biệt! Giới hạn 50 lần đổi'
        }
      ],

      conditions: {
        minLevel: 0
      }
    });

    await tetEvent.save();

    res.json({
      success: true,
      message: '🧧 Đã tạo sự kiện Tết Nguyên Đán 2026!',
      event: tetEvent
    });
  } catch (error) {
    console.error('❌ seedTetEvent error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

module.exports = {
  getActiveEvents,
  getEventDetail,
  claimLoginReward,
  exchangeReward,
  seedTetEvent
};
