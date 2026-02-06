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
  if (pageName === 'lobby' || pageName === 'game' || pageName === 'character-setup') {
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
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });
  
  // Re-initialize pages that need fresh data
  if (pageName === 'lobby') {
    // Import and re-init lobby to get fresh user data
    import('../pages/lobby/LobbyPage.js').then(module => {
      module.initLobbyPage();
    });
  }
  
  if (pageName === 'landing') {
    // Re-init landing to check auth status
    import('../pages/landing/LandingPage.js').then(module => {
      module.initLandingPage();
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
  
  // If we have a saved path and we're authenticated, restore it
  // Otherwise use current path or default to landing
  if (savedPath && isAuthenticated()) {
    renderPage(savedPath);
  } else if (currentPath && currentPath !== '/') {
    renderPage(currentPath);
  } else {
    // Default to landing page
    renderPage('/');
  }
}
