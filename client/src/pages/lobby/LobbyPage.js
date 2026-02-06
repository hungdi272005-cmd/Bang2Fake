/**
 * Lobby Page - Sau khi đăng nhập
 */

import { getUser, logout } from '../../utils/auth.js';
import { navigateTo } from '../../utils/router.js';
import { getLobbyTemplate } from './lobbyTemplate.js';

// Store global logout handler
window.handleLogout = async function() {
  console.log('🔵 Logout handler called');
  const confirmed = confirm('Bạn có chắc muốn đăng xuất?');
  
  if (confirmed) {
    console.log('🔵 Logging out...');
    await logout();
    console.log('🔵 Navigating to landing page');
    navigateTo('/');
  }
};

export function initLobbyPage() {
  const lobbyPage = document.getElementById('lobby-page');
  
  const user = getUser();
  
  lobbyPage.innerHTML = getLobbyTemplate(user);

  // No need to attach event listener here, using onclick in HTML
  console.log('✅ Lobby page initialized with inline event handlers');
}
