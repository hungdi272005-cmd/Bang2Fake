/**
 * Rune Board Modal Logic
 * Bảng Ngọc - mở/đóng modal, gắn/gỡ ngọc, nâng cấp ngọc
 * Tất cả thao tác qua API server (không dùng localStorage)
 */

import { getRuneBoardModalHTML, getRuneSlotsHTML, getRuneInventoryHTML, getStatsHTML } from './runeBoardTemplate.js';
import { getRuneById } from './runeBoardData.js';
import { fetchRuneData, apiEquipRune, apiUnequipRune, apiUpgradeRune, apiCreatePage, apiRenamePage, apiDeletePage } from './runeApi.js';
import './RuneBoardModal.css';

// State
let runePages = [];
let inventory = {};
let activePageIndex = 0;
let selectedSlotIndex = null;
let currentTierFilter = 0;

/**
 * Mở Bảng Ngọc — load dữ liệu từ server
 */
export async function openRuneBoardModal() {
  if (document.getElementById('rb-container')) return;

  activePageIndex = 0;
  selectedSlotIndex = null;
  currentTierFilter = 0;

  // Show loading
  const container = document.createElement('div');
  container.id = 'rb-container';
  container.innerHTML = `
    <div class="rb-overlay" id="rb-overlay">
      <div class="rb-modal" style="display:flex;align-items:center;justify-content:center;">
        <div style="color:white;font-size:18px;font-weight:700;">⏳ Đang tải dữ liệu ngọc...</div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  try {
    // Load từ server
    const data = await fetchRuneData();
    runePages = data.pages.map(p => ({
      id: p.pageId,
      name: p.name,
      slots: p.slots,
    }));
    inventory = data.inventory || {};

    // Render UI
    container.innerHTML = getRuneBoardModalHTML(runePages, activePageIndex, inventory);
    attachAllEvents();
  } catch (error) {
    console.error('❌ Lỗi load rune data:', error);
    container.innerHTML = `
      <div class="rb-overlay" id="rb-overlay">
        <div class="rb-modal" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;">
          <div style="color:#ef4444;font-size:16px;font-weight:700;">❌ Không thể tải dữ liệu ngọc</div>
          <div style="color:#9ca3af;font-size:13px;">${error.message}</div>
          <button onclick="document.getElementById('rb-container')?.remove()" style="padding:8px 20px;border-radius:8px;border:1px solid #ef4444;background:rgba(239,68,68,0.2);color:white;cursor:pointer;">Đóng</button>
        </div>
      </div>
    `;
  }
}

/**
 * Đóng Bảng Ngọc
 */
export function closeRuneBoardModal() {
  const container = document.getElementById('rb-container');
  if (container) {
    const overlay = container.querySelector('.rb-overlay');
    if (overlay) {
      overlay.style.animation = 'rbFadeOut 0.2s ease-out forwards';
      setTimeout(() => container.remove(), 200);
    } else {
      container.remove();
    }
  }
}

// ==================== ATTACH ALL EVENTS ====================

function attachAllEvents() {
  attachCloseEvents();
  attachPageEvents();
  attachSlotEvents();
  attachInventoryEvents();
  attachTierFilterEvents();
  attachRenameEvent();
  attachDeletePageEvent();
  attachAddPageEvent();
  attachUpgradeEvents();
}

// ==================== CLOSE ====================

function attachCloseEvents() {
  document.getElementById('rb-close-btn')?.addEventListener('click', closeRuneBoardModal);

  document.getElementById('rb-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'rb-overlay') closeRuneBoardModal();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeRuneBoardModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

// ==================== PAGE TABS ====================

function attachPageEvents() {
  const pageList = document.getElementById('rb-page-list');
  if (!pageList) return;

  pageList.addEventListener('click', (e) => {
    const tab = e.target.closest('.rb-page-tab');
    if (!tab) return;

    const index = parseInt(tab.dataset.pageIndex);
    if (index === activePageIndex) return;

    activePageIndex = index;
    selectedSlotIndex = null;
    refreshUI();
  });
}

// ==================== SLOT EVENTS ====================

function attachSlotEvents() {
  const slotsContainer = document.getElementById('rb-slots-container');
  if (!slotsContainer) return;

  slotsContainer.addEventListener('click', async (e) => {
    const slot = e.target.closest('.rb-slot');
    if (!slot) return;

    const slotIndex = parseInt(slot.dataset.slotIndex);
    const currentPage = runePages[activePageIndex];
    const runeInSlot = currentPage.slots[slotIndex];

    if (runeInSlot) {
      // Gỡ ngọc → gọi API
      try {
        const data = await apiUnequipRune(currentPage.id, slotIndex);
        syncFromServer(data);
        selectedSlotIndex = null;
        refreshUI();
      } catch (err) {
        console.error('❌ Unequip error:', err);
      }
    } else {
      if (selectedSlotIndex === slotIndex) {
        selectedSlotIndex = null;
      } else {
        selectedSlotIndex = slotIndex;
      }
      highlightSelectedSlot();
    }
  });
}

// ==================== INVENTORY EVENTS ====================

function attachInventoryEvents() {
  const grid = document.getElementById('rb-inventory-grid');
  if (!grid) return;

  grid.addEventListener('click', async (e) => {
    if (e.target.closest('.rb-upgrade-btn')) return;

    const runeItem = e.target.closest('.rb-rune-item');
    if (!runeItem) return;

    const runeId = runeItem.dataset.runeId;
    if (!runeId) return;

    const qty = inventory[runeId] || 0;
    if (qty <= 0) {
      runeItem.classList.add('rb-shake');
      setTimeout(() => runeItem.classList.remove('rb-shake'), 500);
      return;
    }

    const currentPage = runePages[activePageIndex];
    let targetSlot = selectedSlotIndex;

    if (targetSlot === null) {
      targetSlot = currentPage.slots.findIndex(s => s === null);
      if (targetSlot === -1) {
        const slotsContainer = document.getElementById('rb-slots-container');
        if (slotsContainer) {
          slotsContainer.classList.add('rb-shake');
          setTimeout(() => slotsContainer.classList.remove('rb-shake'), 500);
        }
        return;
      }
    }

    try {
      const data = await apiEquipRune(currentPage.id, targetSlot, runeId);
      syncFromServer(data);
      selectedSlotIndex = null;
      refreshUI();
    } catch (err) {
      console.error('❌ Equip error:', err);
    }
  });
}

// ==================== UPGRADE ====================

function attachUpgradeEvents() {
  const grid = document.getElementById('rb-inventory-grid');
  if (!grid) return;

  grid.addEventListener('click', async (e) => {
    const upgradeBtn = e.target.closest('.rb-upgrade-btn');
    if (!upgradeBtn) return;

    e.stopPropagation();

    const runeId = upgradeBtn.dataset.runeId;

    try {
      const data = await apiUpgradeRune(runeId);
      // Cập nhật inventory từ server
      inventory = data.inventory || inventory;

      const sourceRune = getRuneById(data.sourceId);
      const targetRune = getRuneById(data.targetId);
      if (sourceRune && targetRune) {
        showUpgradeToast(sourceRune, targetRune);
      }

      refreshUI();
    } catch (err) {
      console.error('❌ Upgrade error:', err);
    }
  });
}

function showUpgradeToast(source, target) {
  const existing = document.querySelector('.rb-upgrade-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'rb-upgrade-toast';
  toast.innerHTML = `
    <span>5× ${source.icon} ${source.name}</span>
    <span class="rb-toast-arrow">→</span>
    <span>1× ${target.icon} ${target.name}</span>
    <span class="rb-toast-success">✅</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'rbFadeOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==================== TIER FILTER ====================

function attachTierFilterEvents() {
  const filterContainer = document.getElementById('rb-tier-filter');
  if (!filterContainer) return;

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.rb-tier-btn');
    if (!btn) return;

    filterContainer.querySelectorAll('.rb-tier-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentTierFilter = parseInt(btn.dataset.tier);
    const grid = document.getElementById('rb-inventory-grid');
    if (grid) {
      grid.innerHTML = getRuneInventoryHTML(currentTierFilter, inventory);
    }
  });
}

// ==================== RENAME ====================

function attachRenameEvent() {
  document.getElementById('rb-rename-btn')?.addEventListener('click', async () => {
    const currentPage = runePages[activePageIndex];
    const newName = prompt('Đổi tên trang ngọc:', currentPage.name);
    if (newName && newName.trim()) {
      try {
        const data = await apiRenamePage(currentPage.id, newName.trim().substring(0, 20));
        syncPagesFromServer(data.pages);
        refreshUI();
      } catch (err) {
        console.error('❌ Rename error:', err);
      }
    }
  });
}

// ==================== DELETE PAGE ====================

function attachDeletePageEvent() {
  document.getElementById('rb-delete-page-btn')?.addEventListener('click', async () => {
    if (runePages.length <= 1) return;

    const confirmed = confirm(`Xóa trang "${runePages[activePageIndex].name}"?`);
    if (confirmed) {
      try {
        const data = await apiDeletePage(runePages[activePageIndex].id);
        syncFromServer(data);
        activePageIndex = Math.min(activePageIndex, runePages.length - 1);
        refreshUI();
      } catch (err) {
        console.error('❌ Delete page error:', err);
      }
    }
  });
}

// ==================== ADD PAGE ====================

function attachAddPageEvent() {
  document.getElementById('rb-add-page-btn')?.addEventListener('click', async () => {
    if (runePages.length >= 5) {
      alert('Tối đa 5 trang ngọc!');
      return;
    }

    try {
      const data = await apiCreatePage();
      syncPagesFromServer(data.pages);
      activePageIndex = runePages.length - 1;
      refreshUI();
    } catch (err) {
      console.error('❌ Create page error:', err);
    }
  });
}

// ==================== SYNC & RENDER ====================

/**
 * Đồng bộ state từ server response
 */
function syncFromServer(data) {
  if (data.inventory) inventory = data.inventory;
  if (data.pages) syncPagesFromServer(data.pages);
}

function syncPagesFromServer(serverPages) {
  runePages = serverPages.map(p => ({
    id: p.pageId,
    name: p.name,
    slots: p.slots,
  }));
}

function refreshUI() {
  const container = document.getElementById('rb-container');
  if (!container) return;

  container.innerHTML = getRuneBoardModalHTML(runePages, activePageIndex, inventory);
  attachAllEvents();
  highlightSelectedSlot();
}

function highlightSelectedSlot() {
  const slotsContainer = document.getElementById('rb-slots-container');
  if (!slotsContainer) return;

  slotsContainer.querySelectorAll('.rb-slot').forEach((slot, i) => {
    if (i === selectedSlotIndex) {
      slot.classList.add('selected');
    } else {
      slot.classList.remove('selected');
    }
  });
}
