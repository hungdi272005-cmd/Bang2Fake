/**
 * VIP Page Template - Giao diện nạp VIP premium
 */

export function getVipTemplate(user) {
  return `
    <div class="gradient-bg"></div>
    
    <!-- Header -->
    <div class="vip-header">
      <button class="vip-back-btn" id="vip-back-btn">← Quay lại</button>
      <h1 class="vip-title">💎 Nạp VIP</h1>
      <div class="vip-user-info">
        <span class="vip-user-diamonds">💎 ${user?.diamonds || 0}</span>
        <span class="vip-user-level ${user?.vipLevel > 0 ? 'vip-active' : ''}">
          ${user?.vipLevel > 0 ? `⭐ VIP ${user.vipLevel}` : 'Chưa VIP'}
        </span>
      </div>
    </div>

    <!-- VIP Packages -->
    <div class="vip-packages">
      <!-- VIP 1 -->
      <div class="vip-card vip-card-1" data-package="vip1">
        <div class="vip-card-badge">CƠ BẢN</div>
        <div class="vip-card-icon">🥉</div>
        <h2 class="vip-card-name">VIP 1</h2>
        <p class="vip-card-subtitle">Tân Thủ</p>
        <div class="vip-card-price">20,000đ</div>
        <ul class="vip-card-benefits">
          <li>✅ Khung tên <span class="text-gold">vàng</span></li>
          <li>✅ 100 💎 kim cương</li>
          <li>✅ Hiệu ứng đăng nhập</li>
        </ul>
        <button class="vip-buy-btn" data-package="vip1">Mua ngay</button>
      </div>

      <!-- VIP 2 -->
      <div class="vip-card vip-card-2" data-package="vip2">
        <div class="vip-card-badge vip-badge-hot">🔥 PHỔ BIẾN</div>
        <div class="vip-card-icon">🥈</div>
        <h2 class="vip-card-name">VIP 2</h2>
        <p class="vip-card-subtitle">Chiến Binh</p>
        <div class="vip-card-price">200,000đ</div>
        <ul class="vip-card-benefits">
          <li>✅ Khung tên <span class="text-blue">xanh</span></li>
          <li>✅ 300 💎 kim cương</li>
          <li>✅ Skin tank đặc biệt</li>
          <li>✅ Biểu tượng VIP</li>
        </ul>
        <button class="vip-buy-btn vip-buy-hot" data-package="vip2">Mua ngay</button>
      </div>

      <!-- VIP 3 -->
      <div class="vip-card vip-card-3" data-package="vip3">
        <div class="vip-card-badge vip-badge-legend">👑 CAO CẤP</div>
        <div class="vip-card-icon">🥇</div>
        <h2 class="vip-card-name">VIP 3</h2>
        <p class="vip-card-subtitle">Huyền Thoại</p>
        <div class="vip-card-price">2,000,000đ</div>
        <ul class="vip-card-benefits">
          <li>✅ Khung tên <span class="text-red">đỏ</span></li>
          <li>✅ 800 💎 kim cương</li>
          <li>✅ Tank độc quyền</li>
          <li>✅ Damage +5%</li>
          <li>✅ Ưu tiên vào phòng</li>
        </ul>
        <button class="vip-buy-btn vip-buy-legend" data-package="vip3">Mua ngay</button>
      </div>
    </div>

    <!-- Payment Modal (ẩn mặc định) -->
    <div class="payment-modal" id="payment-modal" style="display:none;">
      <div class="payment-modal-content">
        <button class="payment-close-btn" id="payment-close-btn">✕</button>
        
        <h2 class="payment-title">💳 Thanh toán</h2>
        
        <div class="payment-package-info" id="payment-package-info">
          <!-- Thông tin gói sẽ được điền bằng JS -->
        </div>

        <div class="payment-bank-info">
          <h3>Thông tin chuyển khoản</h3>
          <div class="bank-detail">
            <span class="bank-label">Ngân hàng</span>
            <span class="bank-value" id="bank-name">BIDV</span>
          </div>
          <div class="bank-detail">
            <span class="bank-label">Số tài khoản</span>
            <span class="bank-value copyable" id="bank-account">96247770005</span>
          </div>
          <div class="bank-detail">
            <span class="bank-label">Chủ tài khoản</span>
            <span class="bank-value" id="bank-holder">NGUYEN MANH HUNG</span>
          </div>
          <div class="bank-detail">
            <span class="bank-label">Số tiền</span>
            <span class="bank-value text-gold" id="bank-amount">0đ</span>
          </div>
          <div class="bank-detail bank-detail-important">
            <span class="bank-label">Nội dung CK</span>
            <span class="bank-value copyable" id="bank-content">---</span>
          </div>
        </div>

        <div class="payment-qr" id="payment-qr">
          <!-- QR Code sẽ được tạo bằng VietQR API -->
        </div>

        <div class="payment-note">
          <p>⚠️ <strong>Quan trọng:</strong> Ghi đúng nội dung chuyển khoản để hệ thống tự động xác nhận.</p>
          <p>⏱️ Đơn hàng sẽ hết hạn sau <strong>30 phút</strong>.</p>
        </div>

        <div class="payment-status" id="payment-status">
          <div class="status-pending">
            <div class="spinner-large"></div>
            <p>Đang chờ thanh toán...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
