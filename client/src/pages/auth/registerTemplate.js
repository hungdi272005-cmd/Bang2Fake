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

          <p class="auth-switch text-center mt-md">
            Đã có tài khoản? <a href="/signin" class="auth-link">Đăng nhập ngay</a>
          </p>
        </form>
      </div>
    </div>
  `;
}
