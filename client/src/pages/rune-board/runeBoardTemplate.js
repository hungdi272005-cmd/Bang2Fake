/**
 * Rune Board Template
 * HTML template cho Bảng Ngọc
 * Nhận inventory từ bên ngoài (không gọi localStorage/API trực tiếp)
 */

import { ALL_RUNES, SLOT_LABELS, STAT_NAMES, STAT_ICONS, getRuneById, getTierColor, getTierName, calculatePageStats } from './runeBoardData.js';

/**
 * Tạo HTML chính cho Bảng Ngọc modal
 * @param {Array} pages - danh sách trang ngọc
 * @param {number} activePageIndex - index trang đang chọn
 * @param {Object} inventory - { runeId: qty }
 */
export function getRuneBoardModalHTML(pages, activePageIndex, inventory = {}) {
  const activePage = pages[activePageIndex];
  const stats = calculatePageStats(activePage.slots);

  return `
    <div class="rb-overlay" id="rb-overlay">
      <div class="rb-modal">
        <!-- Header -->
        <div class="rb-header">
          <h2 class="rb-title">💎 Bảng Ngọc</h2>
          <button class="rb-close-btn" id="rb-close-btn">✕</button>
        </div>

        <div class="rb-body">
          <!-- Sidebar: Danh sách trang ngọc -->
          <div class="rb-sidebar">
            <div class="rb-sidebar-title">📋 Trang Ngọc</div>
            <div class="rb-page-list" id="rb-page-list">
              ${pages.map((page, i) => `
                <button class="rb-page-tab ${i === activePageIndex ? 'active' : ''}" data-page-index="${i}">
                  <span class="rb-page-name">${page.name}</span>
                  <span class="rb-page-slots">${page.slots.filter(s => s).length}/6</span>
                </button>
              `).join('')}
            </div>
            <button class="rb-add-page-btn" id="rb-add-page-btn">+ Thêm Trang</button>

            <!-- Tổng chỉ số -->
            <div class="rb-stats-summary">
              <div class="rb-stats-title">📊 Tổng Chỉ Số</div>
              ${Object.entries(stats).map(([stat, value]) => `
                <div class="rb-stat-row ${value > 0 ? 'active' : ''}">
                  <span class="rb-stat-icon">${STAT_ICONS[stat]}</span>
                  <span class="rb-stat-name">${STAT_NAMES[stat]}</span>
                  <span class="rb-stat-value">${value > 0 ? '+' + value + '%' : '0%'}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Main Content -->
          <div class="rb-main">
            <!-- Tiêu đề trang đang chọn -->
            <div class="rb-page-header">
              <span class="rb-page-active-name" id="rb-page-active-name">${activePage.name}</span>
              <button class="rb-rename-btn" id="rb-rename-btn" title="Đổi tên">✏️</button>
              ${pages.length > 1 ? `<button class="rb-delete-page-btn" id="rb-delete-page-btn" title="Xóa trang">🗑️</button>` : ''}
            </div>

            <!-- 6 Slot Ngọc -->
            <div class="rb-slots-container" id="rb-slots-container">
              ${getRuneSlotsHTML(activePage.slots)}
            </div>

            <!-- Kho Ngọc -->
            <div class="rb-inventory">
              <div class="rb-inventory-header">
                <span class="rb-inventory-title">🎒 Kho Ngọc</span>
                <div class="rb-tier-filter" id="rb-tier-filter">
                  <button class="rb-tier-btn active" data-tier="0">Tất cả</button>
                  <button class="rb-tier-btn" data-tier="1">Nhỏ</button>
                  <button class="rb-tier-btn" data-tier="2">Vừa</button>
                  <button class="rb-tier-btn" data-tier="3">Lớn</button>
                </div>
              </div>
              <div class="rb-inventory-grid" id="rb-inventory-grid">
                ${getRuneInventoryHTML(0, inventory)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render 6 slot ngọc
 */
export function getRuneSlotsHTML(slots) {
  return slots.map((runeId, index) => {
    const rune = runeId ? getRuneById(runeId) : null;
    const tierColor = rune ? getTierColor(rune.tier) : 'rgba(255,255,255,0.1)';
    const tierGlow = rune ? `0 0 15px ${tierColor}40` : 'none';

    return `
      <div class="rb-slot ${rune ? 'filled' : 'empty'}" data-slot-index="${index}"
           style="--slot-color: ${tierColor}; --slot-glow: ${tierGlow};">
        <div class="rb-slot-inner">
          ${rune ? `
            <span class="rb-slot-icon">${rune.icon}</span>
            <span class="rb-slot-tier" style="color: ${tierColor}">${getTierName(rune.tier)}</span>
          ` : `
            <span class="rb-slot-empty-icon">+</span>
          `}
        </div>
        <div class="rb-slot-label">${SLOT_LABELS[index]}</div>
        ${rune ? `<div class="rb-slot-tooltip">${rune.name}<br><span style="color:${tierColor}">${rune.description}</span></div>` : ''}
      </div>
    `;
  }).join('');
}

/**
 * Render kho ngọc (filter theo tier, 0 = tất cả)
 * @param {number} tierFilter - 0: tất cả, 1/2/3: tier cụ thể
 * @param {Object} inventory - { runeId: qty }
 */
export function getRuneInventoryHTML(tierFilter, inventory = {}) {
  const filtered = tierFilter === 0
    ? ALL_RUNES
    : ALL_RUNES.filter(r => r.tier === tierFilter);

  return filtered.map(rune => {
    const tierColor = getTierColor(rune.tier);
    const qty = inventory[rune.id] || 0;
    const canUpgrade = rune.tier < 3 && qty >= 5;
    const nextTierRune = ALL_RUNES.find(r => r.stat === rune.stat && r.tier === rune.tier + 1);

    return `
      <div class="rb-rune-item ${qty === 0 ? 'rb-rune-empty' : ''}" data-rune-id="${rune.id}" title="${rune.name}: ${rune.description}">
        <div class="rb-rune-icon-wrap" style="border-color: ${tierColor}; box-shadow: 0 0 10px ${tierColor}30;">
          <span class="rb-rune-icon">${rune.icon}</span>
          <span class="rb-rune-qty ${qty === 0 ? 'zero' : ''}">${qty}</span>
        </div>
        <div class="rb-rune-info">
          <span class="rb-rune-name">${rune.name}</span>
          <span class="rb-rune-desc" style="color: ${tierColor}">${rune.description}</span>
        </div>
        ${canUpgrade && nextTierRune ? `
          <button class="rb-upgrade-btn" data-rune-id="${rune.id}" data-target-id="${nextTierRune.id}" title="5x ${rune.name} → 1x ${nextTierRune.name}">
            ⬆️
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
}

/**
 * Render phần tổng chỉ số (dùng khi cập nhật)
 */
export function getStatsHTML(slots) {
  const stats = calculatePageStats(slots);

  return Object.entries(stats).map(([stat, value]) => `
    <div class="rb-stat-row ${value > 0 ? 'active' : ''}">
      <span class="rb-stat-icon">${STAT_ICONS[stat]}</span>
      <span class="rb-stat-name">${STAT_NAMES[stat]}</span>
      <span class="rb-stat-value">${value > 0 ? '+' + value + '%' : '0%'}</span>
    </div>
  `).join('');
}
