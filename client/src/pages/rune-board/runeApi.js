/**
 * Rune API Service
 * Gọi API server thay vì localStorage
 */

import { getToken } from '../../utils/auth.js';

const API_URL = 'http://localhost:3000/api';

/**
 * Helper: gọi API với JWT token
 */
async function runeApiCall(endpoint, options = {}) {
  const token = getToken();
  if (!token) throw new Error('Chưa đăng nhập');

  const res = await fetch(`${API_URL}/runes${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ==================== API FUNCTIONS ====================

/**
 * Lấy toàn bộ dữ liệu ngọc (inventory + pages + tankMapping)
 */
export async function fetchRuneData() {
  const result = await runeApiCall('/data');
  return result.data;
}

/**
 * Gắn ngọc vào slot
 */
export async function apiEquipRune(pageId, slotIndex, runeId) {
  const result = await runeApiCall('/equip', {
    method: 'POST',
    body: JSON.stringify({ pageId, slotIndex, runeId }),
  });
  return result.data;
}

/**
 * Gỡ ngọc khỏi slot
 */
export async function apiUnequipRune(pageId, slotIndex) {
  const result = await runeApiCall('/unequip', {
    method: 'POST',
    body: JSON.stringify({ pageId, slotIndex }),
  });
  return result.data;
}

/**
 * Nâng cấp ngọc: 5x → 1x
 */
export async function apiUpgradeRune(runeId) {
  const result = await runeApiCall('/upgrade', {
    method: 'POST',
    body: JSON.stringify({ runeId }),
  });
  return result.data;
}

/**
 * Tạo trang ngọc mới
 */
export async function apiCreatePage(name) {
  const result = await runeApiCall('/pages', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return result.data;
}

/**
 * Đổi tên trang ngọc
 */
export async function apiRenamePage(pageId, name) {
  const result = await runeApiCall(`/pages/${pageId}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
  return result.data;
}

/**
 * Xóa trang ngọc
 */
export async function apiDeletePage(pageId) {
  const result = await runeApiCall(`/pages/${pageId}`, {
    method: 'DELETE',
  });
  return result.data;
}

/**
 * Gắn trang ngọc cho tank
 */
export async function apiSetTankMapping(tankId, pageId) {
  const result = await runeApiCall('/tank-mapping', {
    method: 'POST',
    body: JSON.stringify({ tankId, pageId }),
  });
  return result.data;
}
