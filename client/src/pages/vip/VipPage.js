/**
 * VIP Page - Trang nạp VIP
 */

import { getUser, getToken } from '../../utils/auth.js';
import { navigateTo } from '../../utils/router.js';
import { getVipTemplate } from './vipTemplate.js';
import { initSocket } from '../../services/socket.js';

let currentSocket = null;

const API_URL = 'http://localhost:3000/api';

export function initVipPage() {
  const vipPage = document.getElementById('vip-page');
  const user = getUser();

  if (!user) {
    navigateTo('/landingpage');
    return;
  }

  vipPage.innerHTML = getVipTemplate(user);

  // Import CSS
  if (!document.getElementById('vip-css')) {
    const link = document.createElement('link');
    link.id = 'vip-css';
    link.rel = 'stylesheet';
    link.href = '/src/pages/vip/VipPage.css';
    document.head.appendChild(link);
  }

  // Nút quay lại
  document.getElementById('vip-back-btn').addEventListener('click', () => {
    navigateTo('/lobby');
  });

  // Nút mua VIP
  const buyBtns = vipPage.querySelectorAll('.vip-buy-btn');
  buyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const packageId = btn.dataset.package;
      handleBuyVip(packageId);
    });
  });

  // Click vào card cũng mở mua
  const cards = vipPage.querySelectorAll('.vip-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const packageId = card.dataset.package;
      handleBuyVip(packageId);
    });
  });

  console.log('✅ VIP page initialized');
}

/**
 * Xử lý mua VIP - Gọi API tạo đơn hàng rồi mở modal thanh toán
 */
async function handleBuyVip(packageId) {
  try {
    const token = getToken();
    if (!token) {
      alert('Vui lòng đăng nhập lại');
      navigateTo('/landingpage');
      return;
    }

    // Gọi API tạo đơn hàng
    const response = await fetch(`${API_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ vipPackage: packageId })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Không thể tạo đơn hàng');
      return;
    }

    // Mở modal thanh toán
    openPaymentModal(data.order);

  } catch (error) {
    console.error('Buy VIP error:', error);
    alert('Lỗi kết nối server. Vui lòng thử lại.');
  }
}

/**
 * Mở modal thanh toán với thông tin đơn hàng
 */
function openPaymentModal(order) {
  const modal = document.getElementById('payment-modal');
  modal.style.display = 'flex';

  // Điền thông tin gói
  const packageInfo = document.getElementById('payment-package-info');
  packageInfo.innerHTML = `
    <div class="pkg-name">${order.packageInfo.name}</div>
    <div class="pkg-diamonds">+${order.packageInfo.diamonds} 💎 kim cương</div>
  `;

  // Điền thông tin bank
  document.getElementById('bank-name').textContent = order.bankInfo.bankName;
  document.getElementById('bank-account').textContent = order.bankInfo.accountNumber;
  document.getElementById('bank-holder').textContent = order.bankInfo.accountName;
  document.getElementById('bank-amount').textContent = formatMoney(order.amount);
  document.getElementById('bank-content').textContent = order.transferContent;

  // Tạo QR Code qua VietQR API
  const qrContainer = document.getElementById('payment-qr');
  const bankBin = '970418'; // BIN BIDV
  const qrUrl = `https://img.vietqr.io/image/${bankBin}-${order.bankInfo.accountNumber}-compact.png?amount=${order.amount}&addInfo=${order.transferContent}&accountName=${encodeURIComponent(order.bankInfo.accountName)}`;
  qrContainer.innerHTML = `
    <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 8px;">Quét QR để thanh toán nhanh</p>
    <img src="${qrUrl}" alt="QR Code thanh toán" onerror="this.style.display='none'" />
  `;

  // Reset trạng thái
  const statusEl = document.getElementById('payment-status');
  statusEl.innerHTML = `
    <div class="status-pending">
      <div class="spinner-large"></div>
      <p>Đang chờ thanh toán...</p>
    </div>
  `;

  // Copy khi click vào số tài khoản hoặc nội dung
  const copyables = modal.querySelectorAll('.copyable');
  copyables.forEach(el => {
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(el.textContent).then(() => {
        const original = el.textContent;
        el.textContent = '✅ Đã copy!';
        el.style.color = '#4ade80';
        setTimeout(() => {
          el.textContent = original;
          el.style.color = '';
        }, 1500);
      });
    });
  });

  // Đóng modal
  document.getElementById('payment-close-btn').addEventListener('click', () => {
    closePaymentModal();
  });

  // Click bên ngoài để đóng
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePaymentModal();
    }
  });

  // Bắt đầu polling kiểm tra trạng thái đơn hàng (Fallback)
  startOrderPolling(order.orderId);

  // 🔥 Lắng nghe Socket.IO (Real-time)
  setupSocketListener(order.orderId);
}

/**
 * Đóng modal thanh toán
 */
function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  modal.style.display = 'none';
  
  // Dừng polling
  if (window._vipPollingInterval) {
    clearInterval(window._vipPollingInterval);
    window._vipPollingInterval = null;
  }

  // Hủy socket listener
  if (currentSocket) {
    currentSocket.off('payment_success');
  }
}

/**
 * Polling kiểm tra trạng thái đơn hàng mỗi 5 giây
 */
function startOrderPolling(orderId) {
  // Xóa polling cũ
  if (window._vipPollingInterval) {
    clearInterval(window._vipPollingInterval);
  }

  window._vipPollingInterval = setInterval(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/payment/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) return;

      // Tìm đơn hàng hiện tại
      const order = data.transactions.find(t => t.orderId === orderId);

      if (order && order.status === 'completed') {
        // 🎉 Thanh toán thành công!
        handlePaymentSuccess({
           vipLevel: order.packageInfo.vipLevel,
           diamonds: order.packageInfo.diamonds
        });
      }
    } catch (error) {
      // Lỗi mạng - bỏ qua, sẽ thử lại lần sau
    }
  }, 10000); // Fallback: Poll mỗi 10 giây (vì đã có socket)
}

/**
 * Lắng nghe sự kiện thanh toán thành công qua Socket.IO
 */
function setupSocketListener(orderId) {
  currentSocket = initSocket();
  
  if (!currentSocket) return;
  
  console.log('🎧 VIP Page: Listening for payment_success...');
  
  // Xóa listener cũ
  currentSocket.off('payment_success');
  
  currentSocket.on('payment_success', (data) => {
    console.log('⚡ Received payment_success:', data);
    
    if (data.orderId === orderId) {
      handlePaymentSuccess(data);
    }
  });
}

/**
 * Xử lý khi thanh toán thành công (dùng chung cho Socket & Polling)
 */
function handlePaymentSuccess(orderData) {
    // Dừng polling và socket
    if (window._vipPollingInterval) {
        clearInterval(window._vipPollingInterval);
        window._vipPollingInterval = null;
    }
    if (currentSocket) currentSocket.off('payment_success');

    // Cập nhật UI modal
    const statusEl = document.getElementById('payment-status');
    if (statusEl) {
        statusEl.innerHTML = `
        <div class="status-success" style="animation: fadeIn 0.5s ease;">
            <div style="font-size: 40px; margin-bottom: 10px;">🎉</div>
            <h3 style="color: #4ade80; margin: 0;">Nạp VIP thành công!</h3>
            <p style="color: rgba(255,255,255,0.7); margin-top: 5px;">
            Chúc mừng bạn đã nhận được quyền lợi VIP
            </p>
        </div>
        `;
    }

    // Cập nhật localStorage ngay lập tức
    const user = getUser(); // Lấy user từ localStorage
    if (user && orderData) {
        // Cập nhật nếu dữ liệu mới hơn
        if (orderData.vipLevel > (user.vipLevel || 0)) user.vipLevel = orderData.vipLevel;
        user.diamonds = (user.diamonds || 0) + (orderData.diamonds || 0);
        // Lưu lại
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Reload trang sau 3s
    setTimeout(() => {
        closePaymentModal();
        window.location.reload(); 
    }, 3000);
}

/**
 * Format số tiền VND
 */
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}
