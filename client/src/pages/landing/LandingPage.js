/**
 * Landing Page - Home page with auth forms
 */

import { login, register } from '../../utils/auth.js';
import { navigateTo } from '../../utils/router.js';
import { getLandingTemplate } from './landingTemplate.js';

export function initLandingPage() {
  const landingPage = document.getElementById('landing-page');
  
  landingPage.innerHTML = getLandingTemplate();

  // Tab switching
  const tabs = landingPage.querySelectorAll('.auth-tab');
  const loginContainer = landingPage.querySelector('#login-form-container');
  const registerContainer = landingPage.querySelector('#register-form-container');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding form
      if (tabType === 'login') {
        loginContainer.classList.add('active');
        registerContainer.classList.remove('active');
      } else {
        registerContainer.classList.add('active');
        loginContainer.classList.remove('active');
      }
      
      // Clear errors
      clearErrors();
    });
  });

  // Login form handler
  const loginForm = landingPage.querySelector('#landing-login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = landingPage.querySelector('#landing-login-username').value.trim();
    const password = landingPage.querySelector('#landing-login-password').value;
    const loginBtn = landingPage.querySelector('#landing-login-btn');

    if (!username || !password) {
      showError('landing-login-error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Đang đăng nhập...';

    try {
      const data = await login(username, password);
      
      // Check if first login
      if (data.user.isFirstLogin) {
        navigateTo('/character-setup');
      } else {
        navigateTo('/lobby');
      }
    } catch (error) {
      showError('landing-login-error', error.message);
      loginBtn.disabled = false;
      loginBtn.textContent = 'Đăng Nhập';
    }
  });

  // Register form handler
  const registerForm = landingPage.querySelector('#landing-register-form');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = landingPage.querySelector('#landing-register-username').value.trim();
    const phone = landingPage.querySelector('#landing-register-phone').value.trim();
    const password = landingPage.querySelector('#landing-register-password').value;
    const registerBtn = landingPage.querySelector('#landing-register-btn');

    // Validation
    if (!username || !phone || !password) {
      showError('landing-register-error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      showError('landing-register-error', 'Tên tài khoản phải có 3-20 ký tự');
      return;
    }

    if (!/^[0-9]{10,11}$/.test(phone)) {
      showError('landing-register-error', 'Số điện thoại phải có 10-11 chữ số');
      return;
    }

    if (password.length < 6) {
      showError('landing-register-error', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = 'Đang đăng ký...';

    try {
      await register(username, phone, password);
      
      // Success - clear form and switch to login tab
      registerForm.reset();
      registerBtn.disabled = false;
      registerBtn.textContent = 'Đăng Ký';
      
      // Show success message
      showError('landing-register-error', '✅ Đăng ký thành công! Vui lòng đăng nhập.');
      
      // Auto switch to login tab after 1.5s
      setTimeout(() => {
        tabs[0].click(); // Click login tab
      }, 1500);
      
    } catch (error) {
      showError('landing-register-error', error.message);
      registerBtn.disabled = false;
      registerBtn.textContent = 'Đăng Ký';
    }
  });
}

// Helper functions
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
    
    // Green color for success messages
    if (message.includes('✅')) {
      errorEl.style.color = '#10b981';
    } else {
      errorEl.style.color = '#ef4444';
    }
  }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
    el.style.color = '';
  });
}
