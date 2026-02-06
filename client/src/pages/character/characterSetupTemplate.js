/**
 * Character Setup Page Template
 */

export function getCharacterSetupTemplate() {
  return `
    <div class="gradient-bg"></div>
    <div class="auth-container">
      <div class="glass-card character-card">
        <!-- Header -->
        <div class="auth-header text-center">
          <h1>🎮 Thiết Lập Nhân Vật</h1>
          <p class="auth-subtitle">Chọn biểu tượng và tên hiển thị của bạn</p>
        </div>

        <!-- Character Setup Form -->
        <form id="character-setup-form" class="auth-form">
          <!-- Avatar Selection -->
          <div class="form-group">
           <label class="form-label">Chọn Biểu Tượng</label>
            <div class="avatar-selection">
              <div class="avatar-option" data-avatar="male">
                <div class="avatar-icon">👨</div>
                <span>Nam</span>
              </div>
              <div class="avatar-option" data-avatar="female">
                <div class="avatar-icon">👩</div>
                <span>Nữ</span>
              </div>
            </div>
            <input type="hidden" id="selected-avatar" required />
            <div class="form-error" id="avatar-error"></div>
          </div>

          <!-- Display Name Input -->
          <div class="form-group">
            <label class="form-label">Tên Hiển Thị</label>
            <input 
              type="text" 
              class="form-input" 
              id="display-name"
              placeholder="3-20 ký tự"
              required
              minlength="3"
              maxlength="20"
            />
            <div class="form-error" id="display-name-error"></div>
          </div>

          <div class="form-error show" id="setup-error"></div>

          <button type="submit" class="btn btn-primary btn-full" id="setup-btn">
            Hoàn Tất
          </button>
        </form>
      </div>
    </div>
  `;
}
