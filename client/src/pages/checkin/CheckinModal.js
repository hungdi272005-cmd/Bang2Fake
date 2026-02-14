/**
 * Check-In Modal Logic
 * Điều khiển modal điểm danh: lịch dương + progress bar + milestones
 */

import { getCheckinModalHTML, getRewardPopupHTML } from './checkinTemplate.js';

const API_URL = 'http://localhost:3000/api';

// Lưu data hiện tại để dùng khi claim
let currentData = null;

/**
 * Lấy trạng thái điểm danh từ server
 */
async function fetchCheckinStatus(token) {
  const response = await fetch(`${API_URL}/checkin/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi lấy trạng thái điểm danh');
  return data;
}

/**
 * Gọi API điểm danh hàng ngày
 */
async function claimCheckinAPI(token) {
  const response = await fetch(`${API_URL}/checkin/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi điểm danh');
  return data;
}

/**
 * Gọi API nhận thưởng mốc
 */
async function claimMilestoneAPI(token, milestone) {
  const response = await fetch(`${API_URL}/checkin/claim-milestone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ milestone })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi nhận mốc');
  return data;
}

/**
 * Mở modal điểm danh
 */
export async function openCheckinModal() {
  try {
    const token = localStorage.getItem('token');
    if (!token) { alert('Vui lòng đăng nhập trước!'); return; }

    // Lấy trạng thái từ server
    currentData = await fetchCheckinStatus(token);

    // Render modal
    const html = getCheckinModalHTML(currentData);
    const container = document.createElement('div');
    container.id = 'checkin-container';
    container.innerHTML = html;
    document.body.appendChild(container);

    // --- Events ---
    // Đóng modal
    document.getElementById('checkin-close-btn').addEventListener('click', closeCheckinModal);
    document.getElementById('checkin-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'checkin-overlay') closeCheckinModal();
    });

    // ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') { closeCheckinModal(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    // Điểm danh hàng ngày
    const claimBtn = document.getElementById('checkin-claim-btn');
    if (claimBtn && !claimBtn.disabled) {
      claimBtn.addEventListener('click', () => handleDailyClaim(token));
    }

    // Nhận thưởng mốc
    document.querySelectorAll('.milestone-claim-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const milestone = parseInt(btn.dataset.milestone);
        handleMilestoneClaim(token, milestone);
      });
    });

  } catch (error) {
    console.error('Open checkin modal error:', error);
    alert('Không thể mở điểm danh: ' + error.message);
  }
}

/**
 * Xử lý điểm danh hàng ngày
 */
async function handleDailyClaim(token) {
  const claimBtn = document.getElementById('checkin-claim-btn');
  if (!claimBtn || claimBtn.disabled) return;

  claimBtn.disabled = true;
  claimBtn.textContent = 'Đang điểm danh...';

  try {
    const result = await claimCheckinAPI(token);

    // Cập nhật localStorage
    updateLocalUser(result.updatedUser);
    updateLobbyDisplay(result.updatedUser);

    // Hiện popup thưởng
    showRewardPopup('🎉 Điểm danh thành công!', [
      { icon: '🪙', text: `+${result.reward.gold} Gold` }
    ]);

    // Reload modal để cập nhật UI
    setTimeout(async () => {
      closeCheckinModal();
      await openCheckinModal();
    }, 1500);

  } catch (error) {
    console.error('Claim error:', error);
    alert(error.message);
    claimBtn.disabled = false;
    claimBtn.textContent = '📅 Thử lại';
  }
}

/**
 * Xử lý nhận thưởng mốc
 */
async function handleMilestoneClaim(token, milestone) {
  try {
    const result = await claimMilestoneAPI(token, milestone);

    // Cập nhật localStorage
    updateLocalUser(result.updatedUser);
    updateLobbyDisplay(result.updatedUser);

    // Popup thưởng
    const items = [];
    if (result.milestone.diamonds > 0) items.push({ icon: '💎', text: `+${result.milestone.diamonds} Kim Cương` });
    if (result.milestone.mysteryOrbs > 0) items.push({ icon: '🔮', text: `+${result.milestone.mysteryOrbs} Bóng Thần Bí` });
    if (result.milestone.tankEggs > 0) items.push({ icon: '🥚', text: `+${result.milestone.tankEggs} Trứng Tank` });

    showRewardPopup(`⭐ Thưởng mốc ${milestone} ngày!`, items);

    // Reload modal
    setTimeout(async () => {
      closeCheckinModal();
      await openCheckinModal();
    }, 1800);

  } catch (error) {
    console.error('Milestone claim error:', error);
    alert(error.message);
  }
}

/**
 * Hiện popup phần thưởng
 */
function showRewardPopup(title, items) {
  const popupHTML = getRewardPopupHTML(items, title);
  const popupContainer = document.createElement('div');
  popupContainer.id = 'reward-popup-container';
  popupContainer.innerHTML = popupHTML;
  document.body.appendChild(popupContainer);

  document.getElementById('reward-popup-ok')?.addEventListener('click', () => {
    popupContainer.remove();
  });
}

/**
 * Cập nhật localStorage user
 */
function updateLocalUser(updatedUser) {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    Object.assign(user, {
      gold: updatedUser.gold,
      diamonds: updatedUser.diamonds,
      mysteryOrbs: updatedUser.mysteryOrbs,
      tankEggs: updatedUser.tankEggs
    });
    localStorage.setItem('user', JSON.stringify(user));
  }
}

/**
 * Cập nhật hiển thị trên lobby
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
export function closeCheckinModal() {
  document.getElementById('checkin-container')?.remove();
  document.getElementById('reward-popup-container')?.remove();
}
