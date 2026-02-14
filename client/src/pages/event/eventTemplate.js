/**
 * Event Page Template - Phần HTML của trang sự kiện
 * Tách riêng khỏi EventPage.js để dễ quản lý
 */

/**
 * Template particles trang trí
 */
function getParticlesHTML() {
  return `
    <div class="event-particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>
  `;
}

/**
 * Template loading
 */
export function getLoadingTemplate() {
  return `
    <button class="event-back-btn" id="event-back-btn">← Quay lại</button>
    <div class="event-loading">
      <span class="spinner">🧧</span>
      Đang tải sự kiện...
    </div>
    ${getParticlesHTML()}
  `;
}

/**
 * Template lỗi
 */
export function getErrorTemplate(errorMessage) {
  return `
    <button class="event-back-btn" id="event-back-btn">← Quay lại</button>
    <div class="event-loading" style="color: #fca5a5;">
      ❌ ${errorMessage}
    </div>
  `;
}

/**
 * Template trang trống (không có event)
 */
export function getEmptyTemplate() {
  return `
    <button class="event-back-btn" id="event-back-btn">← Quay lại</button>
    <div class="event-empty">
      <div class="event-empty-icon">🎁</div>
      <div class="event-empty-text">Hiện chưa có sự kiện nào</div>
    </div>
  `;
}

/**
 * Template trang event chính
 */
export function getEventPageTemplate(event, progress, meta) {
  return `
    <button class="event-back-btn" id="event-back-btn">← Quay lại</button>
    
    ${getParticlesHTML()}

    <div class="event-container">
      <!-- Header -->
      <div class="event-header">
        <div class="event-banner">${event.icon || '🧧'}</div>
        <h1 class="event-title">${event.name}</h1>
        <p class="event-description">${event.description}</p>
        
        <!-- Countdown -->
        <div class="event-countdown" id="event-countdown">
          <div class="countdown-item">
            <span class="countdown-value" id="cd-days">--</span>
            <span class="countdown-label">Ngày</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value" id="cd-hours">--</span>
            <span class="countdown-label">Giờ</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value" id="cd-mins">--</span>
            <span class="countdown-label">Phút</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value" id="cd-secs">--</span>
            <span class="countdown-label">Giây</span>
          </div>
        </div>

        <!-- Token display -->
        <div style="text-align: center;">
          <div class="event-token-display">
            <span class="event-token-icon">${event.tokenIcon}</span>
            <span class="event-token-label">${event.tokenName}:</span>
            <span class="event-token-count" id="event-token-count">${progress.eventTokens}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="event-tabs">
        <button class="event-tab active" id="tab-login">📅 Đăng nhập</button>
        <button class="event-tab" id="tab-exchange">🔄 Đổi quà</button>
      </div>

      <!-- Tab Content -->
      <div id="tab-content-login">
        ${getLoginRewardsHTML(event, progress, meta)}
      </div>

      <div id="tab-content-exchange" style="display: none;">
        ${getExchangeItemsHTML(event, progress)}
      </div>
    </div>
  `;
}

/**
 * Template login rewards grid
 */
export function getLoginRewardsHTML(event, progress, meta) {
  if (!event.loginRewards || event.loginRewards.length === 0) {
    return '<p style="color: #71717a; text-align: center;">Không có phần thưởng đăng nhập</p>';
  }

  const totalLoginDays = progress.totalLoginDays;
  const nextClaimDay = totalLoginDays + 1;
  const hasLoggedToday = meta.hasLoggedToday;

  let html = `<h3 class="event-section-title">📅 Đăng nhập nhận quà mỗi ngày</h3>`;
  html += `<div class="login-rewards-grid">`;

  event.loginRewards.forEach(reward => {
    const isClaimed = progress.claimedLoginRewards.includes(reward.day);
    const isToday = reward.day === nextClaimDay && !hasLoggedToday;
    const isLocked = reward.day > nextClaimDay || (reward.day === nextClaimDay && hasLoggedToday);

    let cardClass = 'login-reward-card';
    if (isClaimed) cardClass += ' claimed';
    else if (isToday) cardClass += ' today';
    else if (isLocked) cardClass += ' locked';

    // Icon dựa trên loại reward
    let icon = '🎁';
    if (reward.item === 'gold') icon = '🪙';
    else if (reward.item === 'diamonds') icon = '💎';
    else if (reward.item === 'eventToken') icon = event.tokenIcon || '🧧';

    html += `
      <div class="${cardClass}" data-day="${reward.day}">
        ${isClaimed ? '<span class="reward-claimed-badge">✅</span>' : ''}
        <div class="reward-day">Ngày ${reward.day}</div>
        <span class="reward-icon">${icon}</span>
        <div class="reward-label">${reward.label || reward.amount}</div>
        ${isToday ? `<button class="claim-login-btn" id="claim-day-${reward.day}">Nhận</button>` : ''}
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

/**
 * Template exchange items
 */
export function getExchangeItemsHTML(event, progress) {
  if (!event.exchangeItems || event.exchangeItems.length === 0) {
    return '<p style="color: #71717a; text-align: center;">Không có vật phẩm đổi</p>';
  }

  let html = `<h3 class="event-section-title">🔄 Đổi ${event.tokenName} lấy phần thưởng</h3>`;
  html += `<div class="exchange-grid">`;

  event.exchangeItems.forEach(item => {
    const canAfford = progress.eventTokens >= item.cost;
    const outOfStock = item.stock === 0;

    html += `
      <div class="exchange-card" data-item-id="${item.itemId}">
        <span class="exchange-icon">${item.icon}</span>
        <div class="exchange-info">
          <div class="exchange-name">${item.name}</div>
          <div class="exchange-desc">${item.description}</div>
          <div class="exchange-cost">${event.tokenIcon} ${item.cost} ${event.tokenName}</div>
          ${item.stock > 0 ? `<div class="exchange-stock">Còn lại: ${item.stock}</div>` : ''}
          ${outOfStock ? `<div class="exchange-stock" style="color: #ef4444;">Hết hàng</div>` : ''}
        </div>
        <button class="exchange-btn" 
                data-item-id="${item.itemId}"
                ${(!canAfford || outOfStock) ? 'disabled' : ''}>
          ${outOfStock ? 'Hết' : 'Đổi'}
        </button>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}
