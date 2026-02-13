/**
 * Lobby Page - Sau khi đăng nhập
 */

import { getUser, logout } from '../../utils/auth.js';
import { navigateTo } from '../../utils/router.js';
import { getLobbyTemplate } from './lobbyTemplate.js';
import { initSocket, getSocket } from '../../services/socket.js';
import { initGlobalChat } from '../chat/GlobalChat.js';
import { openCheckinModal } from '../checkin/CheckinModal.js';
import { openSpinModal } from '../spin/SpinWheel.js';
import { openShopModal } from '../shop/ShopModal.js';
import { openRuneBoardModal } from '../rune-board/RuneBoardModal.js';
import { openTankCollectionModal } from '../tank-collection/TankCollectionModal.js';

// Store global logout handler
window.handleLogout = async function() {
  console.log('🔵 Logout handler called');
  const confirmed = confirm('Bạn có chắc muốn đăng xuất?');
  
  if (confirmed) {
    console.log('🔵 Logging out...');
    await logout();
    console.log('🔵 Navigating to landing page');
    navigateTo('/landingpage');
  }
};

// Global navigation to game room
window.navigateToGameRoom = function(mode) {
  console.log('🎮 Navigating to game room with mode:', mode);
  // Lưu mode vào localStorage trước khi navigate
  localStorage.setItem('gameMode', mode);
  navigateTo('/game-room');
};

export function initLobbyPage() {
  const lobbyPage = document.getElementById('lobby-page');
  
  const user = getUser();
  
  lobbyPage.innerHTML = getLobbyTemplate(user);

  // No need to attach event listener here, using onclick in HTML
  console.log('✅ Lobby page initialized with inline event handlers');

  // VIP button
  const vipBtn = lobbyPage.querySelector('#nav-vip-btn');
  if (vipBtn) {
    vipBtn.addEventListener('click', () => {
      navigateTo('/vip');
    });
  }

  // Checkin button (Điểm danh)
  const checkinBtn = lobbyPage.querySelector('#nav-checkin-btn');
  if (checkinBtn) {
    checkinBtn.addEventListener('click', () => {
      openCheckinModal();
    });
  }

  // Spin wheel button (Vòng quay)
  const wheelBtn = lobbyPage.querySelector('.wheel-btn');
  if (wheelBtn) {
    wheelBtn.addEventListener('click', () => {
      openSpinModal();
    });
  }

  // Shop button (Cửa hàng)
  const shopBtn = lobbyPage.querySelector('#shop-btn');
  if (shopBtn) {
    shopBtn.addEventListener('click', () => {
      openShopModal();
    });
  }

  // Rune Board button (Bảng Ngọc)
  const runeBoardBtn = lobbyPage.querySelector('#rune-board-btn');
  if (runeBoardBtn) {
    runeBoardBtn.addEventListener('click', () => {
      openRuneBoardModal();
    });
  }

  // Tank Collection button (Kho Tank)
  const tankCollectionBtn = lobbyPage.querySelector('#tank-collection-btn');
  if (tankCollectionBtn) {
    tankCollectionBtn.addEventListener('click', () => {
      openTankCollectionModal();
    });
  }

  // Diamond + button
  const addDiamondBtn = lobbyPage.querySelector('#add-diamond-btn');
  if (addDiamondBtn) {
    addDiamondBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('/vip');
    });
  }

  // Diamond display container
  const diamondDisplay = lobbyPage.querySelector('#lobby-diamond-display');
  if (diamondDisplay) {
    diamondDisplay.addEventListener('click', () => {
      navigateTo('/vip');
    });
    diamondDisplay.style.cursor = 'pointer';
  }

  // --- GLOBAL CHAT LOGIC ---
  initGlobalChat(user);
}
