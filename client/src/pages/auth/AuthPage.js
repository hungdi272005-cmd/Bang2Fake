/**
 * Authentication Page - Login & Register
 * Trang đăng nhập và đăng ký với toggle
 */

import { login, register, loginWithGoogle } from '../../utils/auth.js';
import { navigateTo } from '../../utils/router.js';
import { getLoginTemplate } from './loginTemplate.js';
import { getRegisterTemplate } from './registerTemplate.js';
import { initGoogleSignIn } from './googleSignIn.js';

export function initAuthPage() {
  // Init both signin and signup pages
  initSigninPage();
  initSignupPage();
}

/**
 * Google login handler - dùng chung cho cả signin và signup
 */
function handleGoogleLogin() {
  initGoogleSignIn(async (credential) => {
    try {
      const data = await loginWithGoogle(credential);
      
      if (data.user.isFirstLogin) {
        navigateTo('/character-setup');
      } else {
        navigateTo('/lobby');
      }
    } catch (error) {
      alert('Đăng nhập Google thất bại: ' + error.message);
    }
  });
}

/**
 * Signin Page (Login)
 */
function initSigninPage() {
  const signinPage = document.getElementById('signin-page');
  
  signinPage.innerHTML = getLoginTemplate();

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
      const data = await login(username, password);
      
      // Check if first login
      if (data.user.isFirstLogin) {
        navigateTo('/character-setup');
      } else {
        navigateTo('/lobby');
      }
    } catch (error) {
      showError('login-error', error.message);
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Đăng Nhập';
    }
  });

  // Handle link navigation
  const signupLink = signinPage.querySelector('.auth-link');
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/signup');
  });

  // Handle Google login button
  const googleBtn = signinPage.querySelector('#login-google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleLogin);
  }
}

/**
 * Signup Page (Register)
 */
function initSignupPage() {
  const signupPage = document.getElementById('signup-page');
  
  signupPage.innerHTML = getRegisterTemplate();

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
      showError('register-error', 'Tên tài khoản phải có 3-20 ký tự');
      return;
    }

    if (!/^[0-9]{10,11}$/.test(phone)) {
      showError('register-error', 'Số điện thoại phải có 10-11 chữ số');
      return;
    }

    if (password.length < 6) {
      showError('register-error', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Loading state
    registerBtn.disabled = true;
    registerBtn.innerHTML = 'Đang đăng ký<span class="spinner"></span>';

    try {
      const data = await register(username, phone, password);
      
      // After registration, redirect to signin
      navigateTo('/signin');
    } catch (error) {
      showError('register-error', error.message);
      registerBtn.disabled = false;
      registerBtn.innerHTML = 'Đăng Ký';
    }
  });

  // Handle link navigation
  const signinLink = signupPage.querySelector('.auth-link');
  signinLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/signin');
  });

  // Handle Google login button
  const googleBtn = signupPage.querySelector('#register-google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleLogin);
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

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
}
