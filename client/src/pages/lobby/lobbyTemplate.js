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
      <button class="nav-tab">💎 Nạp lần đầu</button>
      <button class="nav-tab">📅 Điểm danh</button>
      <button class="nav-tab">🎁 Sự kiện</button>
    </div>

    <!-- Main Content -->
    <div class="lobby-main">
      <!-- Left Sidebar -->
      <div class="sidebar-left">
        <button class="wheel-btn">
          🎰<br/>Vòng<br/>quay thần<br/>bí
        </button>
      </div>

      <!-- Center Game Modes -->
      <div class="game-modes">
        <button class="game-mode-btn mode-reward">
          <span class="mode-title">Đánh thường</span>
        </button>
        <button class="game-mode-btn mode-ranked">
          <span class="mode-title">Đánh hảng</span>
        </button>
        <button class="game-mode-btn mode-practice">
          <span class="mode-title">Đấu tập</span>
        </button>
        <button class="game-mode-btn mode-dungeon">
          <span class="mode-title">Phụ bản</span>
        </button>
      </div>
    </div>

    <!-- Bottom Chat Section -->
    <div class="chat-section">
      <div class="chat-header">
        <span class="chat-title">Khung chat tổng</span>
        <div class="chat-tabs">
          <button class="chat-tab">Cửa hàng</button>
          <button class="chat-tab">Túi đồ</button>
          <button class="chat-tab">BảngNgọc</button>
          <button class="chat-tab">Trợ thủ</button>
        </div>
      </div>
    </div>
  `;
}
