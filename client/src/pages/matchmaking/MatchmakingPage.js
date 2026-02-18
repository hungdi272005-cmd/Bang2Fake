/**
 * Matchmaking Page - Trang chờ tìm trận (dùng Socket.IO thật)
 * Khi đủ 2 người → ghép trận → chuyển sang chọn tank
 */

import { navigateTo } from '../../utils/router.js';
import { getMatchmakingTemplate, updateTimer } from './matchmakingTemplate.js';
import { getSocket, initSocket } from '../../services/socket.js';

let matchmakingTimer = null;
let elapsedSeconds = 0;
let matchFound = false;
let cancelled = false;

// Lưu thông tin match để truyền sang trang chọn tank
let currentMatchData = null;

export function getMatchData() {
  return currentMatchData;
}

/**
 * Init DOM only - gọi khi app load
 */
export function initMatchmakingPage() {
  console.log('🔧 Matchmaking page registered');
}

/**
 * Thực sự khởi tạo trang matchmaking - chỉ gọi khi navigate đến
 */
export function startMatchmakingPage() {
  const matchmakingPage = document.getElementById('matchmaking-page');
  if (!matchmakingPage) return;
  
  // Clear any existing timer
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
  
  matchmakingPage.innerHTML = getMatchmakingTemplate();
  
  // Reset state
  elapsedSeconds = 0;
  matchFound = false;
  cancelled = false;
  currentMatchData = null;
  
  // Attach event listeners
  setupEventListeners(matchmakingPage);
  
  // Bắt đầu tìm trận qua Socket
  startMatchmaking();
  
  console.log('✅ Matchmaking page started - Real socket matchmaking');
}

function setupEventListeners(container) {
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
  
  // Đảm bảo socket đã kết nối
  const socket = initSocket();
  if (!socket) {
    console.error('❌ Không thể kết nối socket');
    return;
  }

  // Lắng nghe khi tìm được trận
  socket.off('matchFound'); // Remove old listeners
  socket.on('matchFound', (data) => {
    if (!cancelled && !matchFound) {
      matchFound = true;
      currentMatchData = data;
      onMatchFound(data);
    }
  });

  // Lắng nghe đang tìm
  socket.off('searching');
  socket.on('searching', (data) => {
    console.log('🔍', data.message, '- Queue size:', data.queueSize);
  });

  // Gửi yêu cầu tìm trận
  socket.emit('findMatch');

  // Start timer đếm thời gian chờ
  matchmakingTimer = setInterval(() => {
    elapsedSeconds++;
    updateTimer(elapsedSeconds);
  }, 1000);
}

function onMatchFound(data) {
  // Dừng timer
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
  
  console.log('🎉 Đã tìm được trận! Session:', data.sessionId);
  console.log('   Đối thủ:', data.opponent.displayName || data.opponent.username);
  
  // Hiển thị "Đã tìm được trận!"
  const statusText = document.querySelector('.matchmaking-status');
  const spinner = document.querySelector('.matchmaking-spinner');
  
  if (statusText) {
    statusText.textContent = `🎉 Đã tìm được trận! vs ${data.opponent.displayName || data.opponent.username}`;
    statusText.classList.add('match-found');
  }
  
  if (spinner) {
    spinner.classList.add('match-found');
  }
  
  // Chờ 1.5s rồi chuyển sang trang chọn tank
  setTimeout(() => {
    if (!cancelled) {
      navigateTo('/tank-select');
    }
  }, 1500);
}

function cancelMatchmaking() {
  cancelled = true;
  
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
  
  // Gửi hủy tìm trận qua socket
  const socket = getSocket();
  if (socket) {
    socket.emit('cancelMatch');
    socket.off('matchFound');
    socket.off('searching');
  }
  
  console.log('❌ Đã hủy tìm trận');
  navigateTo('/lobby');
}

// Cleanup khi rời trang
export function cleanupMatchmaking() {
  if (matchmakingTimer) {
    clearInterval(matchmakingTimer);
    matchmakingTimer = null;
  }
}

// Expose to window
window.cleanupMatchmakingTimer = cleanupMatchmaking;
