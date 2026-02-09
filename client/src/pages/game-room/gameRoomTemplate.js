/**
 * Game Room Template
 * UI cho trang chờ tìm trận
 */

export function getGameRoomTemplate(mode) {
  const isRanked = mode === 'ranked';
  const modeTitle = isRanked ? '⚔️ Đánh Hạng' : '🎮 Đánh Thường';
  const modeDesc = isRanked 
    ? 'Trận đấu xếp hạng 1v1. Chiến thắng để leo rank!' 
    : 'Trận đấu thường 1v1. Luyện tập và vui chơi!';
  const modeClass = isRanked ? 'ranked' : 'normal';
  
  return `
    <div class="gradient-bg"></div>
    
    <div class="game-room-container">
      <!-- Header -->
      <div class="room-header">
        <button class="back-btn" id="back-to-lobby-btn">
          ← Quay lại
        </button>
        <h1 class="room-title">${modeTitle}</h1>
      </div>

      <!-- Mode Info Card -->
      <div class="mode-card ${modeClass}">
        <div class="mode-icon">${isRanked ? '🏆' : '⚡'}</div>
        <div class="mode-info">
          <h2 class="mode-name">${isRanked ? 'Chế độ Xếp hạng' : 'Chế độ Thường'}</h2>
          <p class="mode-description">${modeDesc}</p>
        </div>
        
        <div class="mode-details">
          <div class="detail-item">
            <span class="detail-icon">👥</span>
            <span class="detail-text">1 vs 1</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">⏱️</span>
            <span class="detail-text">~3-5 phút/trận</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🎯</span>
            <span class="detail-text">Tiêu diệt đối thủ</span>
          </div>
        </div>
      </div>

      <!-- Find Match Button -->
      <button class="find-match-btn ${modeClass}" id="find-match-btn">
        <span class="btn-icon">🔍</span>
        <span class="btn-text">Tìm Trận</span>
      </button>
      
      <!-- Tips -->
      <div class="room-tips">
        <p>💡 Mẹo: Sau khi tìm được trận, bạn sẽ chọn tank để chiến đấu!</p>
      </div>
    </div>
  `;
}
