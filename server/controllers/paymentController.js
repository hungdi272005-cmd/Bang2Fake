const Transaction = require('../models/Transaction');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Danh sách gói VIP
 */
const VIP_PACKAGES = {
  vip1: {
    name: 'VIP 1 — Tân Thủ',
    price: 20000,
    diamonds: 100,
    vipLevel: 1,
    benefits: ['Khung tên vàng', '100 kim cương', 'Hiệu ứng đăng nhập']
  },
  vip2: {
    name: 'VIP 2 — Chiến Binh',
    price: 200000,
    diamonds: 300,
    vipLevel: 2,
    benefits: ['Khung tên xanh', '300 kim cương', 'Skin tank đặc biệt', 'Biểu tượng VIP']
  },
  vip3: {
    name: 'VIP 3 — Huyền Thoại',
    price: 2000000,
    diamonds: 800,
    vipLevel: 3,
    benefits: ['Khung tên đỏ', '800 kim cương', 'Tank độc quyền', 'Damage +5%', 'Ưu tiên vào phòng']
  }
};

/**
 * Thông tin ngân hàng nhận tiền
 */
const BANK_INFO = {
  bankName: 'BIDV',
  accountNumber: '96247770005',
  accountName: 'NGUYEN MANH HUNG'
};

/**
 * Tạo mã đơn hàng unique
 */
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TBB${timestamp}${random}`;
}

/**
 * @route   GET /api/payment/vip-packages
 * @desc    Lấy danh sách gói VIP
 * @access  Public
 */
const getVipPackages = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      packages: VIP_PACKAGES,
      bankInfo: BANK_INFO
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * @route   POST /api/payment/create-order
 * @desc    Tạo đơn hàng nạp VIP
 * @access  Private (yêu cầu đăng nhập)
 */
const createOrder = async (req, res) => {
  try {
    const { vipPackage } = req.body;
    const userId = req.user._id;

    // Kiểm tra gói VIP hợp lệ
    if (!VIP_PACKAGES[vipPackage]) {
      return res.status(400).json({
        success: false,
        message: 'Gói VIP không hợp lệ'
      });
    }

    const pkg = VIP_PACKAGES[vipPackage];

    // Kiểm tra nếu user đã có VIP level cao hơn hoặc bằng
    const user = await User.findById(userId);
    if (user.vipLevel >= pkg.vipLevel) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã là VIP ${user.vipLevel}, không thể mua gói thấp hơn`
      });
    }

    // Kiểm tra đơn pending cũ
    const existingOrder = await Transaction.findOne({
      userId,
      status: 'pending'
    });

    if (existingOrder) {
      // Trả về đơn cũ thay vì tạo mới
      return res.status(200).json({
        success: true,
        message: 'Bạn đã có đơn hàng đang chờ thanh toán',
        order: {
          orderId: existingOrder.orderId,
          amount: existingOrder.amount,
          vipPackage: existingOrder.vipPackage,
          packageInfo: VIP_PACKAGES[existingOrder.vipPackage],
          transferContent: existingOrder.transferContent,
          bankInfo: BANK_INFO,
          createdAt: existingOrder.createdAt
        }
      });
    }

    // Tạo mã đơn hàng
    const orderId = generateOrderId();
    const transferContent = orderId; // Nội dung chuyển khoản = mã đơn

    // Tạo giao dịch mới
    const transaction = await Transaction.create({
      userId,
      orderId,
      amount: pkg.price,
      vipPackage,
      transferContent,
      bankInfo: BANK_INFO
    });

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo',
      order: {
        orderId: transaction.orderId,
        amount: transaction.amount,
        vipPackage,
        packageInfo: pkg,
        transferContent,
        bankInfo: BANK_INFO,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn hàng',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/payment/sepay-webhook
 * @desc    Nhận webhook từ Sepay khi có giao dịch mới
 * @access  Public (xác thực bằng API Key)
 * 
 * Sepay gửi POST request với body:
 * {
 *   id: 12345,
 *   transferType: "in",
 *   content: "TBB...",
 *   transferAmount: 50000,
 *   code: "TBB...",
 *   referenceCode: "FT123456",
 *   transactionDate: "2026-02-11 08:00:00"
 * }
 */
const sepayWebhook = async (req, res) => {
  try {
    // Xác thực API Key từ Sepay
    const apiKey = req.headers['authorization'];
    const expectedKey = `Apikey ${process.env.SEPAY_API_KEY}`;

    if (!process.env.SEPAY_API_KEY || apiKey !== expectedKey) {
      console.warn('⚠️ Webhook bị từ chối: API Key không hợp lệ');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      id: sepayTransactionId,
      transferType,
      content,
      transferAmount,
      code,
      referenceCode,
      transactionDate
    } = req.body;

    console.log('📩 Nhận webhook từ Sepay:', { sepayTransactionId, transferType, content, transferAmount, code });

    // Chỉ xử lý giao dịch tiền VÀO
    if (transferType !== 'in') {
      return res.status(200).json({ success: true, message: 'Bỏ qua giao dịch tiền ra' });
    }

    // Tìm mã đơn hàng trong nội dung chuyển khoản
    // Sepay có thể gửi qua field 'code' hoặc trong 'content'
    let orderCode = code;
    if (!orderCode && content) {
      // Tìm mã TBB trong nội dung
      const match = content.match(/TBB[A-Z0-9]+/i);
      if (match) {
        orderCode = match[0].toUpperCase();
      }
    }

    if (!orderCode) {
      console.log('⚠️ Không tìm thấy mã đơn hàng trong giao dịch');
      return res.status(200).json({ success: true, message: 'Không tìm thấy mã đơn hàng' });
    }

    // Tìm đơn hàng pending
    const transaction = await Transaction.findOne({
      orderId: orderCode.toUpperCase(),
      status: 'pending'
    });

    if (!transaction) {
      console.log(`⚠️ Không tìm thấy đơn hàng pending: ${orderCode}`);
      return res.status(200).json({ success: true, message: 'Đơn hàng không tồn tại hoặc đã xử lý' });
    }

    // Kiểm tra số tiền
    if (transferAmount < transaction.amount) {
      console.log(`⚠️ Số tiền không đủ: nhận ${transferAmount}, cần ${transaction.amount}`);
      return res.status(200).json({ success: true, message: 'Số tiền không khớp' });
    }

    // ✅ Hoàn thành giao dịch
    const user = await completeTransaction(transaction, {
      sepayTransactionId,
      sepayContent: content,
      sepayReferenceCode: referenceCode
    });

    console.log(`✅ Nạp VIP thành công! User: ${transaction.userId}, Gói: ${transaction.vipPackage}`);

    // 🔥 Socket.io: Thông báo cho client ngay lập tức
    if (req.io) {
      req.io.to(`user:${transaction.userId}`).emit('payment_success', {
        orderId: transaction.orderId,
        vipPackage: transaction.vipPackage,
        diamonds: VIP_PACKAGES[transaction.vipPackage].diamonds,
        vipLevel: VIP_PACKAGES[transaction.vipPackage].vipLevel
      });
      console.log(`📡 Đã gửi socket event payment_success tới user:${transaction.userId}`);
    }

    res.status(200).json({ success: true, message: 'Xử lý thành công' });
  } catch (error) {
    console.error('Webhook error:', error);
    // Luôn trả 200 để Sepay không retry liên tục
    res.status(200).json({ success: false, message: 'Lỗi xử lý' });
  }
};

/**
 * Hoàn thành giao dịch: cập nhật trạng thái + cộng VIP cho user
 */
async function completeTransaction(transaction, sepayData = {}) {
  const pkg = VIP_PACKAGES[transaction.vipPackage];

  // 1. Cập nhật trạng thái giao dịch
  transaction.status = 'completed';
  transaction.completedAt = new Date();
  if (sepayData.sepayTransactionId) transaction.sepayTransactionId = sepayData.sepayTransactionId;
  if (sepayData.sepayContent) transaction.sepayContent = sepayData.sepayContent;
  if (sepayData.sepayReferenceCode) transaction.sepayReferenceCode = sepayData.sepayReferenceCode;
  await transaction.save();

  // 2. Cộng VIP + kim cương cho user
  const user = await User.findById(transaction.userId);
  if (user) {
    // Chỉ nâng VIP level nếu gói mới cao hơn
    if (pkg.vipLevel > user.vipLevel) {
      user.vipLevel = pkg.vipLevel;
    }
    user.diamonds += pkg.diamonds;
    user.totalDeposited += transaction.amount;
    await user.save();
  }

  return user;
}

/**
 * @route   POST /api/payment/manual-approve/:orderId
 * @desc    Duyệt đơn hàng thủ công (cho admin/testing)
 * @access  Private
 */
const manualApprove = async (req, res) => {
  try {
    const { orderId } = req.params;

    const transaction = await Transaction.findOne({
      orderId: orderId.toUpperCase(),
      status: 'pending'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng pending'
      });
    }

    // Hoàn thành giao dịch
    const user = await completeTransaction(transaction, {
      sepayContent: 'MANUAL_APPROVE'
    });
    transaction.adminNote = `Duyệt thủ công bởi admin lúc ${new Date().toLocaleString('vi-VN')}`;
    await transaction.save();

    // 🔥 Socket.io: Thông báo cho client ngay lập tức
    if (req.io) {
      req.io.to(`user:${transaction.userId}`).emit('payment_success', {
        orderId: transaction.orderId,
        vipPackage: transaction.vipPackage,
        diamonds: VIP_PACKAGES[transaction.vipPackage].diamonds,
        vipLevel: VIP_PACKAGES[transaction.vipPackage].vipLevel
      });
      console.log(`📡 Đã gửi socket event payment_success tới user:${transaction.userId}`);
    }

    const pkg = VIP_PACKAGES[transaction.vipPackage];

    res.status(200).json({
      success: true,
      message: `✅ Đã duyệt! User ${user.username} nâng lên VIP ${pkg.vipLevel}, +${pkg.diamonds} 💎`,
      transaction: {
        orderId: transaction.orderId,
        amount: transaction.amount,
        vipPackage: transaction.vipPackage,
        status: transaction.status,
        completedAt: transaction.completedAt
      },
      user: {
        username: user.username,
        vipLevel: user.vipLevel,
        diamonds: user.diamonds,
        totalDeposited: user.totalDeposited
      }
    });
  } catch (error) {
    console.error('Manual approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/payment/history
 * @desc    Xem lịch sử nạp VIP
 * @access  Private
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      transactions: transactions.map(t => ({
        orderId: t.orderId,
        amount: t.amount,
        vipPackage: t.vipPackage,
        packageInfo: VIP_PACKAGES[t.vipPackage],
        status: t.status,
        createdAt: t.createdAt,
        completedAt: t.completedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * @route   GET /api/payment/pending-orders
 * @desc    Xem danh sách đơn đang chờ (cho admin duyệt)
 * @access  Private
 */
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Transaction.find({ status: 'pending' })
      .populate('userId', 'username displayName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders.map(o => ({
        orderId: o.orderId,
        amount: o.amount,
        vipPackage: o.vipPackage,
        packageInfo: VIP_PACKAGES[o.vipPackage],
        transferContent: o.transferContent,
        user: o.userId,
        createdAt: o.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getVipPackages,
  createOrder,
  sepayWebhook,
  manualApprove,
  getPaymentHistory,
  getPendingOrders
};
