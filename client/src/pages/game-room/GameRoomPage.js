/**
 * Game Room Page - Trang chờ tìm trận
 * Hiển thị sau khi chọn game mode (Đánh thường/Đánh hạng)
 */

import { navigateTo } from '../../utils/router.js';
import { getGameRoomTemplate } from './gameRoomTemplate.js';

// Lưu game mode hiện tại
let currentGameMode = 'normal'; // 'normal' | 'ranked'

export function initGameRoomPage() {
  const gameRoomPage = document.getElementById('game-room-page');
  if (!gameRoomPage) return;
  
  // Lấy mode từ localStorage (đã được set bởi LobbyPage)
  currentGameMode = localStorage.getItem('gameMode') || 'normal';
  
  gameRoomPage.innerHTML = getGameRoomTemplate(currentGameMode);
  
  // Attach event listeners
  setupEventListeners(gameRoomPage);
  
  console.log('✅ Game Room page initialized - Mode:', currentGameMode);
}

function setupEventListeners(container) {
  // Nút Tìm trận
  const findMatchBtn = container.querySelector('#find-match-btn');
  if (findMatchBtn) {
    findMatchBtn.addEventListener('click', () => {
      console.log('🔍 Bắt đầu tìm trận...');
      navigateTo('/matchmaking');
    });
  }
  
  // Nút Quay lại
  const backBtn = container.querySelector('#back-to-lobby-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateTo('/lobby');
    });
  }
}

// Export để có thể gọi từ bên ngoài
export function getGameMode() {
  return localStorage.getItem('gameMode') || 'normal';
}
