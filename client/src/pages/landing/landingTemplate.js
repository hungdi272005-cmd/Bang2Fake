/**
 * Landing Page Template
 */

export function getLandingTemplate() {
  return `
    <div class="landing-bg"></div>
    
    <!-- Auth Panel (Top Right) -->
    <div class="auth-panel">
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Đăng Nhập</button>
        <button class="auth-tab" data-tab="register">Đăng Ký</button>
      </div>

      <!-- Login Form -->
      <div class="auth-form-container active" id="login-form-container">
        <form id="landing-login-form" class="compact-form">
          <input 
            type="text" 
            class="form-input-compact" 
            id="landing-login-username"
            placeholder="Tài khoản"
            required
          />
          <input 
            type="password" 
            class="form-input-compact" 
            id="landing-login-password"
            placeholder="Mật khẩu"
            required
          />
          <div class="form-error" id="landing-login-error"></div>
          <button type="submit" class="btn btn-primary btn-compact" id="landing-login-btn">
            Đăng Nhập
          </button>
        </form>
      </div>

      <!-- Register Form -->
      <div class="auth-form-container" id="register-form-container">
        <form id="landing-register-form" class="compact-form">
          <input 
            type="text" 
            class="form-input-compact" 
            id="landing-register-username"
            placeholder="Tài khoản (3-20 ký tự)"
            required
            minlength="3"
            maxlength="20"
          />
          <input 
            type="tel" 
            class="form-input-compact" 
            id="landing-register-phone"
            placeholder="Số điện thoại"
            required
            pattern="[0-9]{10,11}"
          />
          <input 
            type="password" 
            class="form-input-compact" 
            id="landing-register-password"
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            required
            minlength="6"
          />
          <div class="form-error" id="landing-register-error"></div>
          <button type="submit" class="btn btn-primary btn-compact" id="landing-register-btn">
            Đăng Ký
          </button>
        </form>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="game-logo">
          <h1 class="logo-text">🎮 TANK BANG BANG</h1>
          <div class="logo-subtitle">CHIẾN TRẬN TANK ĐỈNH CAO</div>
        </div>
        
        <p class="hero-description">
          Tham gia chiến trường tank căng thẳng! Chọn xe tăng, nâng cấp kỹ năng và chiến đấu 1v1 để trở thành huyền thoại!
        </p>

        <div class="hero-features">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div class="feature-text">PvP 1v1 Thời Gian Thực</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <div class="feature-text">Nhiều Loại Tank & Kỹ Năng</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏆</div>
            <div class="feature-text">Bảng Xếp Hạng Toàn Cầu</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
