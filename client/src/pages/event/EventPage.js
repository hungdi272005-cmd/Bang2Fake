/**
 * Event Page - Trang sự kiện game
 * Logic xử lý + event listeners
 * HTML templates nằm trong eventTemplate.js
 */

import { navigateTo } from '../../utils/router.js';
import { fetchActiveEvents, fetchEventDetail, claimLoginReward, exchangeReward, seedTetEvent } from './eventApi.js';
import { getLoadingTemplate, getErrorTemplate, getEmptyTemplate, getEventPageTemplate } from './eventTemplate.js';

let countdownInterval = null;

/**
 * Khởi tạo trang Event
 */
export async function initEventPage() {
  const page = document.getElementById('events-page');
  if (!page) return;

  // Hiển thị loading
  page.innerHTML = getLoadingTemplate();

  // Back button
  page.querySelector('#event-back-btn').addEventListener('click', () => {
    cleanupEventPage();
    navigateTo('/lobby');
  });

  try {
    // Lấy danh sách events active
    let data = await fetchActiveEvents();

    // Nếu chưa có event nào, tự động seed Tết
    if (!data.events || data.events.length === 0) {
      console.log('🧧 Chưa có sự kiện, đang tạo sự kiện Tết...');
      await seedTetEvent();
      data = await fetchActiveEvents();
    }

    if (!data.events || data.events.length === 0) {
      page.innerHTML = getEmptyTemplate();
      attachBackButton(page);
      return;
    }

    // Lấy event đầu tiên (Tết)
    const firstEvent = data.events[0];
    const detail = await fetchEventDetail(firstEvent.eventId);

    renderEventPage(page, detail);
  } catch (error) {
    console.error('❌ Event page error:', error);
    page.innerHTML = getErrorTemplate(error.message);
    attachBackButton(page);
  }
}

/**
 * Render trang event chính (dùng template + gắn listeners)
 */
function renderEventPage(page, detail) {
  const { event, progress, meta } = detail;

  // Render HTML từ template
  page.innerHTML = getEventPageTemplate(event, progress, meta);

  // Gắn event listeners
  setupEventListeners(page, event, progress, meta);
  
  // Start countdown
  startCountdown(event.endDate);
}

/**
 * Gắn nút quay lại
 */
function attachBackButton(page) {
  page.querySelector('#event-back-btn')?.addEventListener('click', () => {
    cleanupEventPage();
    navigateTo('/lobby');
  });
}

/**
 * Setup tất cả event listeners
 */
function setupEventListeners(page, event, progress, meta) {
  // Back button
  attachBackButton(page);

  // Tab switching
  const tabLogin = page.querySelector('#tab-login');
  const tabExchange = page.querySelector('#tab-exchange');
  const contentLogin = page.querySelector('#tab-content-login');
  const contentExchange = page.querySelector('#tab-content-exchange');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabExchange.classList.remove('active');
    contentLogin.style.display = 'block';
    contentExchange.style.display = 'none';
  });

  tabExchange.addEventListener('click', () => {
    tabExchange.classList.add('active');
    tabLogin.classList.remove('active');
    contentExchange.style.display = 'block';
    contentLogin.style.display = 'none';
  });

  // Claim login reward button
  const claimBtns = page.querySelectorAll('.claim-login-btn');
  claimBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '...';
      try {
        const result = await claimLoginReward(event.eventId);
        showToast(result.message);

        // Cập nhật user trong localStorage
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }

        // Refresh page
        const updatedDetail = await fetchEventDetail(event.eventId);
        renderEventPage(page, updatedDetail);
      } catch (error) {
        showToast(error.message, true);
        btn.disabled = false;
        btn.textContent = 'Nhận';
      }
    });
  });

  // Exchange buttons
  const exchangeBtns = page.querySelectorAll('.exchange-btn');
  exchangeBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.getAttribute('data-item-id');
      btn.disabled = true;
      btn.textContent = '...';
      try {
        const result = await exchangeReward(event.eventId, itemId);
        showToast(result.message);

        // Cập nhật user trong localStorage
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }

        // Refresh page
        const updatedDetail = await fetchEventDetail(event.eventId);
        renderEventPage(page, updatedDetail);
      } catch (error) {
        showToast(error.message, true);
        btn.disabled = false;
        btn.textContent = 'Đổi';
      }
    });
  });
}

/**
 * Countdown timer tới khi hết event
 */
function startCountdown(endDate) {
  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '0';
      document.getElementById('cd-hours').textContent = '0';
      document.getElementById('cd-mins').textContent = '0';
      document.getElementById('cd-secs').textContent = '0';
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');

    if (dEl) dEl.textContent = days;
    if (hEl) hEl.textContent = hours.toString().padStart(2, '0');
    if (mEl) mEl.textContent = mins.toString().padStart(2, '0');
    if (sEl) sEl.textContent = secs.toString().padStart(2, '0');
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

/**
 * Toast notification
 */
function showToast(message, isError = false) {
  // Remove existing toast
  const existing = document.querySelector('.event-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `event-toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/**
 * Cleanup khi rời trang
 */
export function cleanupEventPage() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}
