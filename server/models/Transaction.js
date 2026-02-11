const mongoose = require('mongoose');

/**
 * Transaction Schema - Lưu lịch sử giao dịch nạp VIP
 */
const transactionSchema = new mongoose.Schema({
  // Người nạp
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Mã đơn hàng unique (VD: TBB_abc123)
  orderId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  // Số tiền (VND)
  amount: {
    type: Number,
    required: true,
    min: 1000
  },

  // Gói VIP đã mua
  vipPackage: {
    type: String,
    required: true,
    enum: ['vip1', 'vip2', 'vip3']
  },

  // Trạng thái giao dịch
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },

  // Thông tin từ Sepay webhook
  sepayTransactionId: {
    type: Number,
    default: null
  },
  sepayContent: {
    type: String,
    default: null
  },
  sepayReferenceCode: {
    type: String,
    default: null
  },

  // Phương thức thanh toán
  paymentMethod: {
    type: String,
    default: 'bank_transfer'
  },

  // Thông tin ngân hàng nhận
  bankInfo: {
    bankName: { type: String, default: 'BIDV' },
    accountNumber: { type: String, default: '96247770005' },
    accountName: { type: String, default: 'NGUYEN MANH HUNG' }
  },

  // Nội dung chuyển khoản (để người chơi ghi)
  transferContent: {
    type: String,
    required: true
  },

  // Thời gian hoàn thành
  completedAt: {
    type: Date,
    default: null
  },

  // Ghi chú admin (nếu duyệt thủ công)
  adminNote: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
transactionSchema.index({ userId: 1, createdAt: -1 });
// transactionSchema.index({ orderId: 1 }); // Đã có unique index ở schema definition
transactionSchema.index({ status: 1 });

// Tự động hết hạn đơn pending sau 30 phút
transactionSchema.index(
  { createdAt: 1 },
  { 
    expireAfterSeconds: 1800, // 30 phút
    partialFilterExpression: { status: 'pending' }
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
