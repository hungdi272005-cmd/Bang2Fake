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
 * Đăng xuất
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
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
    const token = getToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy thông tin user');
    }

    // Cập nhật localStorage
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    // Token hết hạn hoặc invalid
    logout();
    throw error;
  }
}
