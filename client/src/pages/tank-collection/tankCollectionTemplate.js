/**
 * Tank Collection Template
 * HTML template cho kho tank - layout grid bên trái, chi tiết bên phải
 * Mỗi tank có phần Ngọc Phù Trợ riêng + picker chọn trang ngọc
 * Nhận runeData từ bên ngoài (API), không gọi trực tiếp
 */

import { ALL_TANKS, getTankRarityColor, getTankRarityName, getRoleColor } from './tankCollectionData.js';
import { getRuneById, getTierColor, calculatePageStats, STAT_NAMES, STAT_ICONS } from '../rune-board/runeBoardData.js';
import { getDisplayStats } from '../../utils/runeStats.js';

/**
 * Tạo HTML chính cho modal Kho Tank
 */
export function getTankCollectionModalHTML(selectedTankId) {
  const selectedTank = ALL_TANKS.find(t => t.id === selectedTankId) || ALL_TANKS[0];

  return `
    <div class="tc-overlay" id="tc-overlay">
      <div class="tc-modal">
        <!-- Header -->
        <div class="tc-header">
          <h2 class="tc-title">🔫 Kho Tank</h2>
          <div class="tc-count">${ALL_TANKS.filter(t => t.owned).length}/${ALL_TANKS.length} Tank</div>
          <button class="tc-close-btn" id="tc-close-btn">✕</button>
        </div>

        <div class="tc-body">
          <!-- Bên trái: Grid tank -->
          <div class="tc-left-panel">
            <div class="tc-tank-grid" id="tc-tank-grid">
              ${ALL_TANKS.map(tank => {
                const rarityColor = getTankRarityColor(tank.rarity);
                return `
                  <div class="tc-grid-card ${tank.id === selectedTankId ? 'active' : ''} ${!tank.owned ? 'locked' : ''}" 
                       data-tank-id="${tank.id}">
                    <div class="tc-grid-rarity-glow" style="--rarity-color: ${rarityColor};"></div>
                    <div class="tc-grid-img-wrap">
                      <img class="tc-grid-img" src="${tank.image}" alt="${tank.name}" onerror="this.innerHTML=''; this.parentElement.innerHTML='<span class=\\'tc-grid-icon\\'>${tank.icon}</span>'" />
                    </div>
                    <div class="tc-grid-name">${tank.name}</div>
                    <div class="tc-grid-rarity" style="color: ${rarityColor}">${getTankRarityName(tank.rarity)}</div>
                    ${!tank.owned ? '<div class="tc-grid-lock">🔒</div>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bên phải: Chi tiết tank (render bởi JS sau khi load rune data) -->
          <div class="tc-detail" id="tc-detail">
            <div style="color:#9ca3af;text-align:center;padding:40px;">⏳ Đang tải...</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render chi tiết 1 tank (bao gồm Ngọc Phù Trợ)
 * @param {Object} tank
 * @param {Object} runeData - { pages, tankMapping } từ API
 */
export function getTankDetailHTML(tank, runeData = null) {
  const rarityColor = getTankRarityColor(tank.rarity);
  const maxStat = { health: 1500, speed: 150, damage: 60, range: 500 };

  return `
    <!-- Tên + Role -->
    <div class="tc-detail-header">
      <div class="tc-detail-icon">${tank.icon}</div>
      <div class="tc-detail-title">
        <h3 class="tc-detail-name">${tank.name}</h3>
        <span class="tc-detail-rarity" style="color: ${rarityColor}">${getTankRarityName(tank.rarity)}</span>
        <span class="tc-detail-role" style="background: ${getRoleColor(tank.role)}20; color: ${getRoleColor(tank.role)}; border: 1px solid ${getRoleColor(tank.role)}40;">${tank.role}</span>
      </div>
    </div>

    <p class="tc-detail-desc">${tank.description}</p>

    <!-- Ảnh tank lớn -->
    <div class="tc-detail-image-wrap">
      <img class="tc-detail-image" src="${tank.image}" alt="${tank.name}" onerror="this.style.display='none'" />
    </div>

    <!-- 💎 Ngọc Phù Trợ -->
    ${getRuneSectionHTML(tank.id, runeData)}

    <!-- Stats -->
    ${getStatsBlockHTML(tank, runeData)}

    <!-- Skills -->
    <div class="tc-detail-skills">
      <div class="tc-skills-title">⚡ Kỹ Năng</div>
      <div class="tc-skills-grid">
        ${tank.skills.map(skill => `
          <div class="tc-skill-item">
            <span class="tc-skill-key">${skill.key}</span>
            <div class="tc-skill-info">
              <span class="tc-skill-name">${skill.name}</span>
              <span class="tc-skill-desc">${skill.desc}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render phần Ngọc Phù Trợ cho 1 tank
 * @param {string} tankId
 * @param {Object|null} runeData - { pages, tankMapping }
 */
function getRuneSectionHTML(tankId, runeData) {
  if (!runeData) {
    return `
      <div class="tc-rune-section">
        <div class="tc-rune-header">
          <span class="tc-rune-title">💎 Ngọc Phù Trợ</span>
        </div>
        <div class="tc-rune-empty">Đang tải dữ liệu ngọc...</div>
      </div>
    `;
  }

  const { pages, tankMapping } = runeData;
  const assignedPageId = tankMapping[tankId];
  const assignedPage = pages.find(p => p.pageId === assignedPageId);

  if (!assignedPage) {
    return `
      <div class="tc-rune-section">
        <div class="tc-rune-header">
          <span class="tc-rune-title">💎 Ngọc Phù Trợ</span>
          <button class="tc-rune-edit-btn" id="tc-open-rune-picker" data-tank-id="${tankId}">Chọn trang ngọc →</button>
        </div>
        <div class="tc-rune-empty">Chưa gắn trang ngọc</div>
      </div>
    `;
  }

  const stats = calculatePageStats(assignedPage.slots);

  return `
    <div class="tc-rune-section">
      <div class="tc-rune-header">
        <span class="tc-rune-title">💎 Ngọc Phù Trợ</span>
        <span class="tc-rune-page-name">${assignedPage.name}</span>
        <button class="tc-rune-edit-btn" id="tc-open-rune-picker" data-tank-id="${tankId}">Đổi trang ngọc →</button>
      </div>
      <div class="tc-rune-slots">
        ${assignedPage.slots.map(runeId => {
          if (!runeId) {
            return `<div class="tc-rune-slot empty"><span class="tc-rune-slot-empty">+</span></div>`;
          }
          const rune = getRuneById(runeId);
          if (!rune) return '';
          const tierColor = getTierColor(rune.tier);
          return `
            <div class="tc-rune-slot filled" title="${rune.name}: ${rune.description}" style="border-color: ${tierColor}; box-shadow: 0 0 8px ${tierColor}30;">
              <span class="tc-rune-slot-icon">${rune.icon}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="tc-rune-stats-preview">
        ${Object.entries(stats).filter(([, v]) => v > 0).map(([stat, value]) => 
          `<span class="tc-rune-stat-chip">${STAT_ICONS[stat]} +${value}% ${STAT_NAMES[stat]}</span>`
        ).join('')}
      </div>
    </div>
  `;
}

/**
 * Render popup chọn trang ngọc để gắn vào tank
 * @param {string} tankId
 * @param {Object} runeData - { pages, tankMapping }
 */
export function getRunePagePickerHTML(tankId, runeData) {
  const { pages, tankMapping } = runeData;
  const currentPageId = tankMapping[tankId];
  const tank = ALL_TANKS.find(t => t.id === tankId);

  return `
    <div class="tc-picker-overlay" id="tc-picker-overlay">
      <div class="tc-picker-modal">
        <div class="tc-picker-header">
          <h3 class="tc-picker-title">💎 Chọn Trang Ngọc cho ${tank?.name || 'Tank'}</h3>
          <button class="tc-picker-close" id="tc-picker-close">✕</button>
        </div>
        <div class="tc-picker-list">
          ${pages.length === 0 
            ? '<div class="tc-picker-empty">Chưa có trang ngọc nào. Hãy tạo ở Bảng Ngọc!</div>'
            : pages.map(page => {
              const stats = calculatePageStats(page.slots);
              const filledCount = page.slots.filter(s => s).length;
              const isActive = page.pageId === currentPageId;
              return `
                <div class="tc-picker-item ${isActive ? 'active' : ''}" data-page-id="${page.pageId}">
                  <div class="tc-picker-item-top">
                    <span class="tc-picker-item-name">${page.name}</span>
                    <span class="tc-picker-item-count">${filledCount}/6</span>
                    ${isActive ? '<span class="tc-picker-item-badge">Đang dùng</span>' : ''}
                  </div>
                  <div class="tc-picker-item-runes">
                    ${page.slots.map(runeId => {
                      if (!runeId) return '<span class="tc-picker-rune empty">·</span>';
                      const rune = getRuneById(runeId);
                      return rune ? `<span class="tc-picker-rune" title="${rune.name}" style="border-color: ${getTierColor(rune.tier)}">${rune.icon}</span>` : '';
                    }).join('')}
                  </div>
                  <div class="tc-picker-item-stats">
                    ${Object.entries(stats).filter(([, v]) => v > 0).map(([stat, value]) =>
                      `<span class="tc-picker-stat">${STAT_ICONS[stat]}+${value}%</span>`
                    ).join('')}
                    ${Object.values(stats).every(v => v === 0) ? '<span class="tc-picker-stat dim">Chưa có ngọc</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')
          }
        </div>
        <div class="tc-picker-footer">
          <button class="tc-picker-goto-board" id="tc-picker-goto-board">💎 Mở Bảng Ngọc</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render block thông số tank với bonus từ ngọc
 */
function getStatsBlockHTML(tank, runeData) {
  const maxStat = { health: 1500, speed: 150, damage: 60, range: 500 };

  // Tìm rune slots đang gắn cho tank này
  let runeSlots = null;
  if (runeData) {
    const assignedPageId = runeData.tankMapping?.[tank.id];
    if (assignedPageId) {
      const page = runeData.pages.find(p => p.pageId === assignedPageId);
      if (page) runeSlots = page.slots;
    }
  }

  const ds = getDisplayStats(tank.stats, runeSlots);

  // Helper render 1 stat row
  const statRow = (icon, label, key, max) => {
    const s = ds[key];
    const barWidth = Math.min((s.total / max) * 100, 100);
    const bonusBarWidth = s.bonus > 0 ? Math.min((s.bonus / max) * 100, 30) : 0;
    return `
      <div class="tc-stat-row">
        <span class="tc-stat-label">${icon} ${label}</span>
        <div class="tc-stat-bar">
          <div class="tc-stat-fill ${key}" style="width: ${barWidth}%"></div>
          ${s.bonus > 0 ? `<div class="tc-stat-fill-bonus" style="left: ${barWidth - bonusBarWidth}%; width: ${bonusBarWidth}%"></div>` : ''}
        </div>
        <span class="tc-stat-val">
          ${s.total}
          ${s.bonus > 0 ? `<span class="tc-stat-bonus">+${s.bonus}</span>` : ''}
        </span>
      </div>
    `;
  };

  // Bonus-only stats (%, không có base)
  const bonusStats = [
    { icon: '🛡️', label: 'Giáp', key: 'defense' },
    { icon: '💥', label: 'Bạo kích', key: 'crit' },
    { icon: '❤️‍🩹', label: 'Hút máu', key: 'vampirism' },
  ];

  const bonusRows = bonusStats
    .filter(b => ds[b.key].total > 0)
    .map(b => `
      <div class="tc-stat-row">
        <span class="tc-stat-label">${b.icon} ${b.label}</span>
        <div class="tc-stat-bar">
          <div class="tc-stat-fill crit" style="width: ${Math.min(ds[b.key].total * 3, 100)}%"></div>
          ${ds[b.key].bonus > 0 ? `<div class="tc-stat-fill-bonus" style="left: ${Math.min((ds[b.key].base) * 3, 100) - Math.min(ds[b.key].bonus * 3, 30)}%; width: ${Math.min(ds[b.key].bonus * 3, 30)}%"></div>` : ''}
        </div>
        <span class="tc-stat-val">
          ${ds[b.key].total}%
          ${ds[b.key].bonus > 0 ? `<span class="tc-stat-bonus">+${ds[b.key].bonus}%</span>` : ''}
        </span>
      </div>
    `).join('');

  return `
    <div class="tc-detail-stats">
      <div class="tc-stats-heading">📊 Thông Số ${runeSlots ? '<span class="tc-stats-rune-badge">💎 Ngọc đã áp dụng</span>' : ''}</div>
      ${statRow('❤️', 'HP', 'health', maxStat.health)}
      ${statRow('💨', 'Tốc độ', 'speed', maxStat.speed)}
      ${statRow('⚔️', 'Sát thương', 'damage', maxStat.damage)}
      ${statRow('🎯', 'Tầm bắn', 'range', maxStat.range)}
      ${bonusRows}
    </div>
  `;
}
