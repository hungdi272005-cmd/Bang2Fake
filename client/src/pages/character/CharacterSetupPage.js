/**
 * Character Setup Page
 * Trang thiết lập nhân vật lần đầu đăng nhập
 */

import { setupCharacter, logout } from '../../utils/auth.js';
import { navigateTo } from '../../utils/router.js';
import { getCharacterSetupTemplate } from './characterSetupTemplate.js';

export function initCharacterSetupPage() {
  const setupPage = document.getElementById('character-setup-page');
  
  setupPage.innerHTML = getCharacterSetupTemplate();

  // Avatar selection handling
  const avatarOptions = setupPage.querySelectorAll('.avatar-option');
  const selectedAvatarInput = setupPage.querySelector('#selected-avatar');

  avatarOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all
      avatarOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked
      option.classList.add('active');
      
      // Set hidden input value
      selectedAvatarInput.value = option.dataset.avatar;
      
      // Clear error
      clearError('avatar-error');
    });
  });

  // Form submission
  const setupForm = setupPage.querySelector('#character-setup-form');
  setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    const avatar = selectedAvatarInput.value;
    const displayName = setupPage.querySelector('#display-name').value.trim();
    const setupBtn = setupPage.querySelector('#setup-btn');

    // Validation
    if (!avatar) {
      showError('avatar-error', 'Vui lòng chọn biểu tượng');
      return;
    }

    if (!displayName) {
      showError('display-name-error', 'Vui lòng nhập tên hiển thị');
      return;
    }

    if (displayName.length < 3 || displayName.length > 20) {
      showError('display-name-error', 'Tên hiển thị phải có 3-20 ký tự');
      return;
    }

    // Loading state
    setupBtn.disabled = true;
    setupBtn.innerHTML = 'Đang thiết lập<span class="spinner"></span>';

    try {
      await setupCharacter(avatar, displayName);
      
      // Success - navigate to lobby
      navigateTo('/lobby');
    } catch (error) {
      showError('setup-error', error.message);
      setupBtn.disabled = false;
      setupBtn.innerHTML = 'Hoàn Tất';
    }
  });

  // Handle logout/switch account
  const logoutBtn = setupPage.querySelector('#setup-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

// Helper functions
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

function clearError(elementId) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }
}

function clearAllErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
}
