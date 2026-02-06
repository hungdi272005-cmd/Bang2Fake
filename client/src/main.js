/**
 * Tank Bang Bang - Main Application Entry
 * Khởi tạo router và pages
 */

import { initRouter } from './utils/router.js';
import { initLandingPage } from './pages/landing/LandingPage.js';
import { initAuthPage } from './pages/auth/AuthPage.js';
import { initCharacterSetupPage } from './pages/character/CharacterSetupPage.js';
import { initLobbyPage } from './pages/lobby/LobbyPage.js';
import { isAuthenticated } from './utils/auth.js';

// Initialize pages
initLandingPage();
initAuthPage();
initCharacterSetupPage();
initLobbyPage();

// Initialize router
initRouter();

console.log('✅ Tank Bang Bang loaded!');
console.log('Authenticated:', isAuthenticated());
