const express = require('express');
const router = express.Router();
const {
  getVipPackages,
  createOrder,
  sepayWebhook,
  manualApprove,
  getPaymentHistory,
  getPendingOrders
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/vip-packages', getVipPackages);
router.post('/sepay-webhook', sepayWebhook); // Sepay gọi webhook - xác thực bằng API Key

// Protected routes (yêu cầu đăng nhập)
router.post('/create-order', protect, createOrder);
router.get('/history', protect, getPaymentHistory);

// Admin routes (dùng để test/duyệt thủ công)
router.post('/manual-approve/:orderId', protect, manualApprove);
router.get('/pending-orders', protect, getPendingOrders);

module.exports = router;
