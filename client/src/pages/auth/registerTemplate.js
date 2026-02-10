/**
 * Register Page Template
 */

export function getRegisterTemplate() {
  return `
    <div class="gradient-bg"></div>
    <div class="auth-container">
      <div class="glass-card auth-card">
        <!-- Logo/Title -->
        <div class="auth-header text-center">
          <h1>🎮 TANK BANG BANG</h1>
          <p class="auth-subtitle">Tạo tài khoản mới</p>
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
              placeholder="Nhập số điện thoại"
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

          <div class="auth-divider">
            <span>hoặc</span>
          </div>

          <button type="button" class="btn btn-google btn-full" id="register-google-btn">
            <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập bằng Google
          </button>

          <p class="auth-switch text-center mt-md">
            Đã có tài khoản? <a href="/signin" class="auth-link">Đăng nhập ngay</a>
          </p>
        </form>
      </div>
    </div>
  `;
}
