/**
 * Spin Wheel Modal Logic
 * Vòng quay may mắn - dùng Bóng Thần Bí để quay
 */

import { SPIN_REWARDS, drawWheel, getSpinModalHTML, getSpinResultHTML } from './spinTemplate.js';
import './SpinWheel.css';

const API_URL = 'http://localhost:3000/api';
let isSpinning = false;

/**
 * Mở modal vòng quay
 */
export async function openSpinModal() {
  try {
    const token = localStorage.getItem('token');
    if (!token) { alert('Vui lòng đăng nhập trước!'); return; }

    // Lấy số bóng thần bí từ server
    const res = await fetch(`${API_URL}/spin/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi');

    const orbCount = data.mysteryOrbs || 0;

    // Render modal
    const container = document.createElement('div');
    container.id = 'spin-container';
    container.innerHTML = getSpinModalHTML(orbCount);
    document.body.appendChild(container);

    // Vẽ wheel lên canvas
    const canvas = document.getElementById('spin-wheel-canvas');
    drawWheel(canvas);

    // Events
    document.getElementById('spin-close-btn').addEventListener('click', closeSpinModal);
    document.getElementById('spin-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'spin-overlay' && !isSpinning) closeSpinModal();
    });

    const escHandler = (e) => {
      if (e.key === 'Escape' && !isSpinning) {
        closeSpinModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Spin button
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn && !spinBtn.disabled) {
      spinBtn.addEventListener('click', () => handleSpin(token));
    }

  } catch (error) {
    console.error('Open spin modal error:', error);
    alert('Không thể mở vòng quay: ' + error.message);
  }
}

/**
 * Xử lý quay
 */
async function handleSpin(token) {
  if (isSpinning) return;

  const spinBtn = document.getElementById('spin-btn');
  if (!spinBtn || spinBtn.disabled) return;

  isSpinning = true;
  spinBtn.disabled = true;
  spinBtn.textContent = '...';

  try {
    // Gọi API để lấy kết quả (server quyết định ô nào)
    const res = await fetch(`${API_URL}/spin/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi quay');

    const winIndex = data.winIndex; // Ô thắng (0-7)

    // Animate wheel
    await animateWheel(winIndex);

    // Cập nhật localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      Object.assign(user, {
        gold: data.updatedUser.gold,
        diamonds: data.updatedUser.diamonds,
        mysteryOrbs: data.updatedUser.mysteryOrbs
      });
      localStorage.setItem('user', JSON.stringify(user));
    }

    // Cập nhật display
    updateLobbyDisplay(data.updatedUser);
    const orbDisplay = document.getElementById('spin-orb-display');
    if (orbDisplay) orbDisplay.textContent = data.updatedUser.mysteryOrbs;

    // Hiện kết quả
    showResult(SPIN_REWARDS[winIndex]);

    // Enable lại nút nếu còn bóng
    isSpinning = false;
    if (data.updatedUser.mysteryOrbs > 0) {
      spinBtn.disabled = false;
      spinBtn.textContent = 'QUAY';
    } else {
      spinBtn.textContent = 'HẾT';
    }

  } catch (error) {
    console.error('Spin error:', error);
    alert(error.message);
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = 'QUAY';
  }
}

/**
 * Animation quay wheel
 * winIndex = ô thắng (0 = 12 giờ)
 */
function animateWheel(winIndex) {
  return new Promise((resolve) => {
    const canvas = document.getElementById('spin-wheel-canvas');
    if (!canvas) { resolve(); return; }

    const segAngle = 360 / SPIN_REWARDS.length; // 45 deg/segment

    // Tính góc dừng: segment 0 ở 12 giờ
    // Cần quay để ô winIndex dừng ở vị trí 12 giờ (pointer)
    const targetSegAngle = winIndex * segAngle;
    const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360; // 5-8 vòng NGUYÊN
    const jitter = (Math.random() - 0.5) * segAngle * 0.5; // Lệch nhẹ trong ô để tự nhiên hơn
    const totalRotation = fullSpins - targetSegAngle + jitter;

    let currentRotation = 0;
    const startTime = performance.now();
    const duration = 4000 + Math.random() * 1000; // 4-5 giây

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      currentRotation = eased * totalRotation;
      canvas.style.transform = `rotate(${currentRotation}deg)`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Dừng
        canvas.style.transform = `rotate(${totalRotation}deg)`;
        setTimeout(resolve, 300);
      }
    }

    requestAnimationFrame(step);
  });
}

/**
 * Hiện popup kết quả
 */
function showResult(reward) {
  const resultHTML = getSpinResultHTML(reward);
  const container = document.createElement('div');
  container.id = 'spin-result-container';
  container.innerHTML = resultHTML;
  document.body.appendChild(container);

  document.getElementById('spin-result-ok')?.addEventListener('click', () => {
    container.remove();
  });
}

/**
 * Cập nhật lobby
 */
function updateLobbyDisplay(updatedUser) {
  const goldDisplay = document.querySelector('.gold-item .currency-value');
  if (goldDisplay) goldDisplay.textContent = new Intl.NumberFormat('vi-VN').format(updatedUser.gold);
  const diamondDisplay = document.querySelector('.diamond-item .currency-value');
  if (diamondDisplay) diamondDisplay.textContent = new Intl.NumberFormat('vi-VN').format(updatedUser.diamonds);
}

/**
 * Đóng modal
 */
export function closeSpinModal() {
  if (isSpinning) return;
  document.getElementById('spin-container')?.remove();
  document.getElementById('spin-result-container')?.remove();
}
