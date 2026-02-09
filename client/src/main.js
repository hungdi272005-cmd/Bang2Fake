/**
 * Tank Bang Bang - Main Application Entry
 * Khởi tạo router và pages
 */

import { initRouter } from './utils/router.js';
import { initLandingPage } from './pages/landing/LandingPage.js';
import { initAuthPage } from './pages/auth/AuthPage.js';
import { initCharacterSetupPage } from './pages/character/CharacterSetupPage.js';
import { initLobbyPage } from './pages/lobby/LobbyPage.js';
import { initGameRoomPage } from './pages/game-room/GameRoomPage.js';
import { initMatchmakingPage } from './pages/matchmaking/MatchmakingPage.js';
import { initTankSelectionPage } from './pages/tank-select/TankSelectionPage.js';
import { initGamePage } from './pages/game/GamePage.js';
import { isAuthenticated } from './utils/auth.js';

// Initialize pages
initLandingPage();
initAuthPage();
initCharacterSetupPage();
initLobbyPage();
initGameRoomPage();
initMatchmakingPage();
initTankSelectionPage();
initGamePage();

// Initialize router
initRouter();

console.log('✅ Tank Bang Bang loaded!');
console.log('Authenticated:', isAuthenticated());

