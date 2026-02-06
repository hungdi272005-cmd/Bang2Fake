/**
 * Tank Bang Bang - Main Application Entry
 * Khởi tạo router và pages
 */

import { initRouter } from './utils/router.js';
import { initAuthPage } from './pages/AuthPage.js';
import { initLobbyPage } from './pages/LobbyPage.js';
import { isAuthenticated } from './utils/auth.js';

// Initialize pages
initAuthPage();
initLobbyPage();

// Initialize router
initRouter();

console.log('✅ Tank Bang Bang loaded!');
console.log('Authenticated:', isAuthenticated());
