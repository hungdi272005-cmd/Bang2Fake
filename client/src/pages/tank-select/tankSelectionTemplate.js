/**
 * Tank Selection Template - UI 3 cột (Ta | Grid Tank | Địch)
 * Thiết kế giống reference image với theme battle xanh dương
 */

/**
 * Tạo HTML cho trang chọn tank
 * @param {Array} tanks - Danh sách tank configs
 * @param {Object} matchData - { sessionId, opponent }
 * @param {string} myName - Tên hiển thị của mình
 */
export function getTankSelectionTemplate(tanks, matchData, myName) {
  const opponentName = matchData?.opponent?.displayName || matchData?.opponent?.username || '???';
  
  // Tạo tank cards HTML
  const tankCardsHTML = tanks.map(tank => {
    const config = tank.config;
    return `
      <div class="ts-tank-card" data-tank-id="${tank.id}">
        <img class="ts-tank-card-img" src="${tank.image}" alt="${config.name}" />
        <div class="ts-tank-card-name">${config.name}</div>
        <div class="ts-tank-card-role">${tank.role || 'DPS'}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="tank-select-container">
      <!-- HEADER -->
      <div class="ts-header">
        <div class="ts-header-title">⚔️ CHỌN TANK <span>(1v1)</span></div>
        <div class="ts-countdown">
          <span class="ts-countdown-label">Thời gian:</span>
          <span class="ts-countdown-value" id="ts-countdown">30</span>
        </div>
      </div>

      <!-- MAIN 3-COLUMN LAYOUT -->
      <div class="ts-main">
        
        <!-- LEFT PANEL: Ta -->
        <div class="ts-panel-left">
          <div class="ts-panel-title">🔵 Ta</div>
          
          <!-- Player slot -->
          <div class="ts-player-slot" id="my-player-slot">
            <div class="ts-player-avatar">🎮</div>
            <div class="ts-player-info">
              <div class="ts-player-name">${myName}</div>
              <div class="ts-player-tank" id="my-tank-label">Chưa chọn tank</div>
            </div>
          </div>

          <!-- Tank preview -->
          <div class="ts-tank-preview" id="my-tank-preview">
            <div class="tank-unknown">❓</div>
          </div>

          <!-- Stats -->
          <div class="ts-tank-details" id="my-tank-details">
            <div class="ts-detail-stats">
              <div class="ts-stat-row">
                <span class="ts-stat-label">HP</span>
                <div class="ts-stat-bar"><div class="ts-stat-fill hp" id="my-stat-hp" style="width: 0%"></div></div>
              </div>
              <div class="ts-stat-row">
                <span class="ts-stat-label">SPD</span>
                <div class="ts-stat-bar"><div class="ts-stat-fill spd" id="my-stat-spd" style="width: 0%"></div></div>
              </div>
              <div class="ts-stat-row">
                <span class="ts-stat-label">ATK</span>
                <div class="ts-stat-bar"><div class="ts-stat-fill atk" id="my-stat-atk" style="width: 0%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- CENTER: Tank Grid -->
        <div class="ts-center">
          <!-- Category tabs -->
          <div class="ts-category-tabs">
            <button class="ts-category-tab active" data-category="all">ALL</button>
            <button class="ts-category-tab" data-category="dps">DPS</button>
            <button class="ts-category-tab" data-category="tanker">TANKER</button>
            <button class="ts-category-tab" data-category="support">SUPPORT</button>
          </div>

          <!-- Tank grid -->
          <div class="ts-tank-grid" id="ts-tank-grid">
            ${tankCardsHTML}
          </div>
        </div>

        <!-- RIGHT PANEL: Địch -->
        <div class="ts-panel-right">
          <div class="ts-panel-title">🔴 Địch</div>
          
          <!-- Opponent slot -->
          <div class="ts-player-slot" id="opponent-player-slot">
            <div class="ts-player-avatar">⚔️</div>
            <div class="ts-player-info">
              <div class="ts-player-name">${opponentName}</div>
              <div class="ts-player-tank" id="opponent-tank-label">Chưa chọn tank</div>
            </div>
          </div>

          <!-- Opponent tank preview -->
          <div class="ts-tank-preview" id="opponent-tank-preview">
            <div class="tank-unknown">❓</div>
          </div>

          <!-- Opponent ready status -->
          <div style="padding: 8px; text-align: center;">
            <span class="ts-player-ready-badge waiting" id="opponent-ready-badge">Đang chọn...</span>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="ts-footer">
        <button class="ts-cancel-btn" id="ts-cancel-btn">✕ Thoát</button>
        <button class="ts-ready-btn" id="ts-ready-btn" disabled>🚀 ĐÃ XUẤT CHIẾN</button>
      </div>
    </div>
  `;
}

/**
 * Cập nhật countdown
 */
export function updateCountdown(seconds) {
  const el = document.getElementById('ts-countdown');
  if (!el) return;
  
  el.textContent = seconds;
  
  if (seconds <= 10) {
    el.classList.add('warning');
  }
  if (seconds <= 5) {
    el.classList.add('critical');
  }
}
