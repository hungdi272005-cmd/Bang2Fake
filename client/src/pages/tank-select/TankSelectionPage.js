/**
 * Tank Selection Page - Chọn tank trước khi vào trận
 * Hiển thị sau khi tìm được trận
 */

import { navigateTo } from '../../utils/router.js';
import { getTankSelectionTemplate, updateCountdown } from './tankSelectionTemplate.js';
import { getGameMode } from '../game-room/GameRoomPage.js';

// Import tank configs
import GundamConfig from '../../entities/tanks/Gundam.js';
import PhoenixConfig from '../../entities/tanks/Phoenix.js';
import KakashiConfig from '../../entities/tanks/Kakashi.js';

let countdownTimer = null;
let remainingSeconds = 30; // 30 giây để chọn tank
let selectedTank = null;

// Danh sách tanks
const TANKS = [ 
  { id: 'gundam', config: GundamConfig, image: 'assets/Pictures_of_gundam/tank_gundam.png' },
  { id: 'phoenix', config: PhoenixConfig, image: 'assets/Pictures_of_phoenix/tank_phoenix.png' },
  { id: 'kakashi', config: KakashiConfig, image: 'assets/picktures_of_kakashi/tank_kakashi.png' }
];

/**
 * Init DOM only - gọi khi app load, không start timer
 */
export function initTankSelectionPage() {
  // Chỉ log, không làm gì cả - sẽ init khi navigate đến
  console.log('🔧 Tank Selection page registered');
}

/**
 * Thực sự khởi tạo trang tank selection - chỉ gọi khi navigate đến
 */
export function startTankSelectionPage() {
  const tankSelectPage = document.getElementById('tank-select-page');
  if (!tankSelectPage) return;
  
  // Clear any existing timer first
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  const gameMode = getGameMode();
  tankSelectPage.innerHTML = getTankSelectionTemplate(TANKS, gameMode);
  
  // Reset state
  remainingSeconds = 30;
  selectedTank = null;
  
  // Attach event listeners
  setupEventListeners(tankSelectPage);
  
  // Start countdown
  startCountdown();
  
  console.log('✅ Tank Selection page started');
}

function setupEventListeners(container) {
  // Tank cards
  const tankCards = container.querySelectorAll('.tank-card');
  tankCards.forEach(card => {
    card.addEventListener('click', () => {
      selectTank(card.dataset.tankId);
    });
  });
  
  // Confirm button
  const confirmBtn = container.querySelector('#confirm-tank-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      confirmSelection();
    });
  }
}

function selectTank(tankId) {
  selectedTank = tankId;
  
  // Update UI
  const tankCards = document.querySelectorAll('.tank-card');
  tankCards.forEach(card => {
    if (card.dataset.tankId === tankId) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
  
  // Enable confirm button
  const confirmBtn = document.getElementById('confirm-tank-btn');
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.classList.add('active');
  }
  
  console.log('🎯 Selected tank:', tankId);
}

function startCountdown() {
  // Clear any existing timer
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  
  updateCountdown(remainingSeconds);
  
  countdownTimer = setInterval(() => {
    remainingSeconds--;
    updateCountdown(remainingSeconds);
    
    if (remainingSeconds <= 0) {
      // Auto-pick random tank if not selected
      if (!selectedTank) {
        const randomIndex = Math.floor(Math.random() * TANKS.length);
        selectTank(TANKS[randomIndex].id);
      }
      confirmSelection();
    }
  }, 1000);
}

function confirmSelection() {
  // Stop countdown
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  // Default to first tank if none selected
  if (!selectedTank) {
    selectedTank = TANKS[0].id;
  }
  
  // Save selected tank
  localStorage.setItem('selectedTank', selectedTank);
  
  console.log('✅ Confirmed tank:', selectedTank);
  
  // Navigate to game
  navigateTo('/game');
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

// Expose to window for synchronous access
window.cleanupTankSelectionTimer = cleanupTankSelection;

