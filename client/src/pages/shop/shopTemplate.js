/**
 * Shop Template
 * HTML template cho cửa hàng
 */

import { SHOP_CATEGORIES, SHOP_ITEMS, getRarityColor, getRarityName } from './shopMockData.js';

/**
 * Tạo HTML cho shop modal
 */
export function getShopModalHTML() {
  return `
    <div class="shop-overlay" id="shop-overlay">
      <div class="shop-modal">
        <!-- Header -->
        <div class="shop-header">
          <h2 class="shop-title">🏪 Cửa Hàng</h2>
          <button class="shop-close-btn" id="shop-close-btn">✕</button>
        </div>

        <!-- Tab Bar -->
        <div class="shop-tabs">
          ${SHOP_CATEGORIES.map((cat, i) => `
            <button class="shop-tab ${i === 0 ? 'active' : ''}" data-category="${cat.id}">
              <span class="shop-tab-icon">${cat.icon}</span>
              <span class="shop-tab-name">${cat.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Items Grid -->
        <div class="shop-content" id="shop-content">
          ${getItemsGridHTML('tank')}
        </div>

        <!-- Footer - Thông tin tiền tệ -->
        <div class="shop-footer">
          <div class="shop-currency">
            <span class="shop-currency-item">🪙 <span id="shop-gold">0</span></span>
            <span class="shop-currency-item">💎 <span id="shop-diamond">0</span></span>
          </div>
          <div class="shop-hint">Click vào vật phẩm để mua</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Tạo HTML cho grid items theo category
 */
export function getItemsGridHTML(categoryId) {
  const items = SHOP_ITEMS[categoryId] || [];

  if (items.length === 0) {
    return `<div class="shop-empty">Chưa có vật phẩm nào</div>`;
  }

  return `
    <div class="shop-items-grid">
      ${items.map(item => `
        <div class="shop-item-card" data-item-id="${item.id}" data-category="${categoryId}">
          <div class="shop-item-rarity-bar" style="background: ${getRarityColor(item.rarity)};"></div>
          <div class="shop-item-icon">${item.icon}</div>
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.description}</div>
          <div class="shop-item-rarity" style="color: ${getRarityColor(item.rarity)};">
            ${getRarityName(item.rarity)}
          </div>
          <div class="shop-item-price">
            <span class="shop-price-icon">${item.currency === 'gold' ? '🪙' : '💎'}</span>
            <span class="shop-price-value">${new Intl.NumberFormat('vi-VN').format(item.price)}</span>
          </div>
          <button class="shop-buy-btn">Mua</button>
        </div>
      `).join('')}
    </div>
  `;
}
