/**
 * Spin Wheel Template
 * Vòng quay may mắn 8 ô - dùng Canvas
 */

/**
 * Mock data: 8 phần thưởng trên vòng quay
 * Ô 0 (hướng 12 giờ) = 100 Kim Cương
 */
export const SPIN_REWARDS = [
  { id: 0, icon: '💎', label: '100 KC',      type: 'diamonds', amount: 100, color: '#ffd700' },//1%
  { id: 1, icon: '🪙', label: '500 Gold',    type: 'gold',     amount: 500, color: '#a78bfa' },//22%  
  { id: 2, icon: '🔮', label: '1 Bóng',      type: 'orbs',     amount: 1,   color: '#60a5fa' },//6%
  { id: 3, icon: '🪙', label: '2000 Gold',   type: 'gold',     amount: 2000, color: '#f472b6' },//11%
  { id: 4, icon: '💎', label: '10 KC',       type: 'diamonds', amount: 10,  color: '#34d399' },//13%
  { id: 5, icon: '🪙', label: '1000 Gold',   type: 'gold',     amount: 1000, color: '#fb923c' },//17%
  { id: 6, icon: '💎', label: '5 KC',        type: 'diamonds', amount: 5,   color: '#f87171' },//20%
  { id: 7, icon: '🪙', label: '3000 Gold',   type: 'gold',     amount: 3000, color: '#38bdf8' }//9%
];

/**
 * Vẽ vòng quay lên Canvas
 */
export function drawWheel(canvas) {
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = cx - 4;
  const segAngle = (2 * Math.PI) / SPIN_REWARDS.length;

  // Offset: segment 0 ở hướng 12 giờ (trên cùng)
  // Canvas 0deg = hướng 3 giờ, nên offset = -90deg - nửa segment
  const offset = -Math.PI / 2 - segAngle / 2;

  for (let i = 0; i < SPIN_REWARDS.length; i++) {
    const startAngle = offset + i * segAngle;
    const endAngle = startAngle + segAngle;
    const reward = SPIN_REWARDS[i];

    // Vẽ segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();

    // Gradient cho segment
    const midAngle = startAngle + segAngle / 2;
    const gx = cx + Math.cos(midAngle) * radius * 0.5;
    const gy = cy + Math.sin(midAngle) * radius * 0.5;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, lightenColor(reward.color, 30));
    grad.addColorStop(1, reward.color);
    ctx.fillStyle = grad;
    ctx.fill();

    // Viền
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vẽ icon + text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);
    ctx.textAlign = 'center';

    // Icon
    ctx.font = '22px serif';
    ctx.fillText(reward.icon, radius * 0.6, 2);

    // Label
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(reward.label, radius * 0.6, 18);

    ctx.restore();
  }

  // Viền ngoài
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(150,100,255,0.4)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Vòng tròn trung tâm
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, 2 * Math.PI);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,100,255,0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/**
 * Làm sáng màu
 */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `rgb(${r},${g},${b})`;
}

/**
 * HTML cho modal vòng quay
 */
export function getSpinModalHTML(orbCount) {
  const canSpin = orbCount > 0;

  return `
    <div class="spin-overlay" id="spin-overlay">
      <div class="spin-modal">
        <button class="spin-close-btn" id="spin-close-btn">✕</button>

        <div class="spin-header">
          <h2 class="spin-title">🎰 Vòng Quay May Mắn</h2>
          <p class="spin-subtitle">Dùng Bóng Thần Bí để quay</p>
          <div class="spin-orb-count">
            🔮 Bóng Thần Bí: <strong id="spin-orb-display">${orbCount}</strong>
          </div>
        </div>

        <div class="spin-wheel-container">
          <div class="spin-pointer"></div>
          <canvas id="spin-wheel-canvas" width="320" height="320"></canvas>
          <button class="spin-center-btn" id="spin-btn" ${!canSpin ? 'disabled' : ''}>
            QUAY
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Popup kết quả
 */
export function getSpinResultHTML(reward) {
  return `
    <div class="spin-result-popup" id="spin-result-popup">
      <div class="spin-result-icon">${reward.icon}</div>
      <div class="spin-result-title">🎉 Chúc mừng!</div>
      <div class="spin-result-value">Bạn nhận được: ${reward.icon} ${reward.label}</div>
      <button class="spin-result-ok" id="spin-result-ok">Nhận</button>
    </div>
  `;
}
