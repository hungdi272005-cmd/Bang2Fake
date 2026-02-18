/**
 * Tank Selection Page - Chọn tank trước khi vào trận
 * Kết nối Socket.IO: chọn tank, ready, sync với đối thủ
 */

import { navigateTo } from '../../utils/router.js';
import { getTankSelectionTemplate, updateCountdown } from './tankSelectionTemplate.js';
import { getSocket } from '../../services/socket.js';
import { getMatchData } from '../matchmaking/MatchmakingPage.js';
import { getUser } from '../../utils/auth.js';

// Import tank configs
import GundamConfig from '../../entities/tanks/Gundam.js';
import PhoenixConfig from '../../entities/tanks/Phoenix.js';
import KakashiConfig from '../../entities/tanks/Kakashi.js';
import DeepoolConfig from '../../entities/tanks/Deepool.js';

let countdownTimer = null;
let remainingSeconds = 30;
let selectedTank = null;
let isReady = false;
let currentSessionId = null;

// Danh sách tanks với role để filter theo category
const TANKS = [ 
  { id: 'gundam', config: GundamConfig, image: 'assets/Pictures_of_gundam/tank_gundam.png', role: 'DPS' },
  { id: 'phoenix', config: PhoenixConfig, image: 'assets/Pictures_of_phoenix/tank_phoenix.png', role: 'DPS' },
  { id: 'kakashi', config: KakashiConfig, image: 'assets/picktures_of_kakashi/tank_kakashi.png', role: 'DPS' },
  { id: 'deepool', config: DeepoolConfig, image: 'assets/Pictures_of_deepool/tank_deepool.png', role: 'DPS' }
];

/**
 * Init DOM only - gọi khi app load
 */
export function initTankSelectionPage() {
  console.log('🔧 Tank Selection page registered');
}

/**
 * Thực sự khởi tạo trang tank selection
 */
export function startTankSelectionPage() {
  const tankSelectPage = document.getElementById('tank-select-page');
  if (!tankSelectPage) return;
  
  // Clear old timer
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  // Lấy match data từ matchmaking page
  const matchData = getMatchData();
  const user = getUser();
  const myName = user?.displayName || user?.username || 'Player';
  
  currentSessionId = matchData?.sessionId || null;
  
  tankSelectPage.innerHTML = getTankSelectionTemplate(TANKS, matchData, myName);
  
  // Reset state
  remainingSeconds = 30;
  selectedTank = null;
  isReady = false;
  
  // Setup
  setupEventListeners(tankSelectPage);
  setupSocketListeners();
  startCountdown();
  
  console.log('✅ Tank Selection started - Session:', currentSessionId);
}

function setupEventListeners(container) {
  // Tank cards
  container.querySelectorAll('.ts-tank-card').forEach(card => {
    card.addEventListener('click', () => {
      if (!isReady) {
        selectTank(card.dataset.tankId);
      }
    });
  });
  
  // Ready button
  const readyBtn = container.querySelector('#ts-ready-btn');
  if (readyBtn) {
    readyBtn.addEventListener('click', () => {
      if (selectedTank && !isReady) {
        confirmReady();
      }
    });
  }
  
  // Cancel button
  const cancelBtn = container.querySelector('#ts-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      leaveTankSelect();
    });
  }
  
  // Category tabs
  container.querySelectorAll('.ts-category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      filterByCategory(tab.dataset.category);
      // Update active tab
      container.querySelectorAll('.ts-category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

function setupSocketListeners() {
  const socket = getSocket();
  if (!socket) return;
  
  // Đối thủ chọn tank
  socket.off('opponentSelectTank');
  socket.on('opponentSelectTank', (data) => {
    const tank = TANKS.find(t => t.id === data.tankId);
    const tankLabel = document.getElementById('opponent-tank-label');
    const tankPreview = document.getElementById('opponent-tank-preview');
    
    if (tankLabel) {
      tankLabel.textContent = tank ? tank.config.name : data.tankId;
      tankLabel.classList.add('selected');
    }
    
    if (tankPreview && tank) {
      tankPreview.innerHTML = `<img src="${tank.image}" alt="${tank.config.name}" />`;
    }
    
    console.log('🎯 Đối thủ chọn:', data.tankId);
  });
  
  // Đối thủ đã ready
  socket.off('opponentReady');
  socket.on('opponentReady', () => {
    const badge = document.getElementById('opponent-ready-badge');
    if (badge) {
      badge.textContent = '✅ Sẵn sàng!';
      badge.classList.remove('waiting');
      badge.classList.add('ready');
    }
    
    const slot = document.getElementById('opponent-player-slot');
    if (slot) slot.classList.add('ready');
    
    console.log('✅ Đối thủ đã sẵn sàng!');
  });
  
  // Cả 2 đều ready → vào game!
  socket.off('allReady');
  socket.on('allReady', (data) => {
    console.log('🚀 All ready! Vào game! Session:', data.sessionId);
    
    // Lưu thông tin game
    localStorage.setItem('selectedTank', selectedTank);
    localStorage.setItem('gameSessionId', data.sessionId);
    localStorage.setItem('gamePlayers', JSON.stringify(data.players));
    
    // Stop countdown
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    
    // Hiệu ứng rồi vào game
    const readyBtn = document.getElementById('ts-ready-btn');
    if (readyBtn) {
      readyBtn.textContent = '🚀 VÀO TRẬN!';
    }
    
    setTimeout(() => {
      navigateTo('/game');
    }, 1000);
  });
}

function selectTank(tankId) {
  selectedTank = tankId;
  const tank = TANKS.find(t => t.id === tankId);
  if (!tank) return;
  
  // Update UI: highlight selected card
  document.querySelectorAll('.ts-tank-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.tankId === tankId);
  });
  
  // Enable ready button
  const readyBtn = document.getElementById('ts-ready-btn');
  if (readyBtn) {
    readyBtn.disabled = false;
    readyBtn.classList.add('active');
  }
  
  // Update my tank label
  const myLabel = document.getElementById('my-tank-label');
  if (myLabel) {
    myLabel.textContent = tank.config.name;
    myLabel.classList.add('selected');
  }
  
  // Update my tank preview
  const myPreview = document.getElementById('my-tank-preview');
  if (myPreview) {
    myPreview.innerHTML = `<img src="${tank.image}" alt="${tank.config.name}" />`;
  }
  
  // Update stats
  const config = tank.config;
  const hpEl = document.getElementById('my-stat-hp');
  const spdEl = document.getElementById('my-stat-spd');
  const atkEl = document.getElementById('my-stat-atk');
  
  if (hpEl) hpEl.style.width = `${Math.min((config.stats.health / 1500) * 100, 100)}%`;
  if (spdEl) spdEl.style.width = `${Math.min((config.stats.speed / 200) * 100, 100)}%`;
  if (atkEl) atkEl.style.width = `${Math.min((config.weapon.damage / 100) * 100, 100)}%`;
  
  // Gửi socket event
  const socket = getSocket();
  if (socket && currentSessionId) {
    socket.emit('selectTank', {
      sessionId: currentSessionId,
      tankId
    });
  }
  
  console.log('🎯 Chọn tank:', tankId);
}

function confirmReady() {
  if (!selectedTank || isReady) return;
  isReady = true;
  
  // Update UI
  const readyBtn = document.getElementById('ts-ready-btn');
  if (readyBtn) {
    readyBtn.textContent = '✅ ĐÃ SẴN SÀNG';
    readyBtn.classList.remove('active');
    readyBtn.classList.add('confirmed');
    readyBtn.disabled = true;
  }
  
  const mySlot = document.getElementById('my-player-slot');
  if (mySlot) mySlot.classList.add('ready');
  
  // Gửi socket event
  const socket = getSocket();
  if (socket && currentSessionId) {
    socket.emit('confirmReady', {
      sessionId: currentSessionId
    });
  }
  
  console.log('✅ Đã xác nhận sẵn sàng!');
}

function filterByCategory(category) {
  const cards = document.querySelectorAll('.ts-tank-card');
  cards.forEach(card => {
    const tankId = card.dataset.tankId;
    const tank = TANKS.find(t => t.id === tankId);
    if (!tank) return;
    
    if (category === 'all' || tank.role.toLowerCase() === category) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  
  updateCountdown(remainingSeconds);
  
  countdownTimer = setInterval(() => {
    remainingSeconds--;
    updateCountdown(remainingSeconds);
    
    if (remainingSeconds <= 0) {
      // Auto-pick random tank nếu chưa chọn
      if (!selectedTank) {
        const randomIndex = Math.floor(Math.random() * TANKS.length);
        selectTank(TANKS[randomIndex].id);
      }
      // Auto-confirm nếu chưa ready
      if (!isReady) {
        confirmReady();
      }
    }
  }, 1000);
}

function leaveTankSelect() {
  // Stop countdown
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  // Cleanup socket listeners
  const socket = getSocket();
  if (socket) {
    socket.off('opponentSelectTank');
    socket.off('opponentReady');
    socket.off('allReady');
  }
  
  navigateTo('/lobby');
}

// Export for use in GameScene
export function getSelectedTank() {
  return localStorage.getItem('selectedTank') || 'gundam';
}

// Cleanup
export function cleanupTankSelection() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

// Expose to window
window.cleanupTankSelectionTimer = cleanupTankSelection;
