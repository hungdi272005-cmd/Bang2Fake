/**
 * Shop Modal Logic
 * Cửa hàng - mở/đóng modal, chuyển tab, mua vật phẩm (mock)
 */

import { getShopModalHTML, getItemsGridHTML } from './shopTemplate.js';
import { SHOP_ITEMS } from './shopMockData.js';
import './ShopModal.css';

let currentCategory = 'tank';

/**
 * Mở cửa hàng
 */
export function openShopModal() {
  // Nếu đã mở rồi thì bỏ qua
  if (document.getElementById('shop-container')) return;

  // Lấy thông tin user
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  // Render modal
  const container = document.createElement('div');
  container.id = 'shop-container';
  container.innerHTML = getShopModalHTML();
  document.body.appendChild(container);

  // Cập nhật tiền tệ
  const goldEl = document.getElementById('shop-gold');
  const diamondEl = document.getElementById('shop-diamond');
  if (goldEl) goldEl.textContent = new Intl.NumberFormat('vi-VN').format(user.gold || 0);
  if (diamondEl) diamondEl.textContent = new Intl.NumberFormat('vi-VN').format(user.diamonds || 0);

  // Reset category
  currentCategory = 'tank';

  // --- Events ---

  // Đóng modal
  document.getElementById('shop-close-btn').addEventListener('click', closeShopModal);
  document.getElementById('shop-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'shop-overlay') closeShopModal();
  });

  // ESC đóng modal
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeShopModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Tab switching
  const tabs = container.querySelectorAll('.shop-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const categoryId = tab.dataset.category;
      if (categoryId === currentCategory) return;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update content
      currentCategory = categoryId;
      const content = document.getElementById('shop-content');
      if (content) {
        content.innerHTML = getItemsGridHTML(categoryId);
        attachBuyEvents();
      }
    });
  });

  // Mua vật phẩm
  attachBuyEvents();
}

/**
 * Gắn events cho nút mua
 */
function attachBuyEvents() {
  const buyBtns = document.querySelectorAll('.shop-buy-btn');
  buyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.shop-item-card');
      const itemId = card?.dataset.itemId;
      const categoryId = card?.dataset.category;

      if (!itemId || !categoryId) return;

      const items = SHOP_ITEMS[categoryId] || [];
      const item = items.find(i => i.id === itemId);

      if (item) {
        // Mock mua hàng
        const currencyName = item.currency === 'gold' ? 'Vàng' : 'Kim Cương';
        const confirmed = confirm(
          `Mua "${item.name}" với giá ${new Intl.NumberFormat('vi-VN').format(item.price)} ${currencyName}?`
        );
        if (confirmed) {
          alert(`✅ Đã mua "${item.name}" thành công! (Mock)`);
        }
      }
    });
  });

  // Hover card
  const cards = document.querySelectorAll('.shop-item-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.shop-buy-btn')) return;
      // Có thể thêm popup xem chi tiết sau
    });
  });
}

/**
 * Đóng cửa hàng
 */
export function closeShopModal() {
  const container = document.getElementById('shop-container');
  if (container) {
    // Thêm animation đóng
    const overlay = container.querySelector('.shop-overlay');
    if (overlay) {
      overlay.style.animation = 'shopFadeOut 0.2s ease-out forwards';
      setTimeout(() => container.remove(), 200);
    } else {
      container.remove();
    }
  }
}
