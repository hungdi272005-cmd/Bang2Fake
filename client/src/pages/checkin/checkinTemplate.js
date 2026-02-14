/**
 * Check-In Modal Template
 * Lịch dương thực tế: T2-CN header, ngày điểm danh = ngày hôm nay thực tế
 * Không điểm danh bù ngày cũ
 */

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Header thứ trong tuần
 */
function getWeekdayHeaderHTML() {
  return WEEKDAYS.map((day, i) => 
    `<div class="checkin-weekday ${i === 6 ? 'sun' : ''}">${day}</div>`
  ).join('');
}

/**
 * Tạo HTML cho 1 ô ngày trên lịch
 * checkedDays = mảng các ngày đã điểm danh [1, 5, 12, ...]
 */
function getDayCellHTML(day, reward, checkedDays, todayDate) {
  const isClaimed = checkedDays.includes(day);
  const isToday = day === todayDate;
  const isPast = day < todayDate && !isClaimed; // Ngày qua mà chưa điểm danh = bỏ lỡ
  const isFuture = day > todayDate;

  let classes = 'checkin-day';
  if (isClaimed) classes += ' claimed';
  else if (isToday) classes += ' today';
  else if (isPast) classes += ' missed';
  else if (isFuture) classes += ' future';

  return `
    <div class="${classes}" data-day="${day}">
      <span class="checkin-day-number">${day}</span>
      <span class="checkin-day-icon">🪙</span>
      <span class="checkin-day-gold">${reward.gold}</span>
    </div>
  `;
}

/**
 * Progress bar + milestone markers
 */
function getProgressBarHTML(checkedCount, daysInMonth, milestones, claimedMilestones) {
  const percentage = Math.min((checkedCount / daysInMonth) * 100, 100);

  const markersHTML = milestones.map(m => {
    const pos = (m.requirement / daysInMonth) * 100;
    const reached = checkedCount >= m.requirement;
    const claimed = claimedMilestones.includes(m.requirement);
    let cls = 'milestone-marker';
    if (claimed) cls += ' claimed-milestone';
    else if (reached) cls += ' reached';
    return `<div class="${cls}" style="left: ${pos}%" title="Mốc ${m.requirement} ngày"></div>`;
  }).join('');

  return `
    <div class="checkin-progress-section">
      <div class="checkin-progress-label">Tiến trình điểm danh tháng</div>
      <div class="checkin-progress-bar-wrapper">
        <div class="checkin-progress-fill" style="width: ${percentage}%">
          <div class="checkin-progress-fill-glow"></div>
        </div>
        <div class="checkin-progress-text">${checkedCount} / ${daysInMonth} ngày</div>
        ${markersHTML}
      </div>
    </div>
  `;
}

/**
 * 3 milestone cards
 */
function getMilestonesHTML(milestones, checkedCount, claimedMilestones) {
  const icons = ['🔮', '🔮', '🥚'];
  
  return milestones.map((m, i) => {
    const reached = checkedCount >= m.requirement;
    const claimed = claimedMilestones.includes(m.requirement);

    let cls = 'milestone-card';
    if (claimed) cls += ' claimed-milestone';
    else if (reached) cls += ' reached';

    let actionHTML;
    if (claimed) {
      actionHTML = `<span class="milestone-claimed-badge">✓ Đã nhận</span>`;
    } else if (reached) {
      actionHTML = `<button class="milestone-claim-btn" data-milestone="${m.requirement}">Nhận thưởng</button>`;
    } else {
      actionHTML = `<button class="milestone-claim-btn" disabled>Còn ${m.requirement - checkedCount} ngày</button>`;
    }

    return `
      <div class="${cls}">
        <div class="milestone-card-req">Mốc ${m.requirement} ngày</div>
        <div class="milestone-card-icon">${icons[i]}</div>
        <div class="milestone-card-label">${m.label}</div>
        ${actionHTML}
      </div>
    `;
  }).join('');
}

/**
 * Tạo toàn bộ HTML cho modal
 */
export function getCheckinModalHTML(data) {
  const { checkin, calendar, rewards, milestones } = data;
  const { checkedDays, checkedCount, totalCheckins, checkedInToday, claimedMilestones } = checkin;
  const { daysInMonth, firstDayOfWeek, today, monthLabel } = calendar;

  // Weekday header
  const weekdayHeaderHTML = getWeekdayHeaderHTML();

  // Calendar grid: ô trống trước ngày 1 + các ngày trong tháng
  let calendarHTML = '';
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarHTML += `<div class="checkin-day-empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarHTML += getDayCellHTML(d, rewards[d - 1], checkedDays, today);
  }

  // Progress bar
  const progressHTML = getProgressBarHTML(checkedCount, daysInMonth, milestones, claimedMilestones);

  // Milestones
  const milestonesHTML = getMilestonesHTML(milestones, checkedCount, claimedMilestones);

  // Claim button
  const canClaim = !checkedInToday;
  const btnText = checkedInToday
    ? '✓ Đã điểm danh hôm nay'
    : `📅 Điểm danh ngày ${today}`;

  return `
    <div class="checkin-overlay" id="checkin-overlay">
      <div class="checkin-modal">
        <button class="checkin-close-btn" id="checkin-close-btn">✕</button>
        
        <div class="checkin-header">
          <h2 class="checkin-title">📅 Điểm Danh Hàng Ngày</h2>
          <p class="checkin-subtitle">${monthLabel} — ${daysInMonth} ngày</p>
          <div class="checkin-streak-info">
            🔥 Đã điểm danh: <strong>${checkedCount}/${daysInMonth}</strong> ngày
          </div>
        </div>

        <div class="checkin-weekday-header">
          ${weekdayHeaderHTML}
        </div>

        <div class="checkin-calendar-grid">
          ${calendarHTML}
        </div>

        <button class="checkin-claim-btn" id="checkin-claim-btn" ${!canClaim ? 'disabled' : ''}>
          ${btnText}
        </button>

        ${progressHTML}

        <div class="checkin-milestones">
          ${milestonesHTML}
        </div>
      </div>
    </div>
  `;
}

/**
 * Popup phần thưởng
 */
export function getRewardPopupHTML(items, title) {
  let itemsHTML = items.map(item => `
    <div class="reward-popup-item">
      <span class="reward-popup-icon">${item.icon}</span>
      <span class="reward-popup-value">${item.text}</span>
    </div>
  `).join('');

  return `
    <div class="checkin-reward-popup" id="checkin-reward-popup">
      <div class="reward-popup-title">${title}</div>
      <div class="reward-popup-items">${itemsHTML}</div>
      <button class="reward-popup-ok" id="reward-popup-ok">OK</button>
    </div>
  `;
}
