/**
 * Matchmaking Page - Trang chờ tìm trận
 * Hiển thị loading animation và timer khi đang tìm trận
 */

import { navigateTo } from '../../utils/router.js';
import { getMatchmakingTemplate, updateTimer } from './matchmakingTemplate.js';
import { getGameMode } from '../game-room/GameRoomPage.js';

let matchmakingTimer = null;
let navigationTimeout = null; // Timeout để navigate sau khi tìm được trận
let elapsedSeconds = 0;
let matchFound = false;
let cancelled = false; // Flag để đánh dấu đã hủy

/**
 * Init DOM only - gọi khi app load, không start timer
 */
export function initMatchmakingPage() {
  // Chỉ log, không làm gì cả - sẽ init khi navigate đến
  console.log('🔧 Matchmaking page registered');
}

/**
 * Thực sự khởi tạo trang matchmaking - chỉ gọi khi navigate đến
 */
export function startMatchmakingPage() {
  const matchmakingPage = document.getElementById('matchmaking-page');
  if (!matchmakingPage) return;
  
  // Clear any existing timer first
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
  
  const gameMode = getGameMode();
  matchmakingPage.innerHTML = getMatchmakingTemplate(gameMode);
  
  // Reset state
  elapsedSeconds = 0;
  matchFound = false;
  cancelled = false; // Reset cancelled flag
  
  // Attach event listeners
  setupEventListeners(matchmakingPage);
  
  // Start matchmaking timer
  startMatchmaking();
  
  console.log('✅ Matchmaking page started - Mode:', gameMode);
}

function setupEventListeners(container) {
  // Nút Hủy
  const cancelBtn = container.querySelector('#cancel-matchmaking-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      cancelMatchmaking();
    });
  }
}

function startMatchmaking() {
  // Clear any existing timer
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
  }
  
  // Update timer every second
  matchmakingTimer = setInterval(() => {
    elapsedSeconds++;
    updateTimer(elapsedSeconds);
    
    // Fake matchmaking: tìm được trận sau 3-5 giây
    const matchTime = 3 + Math.floor(Math.random() * 3); // 3-5 giây
    if (elapsedSeconds >= matchTime && !matchFound) {
      matchFound = true;
      onMatchFound();
    }
  }, 1000);
}

function onMatchFound() {
  // Dừng timer
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
  
  console.log('🎉 Đã tìm được trận!');
  
  // Hiển thị "Đã tìm được trận!" rồi chuyển trang
  const statusText = document.querySelector('.matchmaking-status');
  const spinner = document.querySelector('.matchmaking-spinner');
  
  if (statusText) {
    statusText.textContent = '🎉 Đã tìm được trận!';
    statusText.classList.add('match-found');
  }
  
  if (spinner) {
    spinner.classList.add('match-found');
  }
  
  // Chờ 1.5s rồi chuyển sang trang chọn tank
  navigationTimeout = setTimeout(() => {
    // Chỉ navigate nếu chưa bị hủy
    if (!cancelled) {
      navigateTo('/tank-select');
    }
  }, 1500);
}

function cancelMatchmaking() {
  // Đánh dấu đã hủy
  cancelled = true;
  
  // Dừng timer
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
  
  // Hủy navigation timeout nếu có
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
    navigationTimeout = null;
  }
  
  console.log('❌ Đã hủy tìm trận');
  
  // Quay lại Game Room
  const gameMode = getGameMode();
  navigateTo('/game-room');
}

// Cleanup khi rời trang
export function cleanupMatchmaking() {
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
}

// Expose to window for synchronous access
window.cleanupMatchmakingTimer = cleanupMatchmaking;

