/**
 * Simple Client-Side Router
 * Quản lý navigation giữa các pages
 */

import { isAuthenticated } from './auth.js';

const routes = {
  '/': 'signin',        // Default to signin
  '/signin': 'signin',  // Login page
  '/signup': 'signup',  // Register page
  '/lobby': 'lobby',    // Lobby page (sau khi đăng nhập)
  '/game': 'game'       // Game page
};

/**
 * Navigate tới page khác
 */
export function navigateTo(path) {
  // Update URL without reload
  window.history.pushState({}, '', path);
  
  // Render page
  renderPage(path);
}

/**
 * Render page dựa vào path
 */
export function renderPage(path) {
  const pageName = routes[path] || 'signin';
  
  // Route guards
  if (pageName === 'lobby' || pageName === 'game') {
    if (!isAuthenticated()) {
      navigateTo('/signin');
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
  
  // Handle initial page load
  const currentPath = window.location.pathname;
  renderPage(currentPath);
}
