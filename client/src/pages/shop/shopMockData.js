/**
 * Shop Mock Data
 * Dữ liệu giả cho cửa hàng - 6 danh mục
 */

export const SHOP_CATEGORIES = [
  { id: 'tank', name: 'Tank', icon: '🔫' },
  { id: 'skin', name: 'Skin', icon: '🎨' },
  { id: 'egg', name: 'Trứng Tank', icon: '🥚' },
  { id: 'gem', name: 'Ngọc', icon: '💠' },
  { id: 'assistant', name: 'Trợ Thủ', icon: '🤖' },
  { id: 'other', name: 'Khác', icon: '📦' },
];

export const SHOP_ITEMS = {
  // ==================== TANK ====================
  tank: [
    {
      id: 't1',
      name: 'Phoenix',
      icon: '🐦‍🔥',
      price: 8000,
      currency: 'gold',
      rarity: 'epic',
      description: 'Tank lửa - Tái sinh từ tro tàn',
    },
    {
      id: 't2',
      name: 'Kakashi',
      icon: '⚡',
      price: 12000,
      currency: 'gold',
      rarity: 'legendary',
      description: 'Tank ninja - Sao chép kỹ năng',
    },
    {
      id: 't3',
      name: 'Deepool',
      icon: '🗡️',
      price: 200,
      currency: 'diamond',
      rarity: 'legendary',
      description: 'Tank sát thủ - Bất tử',
    },
    {
      id: 't4',
      name: 'Iron Golem',
      icon: '🛡️',
      price: 6000,
      currency: 'gold',
      rarity: 'rare',
      description: 'Tank phòng thủ - Giáp siêu dày',
    },
    {
      id: 't5',
      name: 'Storm',
      icon: '🌩️',
      price: 150,
      currency: 'diamond',
      rarity: 'epic',
      description: 'Tank sấm sét - Tấn công diện rộng',
    },
    {
      id: 't6',
      name: 'Shadow',
      icon: '👤',
      price: 10000,
      currency: 'gold',
      rarity: 'epic',
      description: 'Tank bóng tối - Tàng hình ám sát',
    },
  ],

  // ==================== SKIN ====================
  skin: [
    {
      id: 's1',
      name: 'Phoenix Hỏa Thiên',
      icon: '🔥',
      price: 100,
      currency: 'diamond',
      rarity: 'legendary',
      description: 'Skin Phoenix dạng thần lửa',
    },
    {
      id: 's2',
      name: 'Kakashi Hokage',
      icon: '🌀',
      price: 80,
      currency: 'diamond',
      rarity: 'epic',
      description: 'Skin Kakashi đệ lục Hokage',
    },
    {
      id: 's3',
      name: 'Deepool Samurai',
      icon: '⛩️',
      price: 120,
      currency: 'diamond',
      rarity: 'legendary',
      description: 'Skin Deepool phong cách samurai',
    },
    {
      id: 's4',
      name: 'Phoenix Băng Giá',
      icon: '❄️',
      price: 5000,
      currency: 'gold',
      rarity: 'rare',
      description: 'Skin Phoenix dạng băng',
    },
    {
      id: 's5',
      name: 'Kakashi ANBU',
      icon: '🎭',
      price: 60,
      currency: 'diamond',
      rarity: 'rare',
      description: 'Skin Kakashi thời ANBU',
    },
  ],

  // ==================== TRỨNG TANK ====================
  egg: [
    {
      id: 'e1',
      name: 'Trứng Thường',
      icon: '🥚',
      price: 1000,
      currency: 'gold',
      rarity: 'common',
      description: 'Ấp ra tank ngẫu nhiên (thường)',
    },
    {
      id: 'e2',
      name: 'Trứng Hiếm',
      icon: '🪺',
      price: 3000,
      currency: 'gold',
      rarity: 'rare',
      description: 'Ấp ra tank hiếm trở lên',
    },
    {
      id: 'e3',
      name: 'Trứng Sử Thi',
      icon: '✨',
      price: 50,
      currency: 'diamond',
      rarity: 'epic',
      description: 'Ấp ra tank sử thi trở lên',
    },
    {
      id: 'e4',
      name: 'Trứng Huyền Thoại',
      icon: '🌟',
      price: 150,
      currency: 'diamond',
      rarity: 'legendary',
      description: 'Đảm bảo tank huyền thoại',
    },
  ],

  // ==================== NGỌC ====================
  gem: [
    {
      id: 'g1',
      name: 'Ngọc Tấn Công',
      icon: '🔴',
      price: 500,
      currency: 'gold',
      rarity: 'common',
      description: 'Tăng 5% sát thương',
    },
    {
      id: 'g2',
      name: 'Ngọc Phòng Thủ',
      icon: '🔵',
      price: 500,
      currency: 'gold',
      rarity: 'common',
      description: 'Tăng 5% giáp',
    },
    {
      id: 'g3',
      name: 'Ngọc Tốc Độ',
      icon: '🟢',
      price: 500,
      currency: 'gold',
      rarity: 'common',
      description: 'Tăng 5% tốc chạy',
    },
    {
      id: 'g4',
      name: 'Ngọc Bạo Kích',
      icon: '🟠',
      price: 2000,
      currency: 'gold',
      rarity: 'rare',
      description: 'Tăng 10% tỉ lệ chí mạng',
    },
    {
      id: 'g5',
      name: 'Ngọc Hút Máu',
      icon: '🟣',
      price: 80,
      currency: 'diamond',
      rarity: 'epic',
      description: 'Hút 8% sát thương thành máu',
    },
    {
      id: 'g6',
      name: 'Ngọc Thần',
      icon: '⚪',
      price: 200,
      currency: 'diamond',
      rarity: 'legendary',
      description: 'Tăng toàn bộ chỉ số 10%',
    },
  ],

  // ==================== TRỢ THỦ ====================
  assistant: [
    {
      id: 'a1',
      name: 'Bot Sửa Chữa',
      icon: '🔧',
      price: 3000,
      currency: 'gold',
      rarity: 'rare',
      description: 'Tự động hồi máu 2%/giây',
    },
    {
      id: 'a2',
      name: 'Drone Trinh Sát',
      icon: '📡',
      price: 5000,
      currency: 'gold',
      rarity: 'epic',
      description: 'Mở rộng tầm nhìn 30%',
    },
    {
      id: 'a3',
      name: 'Khiên Năng Lượng',
      icon: '🛡️',
      price: 100,
      currency: 'diamond',
      rarity: 'epic',
      description: 'Giảm 15% sát thương nhận',
    },
    {
      id: 'a4',
      name: 'Rồng Lửa Mini',
      icon: '🐉',
      price: 250,
      currency: 'diamond',
      rarity: 'legendary',
      description: 'Phun lửa kẻ thù gần, 50 dmg/s',
    },
  ],

  // ==================== KHÁC ====================
  other: [
    {
      id: 'o1',
      name: 'Đổi Tên',
      icon: '✏️',
      price: 20,
      currency: 'diamond',
      rarity: 'common',
      description: 'Đổi tên hiển thị 1 lần',
    },
    {
      id: 'o2',
      name: 'Khung Avatar Vàng',
      icon: '🖼️',
      price: 50,
      currency: 'diamond',
      rarity: 'rare',
      description: 'Khung avatar sang trọng',
    },
    {
      id: 'o3',
      name: 'Biểu Cảm VIP',
      icon: '😎',
      price: 2000,
      currency: 'gold',
      rarity: 'rare',
      description: 'Bộ 10 biểu cảm đặc biệt in-game',
    },
    {
      id: 'o4',
      name: 'Bóng Thần Bí x5',
      icon: '🔮',
      price: 1500,
      currency: 'gold',
      rarity: 'common',
      description: '5 bóng quay vòng quay may mắn',
    },
    {
      id: 'o5',
      name: 'Thẻ Kinh Nghiệm x2',
      icon: '📈',
      price: 30,
      currency: 'diamond',
      rarity: 'epic',
      description: 'Nhân đôi EXP trong 24h',
    },
  ],
};

/**
 * Lấy màu theo rarity
 */
export function getRarityColor(rarity) {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#f59e0b';
    default: return '#9ca3af';
  }
}

/**
 * Lấy tên rarity tiếng Việt
 */
export function getRarityName(rarity) {
  switch (rarity) {
    case 'common': return 'Thường';
    case 'rare': return 'Hiếm';
    case 'epic': return 'Sử Thi';
    case 'legendary': return 'Huyền Thoại';
    default: return 'Thường';
  }
}
