/**
 * Event API - Gọi API sự kiện
 * Follow pattern từ auth.js
 */

const API_URL = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

/**
 * Lấy danh sách sự kiện đang active
 */
export async function fetchActiveEvents() {
  const response = await fetch(`${API_URL}/events/active`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi lấy sự kiện');
  return data;
}

/**
 * Lấy chi tiết sự kiện + progress user
 */
export async function fetchEventDetail(eventId) {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi lấy chi tiết sự kiện');
  return data;
}

/**
 * Nhận quà đăng nhập hàng ngày
 */
export async function claimLoginReward(eventId) {
  const response = await fetch(`${API_URL}/events/${eventId}/claim-login`, {
    method: 'POST',
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi nhận quà');
  return data;
}

/**
 * Đổi token sự kiện lấy phần thưởng
 */
export async function exchangeReward(eventId, itemId) {
  const response = await fetch(`${API_URL}/events/${eventId}/exchange`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ itemId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi đổi quà');
  return data;
}

/**
 * Seed sự kiện Tết (admin, gọi 1 lần)
 */
export async function seedTetEvent() {
  const response = await fetch(`${API_URL}/events/seed-tet`, {
    method: 'POST',
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Lỗi seed sự kiện');
  return data;
}
