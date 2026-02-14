/**
 * Rune Board Data
 * Dữ liệu ngọc — chỉ chứa pure data + utility functions
 * Không còn localStorage — tất cả I/O qua API (runeApi.js)
 */

// ==================== ĐỊNH NGHĨA CÁC LOẠI NGỌC ====================

/**
 * Tất cả ngọc: 3 tier × 6 loại = 18 ngọc
 * Tier 1: Ngọc Nhỏ (+3%)
 * Tier 2: Ngọc Vừa (+5%)
 * Tier 3: Ngọc Lớn (+8%)
 */
export const ALL_RUNES = [
  // ===== NGỌC TẤN CÔNG (Đỏ) =====
  { id: 'atk_1', name: 'Ngọc Tấn Công I', icon: '🔴', stat: 'attack', value: 3, tier: 1, description: '+3% Sát thương' },
  { id: 'atk_2', name: 'Ngọc Tấn Công II', icon: '🔴', stat: 'attack', value: 5, tier: 2, description: '+5% Sát thương' },
  { id: 'atk_3', name: 'Ngọc Tấn Công III', icon: '🔴', stat: 'attack', value: 8, tier: 3, description: '+8% Sát thương' },

  // ===== NGỌC PHÒNG THỦ (Xanh dương) =====
  { id: 'def_1', name: 'Ngọc Phòng Thủ I', icon: '🔵', stat: 'defense', value: 3, tier: 1, description: '+3% Giáp' },
  { id: 'def_2', name: 'Ngọc Phòng Thủ II', icon: '🔵', stat: 'defense', value: 5, tier: 2, description: '+5% Giáp' },
  { id: 'def_3', name: 'Ngọc Phòng Thủ III', icon: '🔵', stat: 'defense', value: 8, tier: 3, description: '+8% Giáp' },

  // ===== NGỌC TỐC ĐỘ (Xanh lá) =====
  { id: 'spd_1', name: 'Ngọc Tốc Độ I', icon: '🟢', stat: 'speed', value: 3, tier: 1, description: '+3% Tốc chạy' },
  { id: 'spd_2', name: 'Ngọc Tốc Độ II', icon: '🟢', stat: 'speed', value: 5, tier: 2, description: '+5% Tốc chạy' },
  { id: 'spd_3', name: 'Ngọc Tốc Độ III', icon: '🟢', stat: 'speed', value: 8, tier: 3, description: '+8% Tốc chạy' },

  // ===== NGỌC BẠO KÍCH (Cam) =====
  { id: 'crit_1', name: 'Ngọc Bạo Kích I', icon: '🟠', stat: 'crit', value: 3, tier: 1, description: '+3% Chí mạng' },
  { id: 'crit_2', name: 'Ngọc Bạo Kích II', icon: '🟠', stat: 'crit', value: 5, tier: 2, description: '+5% Chí mạng' },
  { id: 'crit_3', name: 'Ngọc Bạo Kích III', icon: '🟠', stat: 'crit', value: 8, tier: 3, description: '+8% Chí mạng' },

  // ===== NGỌC HÚT MÁU (Tím) =====
  { id: 'vamp_1', name: 'Ngọc Hút Máu I', icon: '🟣', stat: 'vampirism', value: 2, tier: 1, description: '+2% Hút máu' },
  { id: 'vamp_2', name: 'Ngọc Hút Máu II', icon: '🟣', stat: 'vampirism', value: 4, tier: 2, description: '+4% Hút máu' },
  { id: 'vamp_3', name: 'Ngọc Hút Máu III', icon: '🟣', stat: 'vampirism', value: 6, tier: 3, description: '+6% Hút máu' },

  // ===== NGỌC ĐA NĂNG (Trắng) =====
  { id: 'all_1', name: 'Ngọc Đa Năng I', icon: '⚪', stat: 'all', value: 2, tier: 1, description: '+2% Toàn bộ chỉ số' },
  { id: 'all_2', name: 'Ngọc Đa Năng II', icon: '⚪', stat: 'all', value: 3, tier: 2, description: '+3% Toàn bộ chỉ số' },
  { id: 'all_3', name: 'Ngọc Đa Năng III', icon: '⚪', stat: 'all', value: 5, tier: 3, description: '+5% Toàn bộ chỉ số' },
];

// ==================== SLOT LABELS ====================
export const SLOT_LABELS = [
  'Chính', 'Phụ 1', 'Phụ 2', 'Phụ 3', 'Phụ 4', 'Phụ 5'
];

// ==================== STAT NAMES ====================
export const STAT_NAMES = {
  attack: 'Sát thương',
  defense: 'Giáp',
  speed: 'Tốc chạy',
  crit: 'Chí mạng',
  vampirism: 'Hút máu',
  all: 'Toàn bộ',
};

export const STAT_ICONS = {
  attack: '⚔️',
  defense: '🛡️',
  speed: '💨',
  crit: '💥',
  vampirism: '❤️‍🩹',
  all: '✨',
};

// ==================== HÀM TIỆN ÍCH ====================

/**
 * Tìm ngọc theo ID
 */
export function getRuneById(runeId) {
  return ALL_RUNES.find(r => r.id === runeId) || null;
}

/**
 * Lấy màu theo tier
 */
export function getTierColor(tier) {
  switch (tier) {
    case 1: return '#9ca3af';   // Xám (Nhỏ)
    case 2: return '#3b82f6';   // Xanh (Vừa)
    case 3: return '#f59e0b';   // Vàng (Lớn)
    default: return '#9ca3af';
  }
}

/**
 * Lấy tên tier
 */
export function getTierName(tier) {
  switch (tier) {
    case 1: return 'Nhỏ';
    case 2: return 'Vừa';
    case 3: return 'Lớn';
    default: return 'Nhỏ';
  }
}

/**
 * Tính tổng chỉ số của 1 trang ngọc
 */
export function calculatePageStats(slots) {
  const stats = { attack: 0, defense: 0, speed: 0, crit: 0, vampirism: 0 };

  slots.forEach(runeId => {
    if (!runeId) return;
    const rune = getRuneById(runeId);
    if (!rune) return;

    if (rune.stat === 'all') {
      Object.keys(stats).forEach(key => {
        stats[key] += rune.value;
      });
    } else {
      stats[rune.stat] += rune.value;
    }
  });

  return stats;
}
