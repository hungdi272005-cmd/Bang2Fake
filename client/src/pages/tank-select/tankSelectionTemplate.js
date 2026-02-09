/**
 * Tank Selection Template
 * UI cho trang chọn tank
 */

export function getTankSelectionTemplate(tanks, mode) {
  const isRanked = mode === 'ranked';
  const modeClass = isRanked ? 'ranked' : 'normal';
  
  const tankCardsHTML = tanks.map(tank => {
    const config = tank.config;
    const hpPercent = Math.min((config.stats.health / 1000) * 100, 100);
    const speedPercent = Math.min((config.stats.speed / 250) * 100, 100);
    
    return `
      <div class="tank-card" data-tank-id="${tank.id}">
        <div class="tank-icon">
            <img src="${tank.image}" alt="${config.name}" />
        </div>
        <h3 class="tank-name">${config.name}</h3>
        
        <div class="tank-stats">
          <div class="stat-row">
            <span class="stat-label">❤️ HP</span>
            <div class="stat-bar">
              <div class="stat-fill hp" style="width: ${hpPercent}%"></div>
            </div>
            <span class="stat-value">${config.stats.health}</span>
          </div>
          
          <div class="stat-row">
            <span class="stat-label">⚡ Speed</span>
            <div class="stat-bar">
              <div class="stat-fill speed" style="width: ${speedPercent}%"></div>
            </div>
            <span class="stat-value">${config.stats.speed}</span>
          </div>
        </div>
        
        <div class="tank-skills">
          <span class="skill-badge">Q</span>
          <span class="skill-badge">E</span>
          <span class="skill-badge">R</span>
          <span class="skill-badge">Space</span>
        </div>
        
        <div class="select-indicator">✓ Đã chọn</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="gradient-bg"></div>
    
    <div class="tank-select-container">
      <!-- Header -->
      <div class="select-header">
        <h1 class="select-title">⚔️ Chọn Tank</h1>
        <div class="countdown-display ${modeClass}">
          <span class="countdown-label">Còn lại:</span>
          <span class="countdown-value" id="countdown-value">30</span>
          <span class="countdown-unit">giây</span>
        </div>
      </div>
      
      <!-- Tank Cards -->
      <div class="tank-cards-grid">
        ${tankCardsHTML}
      </div>
      
      <!-- Confirm Button -->
      <button class="confirm-btn" id="confirm-tank-btn" disabled>
        🚀 Vào Trận
      </button>
      
      <!-- Tips -->
      <div class="select-tips">
        <p>💡 Click vào tank để xem thông tin và chọn. Nếu hết giờ sẽ tự động chọn ngẫu nhiên!</p>
      </div>
    </div>
  `;
}

/**
 * Cập nhật countdown
 */
export function updateCountdown(seconds) {
  const countdownElement = document.getElementById('countdown-value');
  if (countdownElement) {
    countdownElement.textContent = seconds;
    
    // Hiệu ứng warning khi còn ít giây
    if (seconds <= 10) {
      countdownElement.classList.add('warning');
    }
    if (seconds <= 5) {
      countdownElement.classList.add('critical');
    }
  }
}
