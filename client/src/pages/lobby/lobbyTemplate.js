/**
 * Lobby Page Template
 */

export function getLobbyTemplate(user) {
  return `
    <div class="gradient-bg"></div>
    
    <!-- User Profile (Top Left) -->
    <div class="user-profile">
      <div class="profile-avatar">${user?.avatar === 'male' ? '👨' : user?.avatar === 'female' ? '👩' : '👤'}</div>
      <div class="profile-info">
        <div class="profile-name">${user?.displayName || user?.username || 'Player'}</div>
        <div class="profile-status">• Online</div>
      </div>
    </div>

    <!-- Logout Button (Top Right) -->
    <button class="logout-btn" id="logout-btn" onclick="window.handleLogout()">🚪 Đăng xuất</button>

    <!-- Top Navigation Tabs -->
    <div class="top-nav">
      <button class="nav-tab" id="nav-vip-btn">💎 Nạp vip</button>
      <button class="nav-tab" id="nav-checkin-btn">📅 Điểm danh</button>
      <button class="nav-tab" id="nav-event-btn">🎁 Sự kiện</button>
    </div>

    <!-- Currency Display -->
    <div class="lobby-currency">
      <div class="currency-item gold-item">
        <span class="currency-icon">🪙</span>
        <span class="currency-value">${new Intl.NumberFormat('vi-VN').format(user?.gold || 0)}</span>
        <button class="currency-add-btn">+</button>
      </div>
      <div class="currency-item diamond-item" id="lobby-diamond-display">
        <span class="currency-icon">💎</span>
        <span class="currency-value">${new Intl.NumberFormat('vi-VN').format(user?.diamonds || 0)}</span>
        <button class="currency-add-btn" id="add-diamond-btn">+</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="lobby-main">
      <!-- Left Sidebar - Wheel -->
      <div class="sidebar-left">
        <button class="wheel-btn">
          <div class="wheel-inner">
            <span style="font-size: 40px;">🎰</span>
            <span style="font-size: 14px;">Vòng quay</span>
          </div>
        </button>
      </div>

      <!-- Center Game Modes -->
      <div class="game-modes">
        <button class="game-mode-btn mode-reward" onclick="window.navigateToGameRoom('normal')">
          <span class="mode-title">Đánh thường</span>
        </button>
        <button class="game-mode-btn mode-ranked" onclick="window.navigateToGameRoom('ranked')">
          <span class="mode-title">Đánh hạng</span>
        </button>
        <button class="game-mode-btn mode-practice" onclick="window.navigateToGameRoom('practice')">
          <span class="mode-title">Đấu tập</span>
        </button>
        <button class="game-mode-btn mode-dungeon" onclick="window.navigateToGameRoom('dungeon')">
          <span class="mode-title">Phụ bản</span>
        </button>
      </div>

      </div>
    </div>

    <!-- Global Chat Section (Bottom Left) -->
    <div class="global-chat-container">
      <div class="chat-header">
        <span class="chat-title">💬 Kênh Thế Giới</span>
      </div>
      <div class="chat-messages" id="global-chat-messages">
        <div class="chat-message system-message">Chào mừng đến với BangBang!</div>
      </div>
      <div class="chat-input-area">
        <input type="text" id="global-chat-input" placeholder="Nhập tin nhắn..." maxlength="100">
        <button id="global-chat-send">Gửi</button>
      </div>
    </div>

    <!-- Bottom Right Buttons -->
    <div class="bottom-right-nav">
      <button class="nav-btn" id="shop-btn">🏪 Cửa hàng</button>
      <button class="nav-btn" id="tank-collection-btn">🔫 Tank</button>
      <button class="nav-btn">Túi đồ</button>
      <button class="nav-btn" id="rune-board-btn">💎 Bảng Ngọc</button>
      <button class="nav-btn">Trợ thủ</button>
    </div>
  `;
}
