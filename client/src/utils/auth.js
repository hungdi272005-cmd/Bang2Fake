/**
 * Authentication Utilities
 * Xử lý đăng ký, đăng nhập và quản lý JWT token
 */

const API_URL = 'http://localhost:3000/api';

/**
 * Đăng ký tài khoản mới
 */
export async function register(username, phone, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, phone, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    // Lưu token vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Đăng nhập
 */
export async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    // Lưu token vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Đăng nhập bằng Google OAuth
 */
export async function loginWithGoogle(credential) {
  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ credential })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập Google thất bại');
    }

    // Lưu token vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Đăng xuất
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentPath'); 
  window.location.href = '/landingpage'; // Force reload to clear all memory states
}

/**
 * Hiển thị Modal thông báo hết hạn phiên đăng nhập
 */
function showSessionExpiredModal() {
  // Tạo element modal
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  overlay.innerHTML = `
    <div class="modal-container glass-card">
      <div class="modal-header">
        <span class="modal-icon">⚠️</span>
        <h3 class="modal-title">Thông báo hệ thống</h3>
      </div>
      <div class="modal-body">
        <p>Tài khoản của bạn đang được đăng nhập ở một nơi khách. Vui lòng kiểm tra lại.</p>
      </div>
      <div class="modal-footer">
        <button id="session-ok-btn" class="btn btn-primary">Xác nhận (OK)</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger animation
  setTimeout(() => overlay.classList.add('show'), 10);

  // Handle click OK
  const okBtn = overlay.querySelector('#session-ok-btn');
  okBtn.onclick = () => {
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
      logout();
    }, 300);
  };
}

/**
 * Xử lý khi bị đá ra do đăng nhập ở nơi khác
 */
export function handleSessionExpired() {
  showSessionExpiredModal();
}

/**
 * Gọi API có xác thực - tự động kiểm tra SESSION_EXPIRED
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error('Chưa đăng nhập');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  // Kiểm tra bị đá ra do đăng nhập nơi khác
  if (response.status === 401 && data.code === 'SESSION_EXPIRED') {
    handleSessionExpired();
    throw new Error(data.message);
  }

  if (!response.ok) {
    throw new Error(data.message || 'Lỗi khi gọi API');
  }

  return data;
}

/**
 * Lấy JWT token
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * Lấy thông tin user
 */
export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Kiểm tra đã đăng nhập chưa
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Lấy thông tin user hiện tại từ server (verify token)
 */
export async function getCurrentUser() {
  try {
    const data = await authFetch(`${API_URL}/auth/me`);

    // Cập nhật localStorage
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    // Token hết hạn, invalid, hoặc bị đá ra
    throw error;
  }
}

/**
 * Thiết lập nhân vật (avatar + display name)
 */
export async function setupCharacter(avatar, displayName) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/auth/setup-character`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ avatar, displayName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Thiết lập nhân vật thất bại');
    }

    // Cập nhật localStorage
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
}
