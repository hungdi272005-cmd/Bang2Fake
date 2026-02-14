/**
 * Tank Collection Modal Logic
 * Kho Tank - xem tank, gắn trang ngọc phù trợ cho từng tank
 * Dữ liệu ngọc load từ API server
 */

import { getTankCollectionModalHTML, getTankDetailHTML, getRunePagePickerHTML } from './tankCollectionTemplate.js';
import { ALL_TANKS } from './tankCollectionData.js';
import { openRuneBoardModal } from '../rune-board/RuneBoardModal.js';
import { fetchRuneData, apiSetTankMapping } from '../rune-board/runeApi.js';
import './TankCollectionModal.css';

let selectedTankId = null;
let runeData = null; // { pages, tankMapping, inventory }

/**
 * Mở Kho Tank — load rune data từ server
 */
export async function openTankCollectionModal() {
  if (document.getElementById('tc-container')) return;

  selectedTankId = ALL_TANKS[0].id;

  const container = document.createElement('div');
  container.id = 'tc-container';
  container.innerHTML = getTankCollectionModalHTML(selectedTankId);
  document.body.appendChild(container);

  attachCloseEvents();
  attachTankGridEvents();

  // Load rune data từ server
  try {
    const data = await fetchRuneData();
    runeData = data;
    updateDetailPanel();
  } catch (err) {
    console.error('❌ Lỗi load rune data cho kho tank:', err);
    // Vẫn hiển thị tank detail, chỉ không có phần ngọc
    const tank = ALL_TANKS.find(t => t.id === selectedTankId);
    const detail = document.getElementById('tc-detail');
    if (tank && detail) {
      detail.innerHTML = getTankDetailHTML(tank, null);
    }
  }
}

/**
 * Đóng Kho Tank
 */
export function closeTankCollectionModal() {
  const container = document.getElementById('tc-container');
  if (container) {
    const overlay = container.querySelector('.tc-overlay');
    if (overlay) {
      overlay.style.animation = 'tcFadeOut 0.2s ease-out forwards';
      setTimeout(() => container.remove(), 200);
    } else {
      container.remove();
    }
  }
}

// ==================== CLOSE EVENTS ====================

function attachCloseEvents() {
  document.getElementById('tc-close-btn')?.addEventListener('click', closeTankCollectionModal);

  document.getElementById('tc-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'tc-overlay') closeTankCollectionModal();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      const picker = document.getElementById('tc-picker-overlay');
      if (picker) {
        closeRunePagePicker();
        return;
      }
      closeTankCollectionModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

// ==================== TANK GRID EVENTS ====================

function attachTankGridEvents() {
  const grid = document.getElementById('tc-tank-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.tc-grid-card');
    if (!card || card.classList.contains('locked')) return;

    const tankId = card.dataset.tankId;
    if (tankId === selectedTankId) return;

    selectedTankId = tankId;

    grid.querySelectorAll('.tc-grid-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    updateDetailPanel();
  });
}

// ==================== DETAIL PANEL ====================

function updateDetailPanel() {
  const tank = ALL_TANKS.find(t => t.id === selectedTankId);
  const detail = document.getElementById('tc-detail');
  if (tank && detail) {
    detail.innerHTML = getTankDetailHTML(tank, runeData);
    detail.style.animation = 'none';
    detail.offsetHeight;
    detail.style.animation = 'tcSlideIn 0.3s ease-out';
    attachRuneEditEvent();
  }
}

// ==================== RUNE PICKER ====================

function attachRuneEditEvent() {
  document.getElementById('tc-open-rune-picker')?.addEventListener('click', (e) => {
    const tankId = e.currentTarget.dataset.tankId;
    openRunePagePicker(tankId);
  });
}

function openRunePagePicker(tankId) {
  closeRunePagePicker();

  if (!runeData) return;

  const pickerWrap = document.createElement('div');
  pickerWrap.id = 'tc-picker-container';
  pickerWrap.innerHTML = getRunePagePickerHTML(tankId, runeData);
  document.body.appendChild(pickerWrap);

  // Đóng picker
  document.getElementById('tc-picker-close')?.addEventListener('click', closeRunePagePicker);
  document.getElementById('tc-picker-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'tc-picker-overlay') closeRunePagePicker();
  });

  // Click chọn trang ngọc → gọi API
  const items = pickerWrap.querySelectorAll('.tc-picker-item');
  items.forEach(item => {
    item.addEventListener('click', async () => {
      const pageId = item.dataset.pageId;
      await applyRunePageToTank(tankId, pageId);
    });
  });

  // Mở Bảng Ngọc
  document.getElementById('tc-picker-goto-board')?.addEventListener('click', () => {
    closeRunePagePicker();
    closeTankCollectionModal();
    setTimeout(() => openRuneBoardModal(), 250);
  });
}

function closeRunePagePicker() {
  const container = document.getElementById('tc-picker-container');
  if (container) {
    const overlay = container.querySelector('.tc-picker-overlay');
    if (overlay) {
      overlay.style.animation = 'tcFadeOut 0.15s ease-out forwards';
      setTimeout(() => container.remove(), 150);
    } else {
      container.remove();
    }
  }
}

/**
 * Áp dụng trang ngọc cho tank → gọi API + refresh UI
 */
async function applyRunePageToTank(tankId, pageId) {
  try {
    const data = await apiSetTankMapping(tankId, pageId);

    // Cập nhật local state
    if (runeData) {
      runeData.tankMapping = data.tankMapping;
    }

    closeRunePagePicker();
    updateDetailPanel();

    // Flash animation
    const runeSection = document.querySelector('.tc-rune-section');
    if (runeSection) {
      runeSection.classList.add('tc-rune-flash');
      setTimeout(() => runeSection.classList.remove('tc-rune-flash'), 600);
    }
  } catch (err) {
    console.error('❌ Set tank mapping error:', err);
  }
}
