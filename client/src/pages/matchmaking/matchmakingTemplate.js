/**
 * Matchmaking Template
 * UI cho trang chờ tìm trận
 */

export function getMatchmakingTemplate(mode) {
  const isRanked = mode === 'ranked';
  const modeText = isRanked ? 'Đánh Hạng' : 'Đánh Thường';
  const modeClass = isRanked ? 'ranked' : 'normal';
  
  return `
    <div class="gradient-bg"></div>
    
    <div class="matchmaking-container">
      <!-- Spinner Animation -->
      <div class="matchmaking-spinner ${modeClass}">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-icon">🎮</div>
      </div>
      
      <!-- Status Text -->
      <h2 class="matchmaking-status">Đang tìm trận...</h2>
      
      <!-- Timer -->
      <div class="matchmaking-timer">
        <span class="timer-label">Thời gian chờ:</span>
        <span class="timer-value" id="matchmaking-timer-value">00:00</span>
      </div>
      
      <!-- Mode Info -->
      <div class="matchmaking-mode ${modeClass}">
        <span class="mode-badge">${isRanked ? '⚔️' : '🎮'} ${modeText}</span>
        <span class="mode-type">1 vs 1</span>
      </div>
      
      <!-- Cancel Button -->
      <button class="cancel-btn" id="cancel-matchmaking-btn">
        ✕ Hủy tìm trận
      </button>
      
      <!-- Tips -->
      <div class="matchmaking-tips">
        <p>💡 Đang tìm đối thủ phù hợp với bạn...</p>
      </div>
    </div>
  `;
}

/**
 * Cập nhật timer hiển thị
 */
export function updateTimer(seconds) {
  const timerElement = document.getElementById('matchmaking-timer-value');
  if (timerElement) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerElement.textContent = `${mins}:${secs}`;
  }
}
