/**
 * Landing Page - Home page with auth navigation buttons
 */

import { loginWithGoogle } from '../../utils/auth.js';
import { navigateTo } from '../../utils/router.js';
import { getLandingTemplate } from './landingTemplate.js';
import { initGoogleSignIn } from '../auth/googleSignIn.js';

export function initLandingPage() {
  const landingPage = document.getElementById('landing-page');
  
  landingPage.innerHTML = getLandingTemplate();

  // Login button -> navigate to /signin
  const loginBtn = landingPage.querySelector('#landing-login-btn');
  loginBtn.addEventListener('click', () => {
    navigateTo('/signin');
  });

  // Register button -> navigate to /signup
  const registerBtn = landingPage.querySelector('#landing-register-btn');
  registerBtn.addEventListener('click', () => {
    navigateTo('/signup');
  });

  // Google login button
  const googleBtn = landingPage.querySelector('#landing-google-btn');
  googleBtn.addEventListener('click', () => {
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
  });
}
