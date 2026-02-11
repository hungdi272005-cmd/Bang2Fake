/**
 * Landing Page Template
 */

export function getLandingTemplate() {
  return `
    <div class="landing-bg"></div>
    
    <!-- Auth Buttons (Top Right) -->
    <div class="auth-panel">
      <div class="auth-buttons">
        <button class="btn btn-primary btn-compact" id="landing-login-btn">Đăng Nhập</button>
        <button class="btn btn-secondary btn-compact" id="landing-register-btn">Đăng Ký</button>
      </div>
      <button class="btn btn-google" id="landing-google-btn">
        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Đăng nhập bằng Google
      </button>
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
