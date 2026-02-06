/**
 * Authentication Page - Login & Register
 * Trang đăng nhập và đăng ký với toggle
 */

import { login, register } from '../utils/auth.js';
import { navigateTo } from '../utils/router.js';

export function initAuthPage() {
  // Init both signin and signup pages
  initSigninPage();
  initSignupPage();
}

/**
 * Signin Page (Login)
 */
function initSigninPage() {
  const signinPage = document.getElementById('signin-page');
  
  signinPage.innerHTML = `
    <div class="gradient-bg"></div>
    <div class="auth-container">
      <div class="glass-card auth-card">
        <!-- Logo/Title -->
        <div class="auth-header text-center">
          <h1>🎮 TANK BANG BANG</h1>
          <p class="auth-subtitle">Chiến trận Tank đỉnh cao</p>
        </div>

        <!-- Login Form -->
        <form id="login-form" class="auth-form">
          <h2 class="text-center mb-md">Đăng Nhập</h2>

          <div class="form-group">
            <label class="form-label">Tài khoản</label>
            <input 
              type="text" 
              class="form-input" 
              id="login-username"
              placeholder="Nhập tên tài khoản"
              required
            />
            <div class="form-error" id="login-username-error"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Mật khẩu</label>
            <input 
              type="password" 
              class="form-input" 
              id="login-password"
              placeholder="Nhập mật khẩu"
              required
            />
            <div class="form-error" id="login-password-error"></div>
          </div>

          <div class="form-error show" id="login-error"></div>

          <button type="submit" class="btn btn-primary btn-full" id="login-btn">
            Đăng Nhập
          </button>

          <p class="auth-switch text-center mt-md">
            Chưa có tài khoản? <a href="/signup" class="auth-link">Đăng ký ngay</a>
          </p>
        </form>
      </div>
    </div>
  `;

  // Handle login
  const loginForm = signinPage.querySelector('#login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = signinPage.querySelector('#login-username').value.trim();
    const password = signinPage.querySelector('#login-password').value;
    const loginBtn = signinPage.querySelector('#login-btn');

    // Validation
    if (!username || !password) {
      showError('login-error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Đang đăng nhập<span class="spinner"></span>';

    try {
      await login(username, password);
      
      // Success - navigate to lobby
      navigateTo('/lobby');
    } catch (error) {
      showError('login-error', error.message);
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Đăng Nhập';
    }
  });

  // Handle signup link navigation
  signinPage.querySelector('.auth-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/signup');
  });
}

/**
 * Signup Page (Register)
 */
function initSignupPage() {
  const signupPage = document.getElementById('signup-page');
  
  signupPage.innerHTML = `
    <div class="gradient-bg"></div>
    <div class="auth-container">
      <div class="glass-card auth-card">
        <!-- Logo/Title -->
        <div class="auth-header text-center">
          <h1>🎮 TANK BANG BANG</h1>
          <p class="auth-subtitle">Chiến trận Tank đỉnh cao</p>
        </div>

        <!-- Register Form -->
        <form id="register-form" class="auth-form">
          <h2 class="text-center mb-md">Đăng Ký</h2>

          <div class="form-group">
            <label class="form-label">Tài khoản</label>
            <input 
              type="text" 
              class="form-input" 
              id="register-username"
              placeholder="3-20 ký tự"
              required
              minlength="3"
              maxlength="20"
            />
            <div class="form-error" id="register-username-error"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Số điện thoại</label>
            <input 
              type="tel" 
              class="form-input" 
              id="register-phone"
              placeholder="10-11 chữ số"
              required
              pattern="[0-9]{10,11}"
            />
            <div class="form-error" id="register-phone-error"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Mật khẩu</label>
            <input 
              type="password" 
              class="form-input" 
              id="register-password"
              placeholder="Tối thiểu 6 ký tự"
              required
              minlength="6"
            />
            <div class="form-error" id="register-password-error"></div>
          </div>

          <div class="form-error show" id="register-error"></div>

          <button type="submit" class="btn btn-primary btn-full" id="register-btn">
            Đăng Ký
          </button>

          <p class="auth-switch text-center mt-md">
            Đã có tài khoản? <a href="/signin" class="auth-link">Đăng nhập ngay</a>
          </p>
        </form>
      </div>
    </div>
  `;

  // Handle register
  const registerForm = signupPage.querySelector('#register-form');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = signupPage.querySelector('#register-username').value.trim();
    const phone = signupPage.querySelector('#register-phone').value.trim();
    const password = signupPage.querySelector('#register-password').value;
    const registerBtn = signupPage.querySelector('#register-btn');

    // Validation
    if (!username || !phone || !password) {
      showError('register-error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      showError('register-username-error', 'Tên tài khoản phải có 3-20 ký tự');
      return;
    }

    if (!/^[0-9]{10,11}$/.test(phone)) {
      showError('register-phone-error', 'Số điện thoại phải có 10-11 chữ số');
      return;
    }

    if (password.length < 6) {
      showError('register-password-error', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Loading state
    registerBtn.disabled = true;
    registerBtn.innerHTML = 'Đang đăng ký<span class="spinner"></span>';

    try {
      await register(username, phone, password);
      
      // Success - navigate to lobby
      navigateTo('/lobby');
    } catch (error) {
      showError('register-error', error.message);
      registerBtn.disabled = false;
      registerBtn.innerHTML = 'Đăng Ký';
    }
  });

  // Handle signin link navigation
  signupPage.querySelector('.auth-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/signin');
  });
}

// Helper functions
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
}
