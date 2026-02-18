const User = require('../models/User');

/**
 * @route   GET /api/friends/search
 * @desc    Search users by displayName
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập ít nhất 2 ký tự' });
    }

    // Tìm user theo displayName, loại bỏ bản thân và những người đã là bạn
    const users = await User.find({
      displayName: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id, $nin: req.user.friends }
    }).select('username displayName avatar vipLevel').limit(10);

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm' });
  }
};

/**
 * @route   POST /api/friends/request
 * @desc    Send a friend request
 * @access  Private
 */
const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Không thể tự kết bạn với chính mình' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra đã là bạn chưa
    if (targetUser.friends.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Đã là bạn bè rồi' });
    }

    // Kiểm tra đã gửi request chưa
    const existingRequest = targetUser.friendRequests.find(r => r.from.toString() === req.user.id && r.status === 'pending');
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Đã gửi lời mời kết bạn trước đó' });
    }

    targetUser.friendRequests.push({ from: req.user.id, status: 'pending' });
    await targetUser.save();

    // Thông báo cho target user qua socket nếu đang online
    if (req.io) {
      req.io.to(`user:${targetUserId}`).emit('friend_request', {
        from: {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName
        }
      });
    }

    res.status(200).json({ success: true, message: 'Đã gửi lời mời kết bạn' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi gửi lời mời' });
  }
};

/**
 * @route   POST /api/friends/respond
 * @desc    Accept or reject a friend request
 * @access  Private
 */
const respondToFriendRequest = async (req, res) => {
  try {
    const { fromUserId, action } = req.body; // action: 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Hành động không hợp lệ' });
    }

    const user = await User.findById(req.user.id);
    const requestIndex = user.friendRequests.findIndex(r => r.from.toString() === fromUserId && r.status === 'pending');

    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lời mời kết bạn' });
    }

    if (action === 'accepted') {
      user.friendRequests[requestIndex].status = 'accepted';
      user.friends.push(fromUserId);
      await user.save();

      // Thêm mình vào danh sách bạn của người kia
      const fromUser = await User.findById(fromUserId);
      fromUser.friends.push(req.user.id);
      await fromUser.save();

      // Thông báo cho người gửi qua socket
      if (req.io) {
        req.io.to(`user:${fromUserId}`).emit('friend_request_accepted', {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName
        });
      }
    } else {
      user.friendRequests[requestIndex].status = 'rejected';
      await user.save();
    }

    res.status(200).json({ success: true, message: action === 'accepted' ? 'Đã chấp nhận lời mời' : 'Đã từ chối lời mời' });
  } catch (error) {
    console.error('Respond friend request error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi phản hồi lời mời' });
  }
};

/**
 * @route   GET /api/friends
 * @desc    Get friend list
 * @access  Private
 */
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username displayName avatar vipLevel lastLogin');
    res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách bạn bè' });
  }
};

/**
 * @route   GET /api/friends/requests
 * @desc    Get pending friend requests
 * @access  Private
 */
const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'friendRequests.from',
      select: 'username displayName avatar vipLevel'
    });
    
    // Lấy các lời mời có trạng thái pending
    const pendingRequests = user.friendRequests.filter(r => r.status === 'pending');
    res.status(200).json({ success: true, requests: pendingRequests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách lời mời' });
  }
};

module.exports = {
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  getFriendRequests
};
