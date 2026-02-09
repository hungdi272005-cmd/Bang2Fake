/**
 * Simple Client-Side Router
 * Quản lý navigation giữa các pages
 */

import { isAuthenticated } from './auth.js';

const routes = {
  '/': 'landing',       // Landing page
  '/signin': 'signin',  // Login page
  '/signup': 'signup',  // Register page
  '/character-setup': 'character-setup', // Character setup page
  '/lobby': 'lobby',    // Lobby page (sau khi đăng nhập)
  '/game-room': 'game-room',      // Game room (chờ tìm trận)
  '/matchmaking': 'matchmaking',  // Matchmaking queue
  '/tank-select': 'tank-select',  // Tank selection
  '/game': 'game'       // Game page
};

/**
 * Navigate tới page khác
 */
export function navigateTo(path) {
  // Update URL without reload
  window.history.pushState({}, '', path);
  
  // Save current path to localStorage (for hot reload persistence)
  localStorage.setItem('currentPath', path);
  
  // Render page
  renderPage(path);
}

/**
 * Render page dựa vào path
 */
export function renderPage(path) {
  const pageName = routes[path] || 'signin';
  
  // Route guards
  if (pageName === 'lobby' || pageName === 'game' || pageName === 'character-setup' || 
      pageName === 'game-room' || pageName === 'matchmaking' || pageName === 'tank-select') {
    if (!isAuthenticated()) {
      navigateTo('/');
      return;
    }
  }
  
  // Nếu đã đăng nhập và cố truy cập signin/signup, redirect to lobby
  if ((pageName === 'signin' || pageName === 'signup') && isAuthenticated()) {
    navigateTo('/lobby');
    return;
  }
  
  // Cleanup khi rời khỏi các trang đặc biệt (SYNCHRONOUS)
  // Stop game nếu đang chạy - sử dụng window function để đồng bộ
  if (pageName !== 'game' && typeof window.stopPhaserGame === 'function') {
    window.stopPhaserGame();
  }
  
  // Cleanup matchmaking timer nếu đang chạy
  if (pageName !== 'matchmaking' && typeof window.cleanupMatchmakingTimer === 'function') {
    window.cleanupMatchmakingTimer();
  }
  
  // Cleanup tank selection timer nếu đang chạy
  if (pageName !== 'tank-select' && typeof window.cleanupTankSelectionTimer === 'function') {
    window.cleanupTankSelectionTimer();
  }
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });
  
  // Re-initialize pages that need fresh data
  if (pageName === 'lobby') {
    import('../pages/lobby/LobbyPage.js').then(module => {
      module.initLobbyPage();
    });
  }
  
  if (pageName === 'landing') {
    import('../pages/landing/LandingPage.js').then(module => {
      module.initLandingPage();
    });
  }
  
  // Game Room page
  if (pageName === 'game-room') {
    import('../pages/game-room/GameRoomPage.js').then(module => {
      module.initGameRoomPage();
    });
  }
  
  // Matchmaking page
  if (pageName === 'matchmaking') {
    import('../pages/matchmaking/MatchmakingPage.js').then(module => {
      module.startMatchmakingPage();
    });
  }
  
  // Tank Selection page
  if (pageName === 'tank-select') {
    import('../pages/tank-select/TankSelectionPage.js').then(module => {
      module.startTankSelectionPage();
    });
  }
  
  // Game page - Khởi tạo Phaser game
  if (pageName === 'game') {
    import('../pages/game/GamePage.js').then(module => {
      module.startGame();
    });
  }
  
  // Show target page
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
  }
}

/**
 * Initialize router
 */
export function initRouter() {
  // Handle back/forward buttons
  window.addEventListener('popstate', () => {
    renderPage(window.location.pathname);
  });
  
  // Restore previous path from localStorage (for hot reload)
  const savedPath = localStorage.getItem('currentPath');
  const currentPath = window.location.pathname;
  
  // Các trang "tạm thời" không nên restore - redirect về lobby
  // Bao gồm cả /game vì cần chọn tank lại
  const temporaryPages = ['/matchmaking', '/tank-select', '/game-room', '/game'];
  
  // If we have a saved path and we're authenticated, restore it
  // But skip temporary pages - they should restart from lobby
  if (savedPath && isAuthenticated()) {
    if (temporaryPages.includes(savedPath)) {
      // Trang tạm, redirect về lobby
      localStorage.setItem('currentPath', '/lobby');
      renderPage('/lobby');
    } else {
      renderPage(savedPath);
    }
  } else if (currentPath && currentPath !== '/') {
    if (temporaryPages.includes(currentPath) && isAuthenticated()) {
      renderPage('/lobby');
    } else {
      renderPage(currentPath);
    }
  } else {
    // Default to landing page
    renderPage('/');
  }
}

