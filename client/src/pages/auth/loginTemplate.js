/**
 * Login Page Template
 */

export function getLoginTemplate() {
  return `
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
}
