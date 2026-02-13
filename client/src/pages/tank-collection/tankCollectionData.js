/**
 * Tank Collection Data
 * Dữ liệu kho tank - danh sách tank và thông tin chi tiết
 * Mỗi tank có 1 trang ngọc phù trợ riêng
 */

/**
 * Danh sách tất cả tank trong game
 * Dev mode: tất cả đều sở hữu (owned: true)
 */
export const ALL_TANKS = [
  {
    id: 'gundam',
    name: 'Gundam',
    icon: '🤖',
    image: 'assets/Pictures_of_gundam/tank_gundam.png',
    rarity: 'rare',
    role: 'Xạ Thủ',
    description: 'Chiến binh cơ khí - Hỏa lực mạnh, bắn nhanh',
    stats: { health: 1000, speed: 100, damage: 40, range: 300, defense: 5, crit: 10, vampirism: 0 },
    skills: [
      { key: 'E', name: 'Rapid Boost', desc: 'Tăng tốc cực nhanh' },
      { key: 'R', name: 'Quick Draw', desc: 'Rút súng bắn loạt đạn' },
      { key: 'Space', name: 'Laser Blast', desc: 'Bắn tia laser mạnh' },
      { key: 'Q', name: 'Stone Form', desc: 'Hóa đá phòng thủ' },
    ],
    owned: true,
    defaultRunePage: 'page_1',
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    icon: '🐦‍🔥',
    image: 'assets/Pictures_of_phoenix/tank_phoenix.png',
    rarity: 'epic',
    role: 'Đột Kích',
    description: 'Tank lửa - Tái sinh từ tro tàn, lướt nhanh',
    stats: { health: 800, speed: 100, damage: 35, range: 350, defense: 3, crit: 5, vampirism: 3 },
    skills: [
      { key: 'E', name: 'Phoenix Dash', desc: 'Lướt lửa về phía trước' },
      { key: 'R', name: 'Supernova', desc: 'Nổ sáng diện rộng' },
      { key: 'Space', name: 'Fire Ring', desc: 'Vòng lửa bao quanh' },
      { key: 'Q', name: 'Stone Form', desc: 'Hóa đá phòng thủ' },
    ],
    owned: true,
    defaultRunePage: 'page_1',
  },
  {
    id: 'kakashi',
    name: 'Kakashi',
    icon: '⚡',
    image: 'assets/picktures_of_kakashi/tank_kakashi.png',
    rarity: 'legendary',
    role: 'Sát Thủ',
    description: 'Tank ninja - Ẩn thân, tấn công bất ngờ',
    stats: { health: 1000, speed: 100, damage: 40, range: 300, defense: 3, crit: 15, vampirism: 5 },
    skills: [
      { key: 'E', name: 'Substitution', desc: 'Thuật Ẩn Thân, tạo phân thân' },
      { key: 'R', name: 'Chidori', desc: 'Lao tới đâm chidori' },
      { key: 'Space', name: 'Kamui', desc: 'Hút kẻ thù vào không gian khác' },
    ],
    owned: true,
    defaultRunePage: 'page_2',
  },
  {
    id: 'deepool',
    name: 'Deepool',
    icon: '🗡️',
    image: 'assets/Pictures_of_deepool/tank_deepool.png',
    rarity: 'legendary',
    role: 'Đấu Sĩ',
    description: 'Tank sát thủ - Bất tử, liên hoàn kiếm',
    stats: { health: 1200, speed: 110, damage: 35, range: 350, defense: 8, crit: 5, vampirism: 8 },
    skills: [
      { key: 'E', name: 'Assassinate', desc: 'Đánh dấu & dịch chuyển' },
      { key: 'R', name: 'Sword Storm', desc: 'Liên hoàn kiếm' },
      { key: 'Space', name: 'Repel', desc: 'Đẩy lùi kẻ thù' },
    ],
    owned: true,
    defaultRunePage: 'page_1',
  },
];

/**
 * Lấy màu theo rarity
 */
export function getTankRarityColor(rarity) {
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
export function getTankRarityName(rarity) {
  switch (rarity) {
    case 'common': return 'Thường';
    case 'rare': return 'Hiếm';
    case 'epic': return 'Sử Thi';
    case 'legendary': return 'Huyền Thoại';
    default: return 'Thường';
  }
}

/**
 * Lấy màu theo role
 */
export function getRoleColor(role) {
  switch (role) {
    case 'Xạ Thủ': return '#3b82f6';
    case 'Đột Kích': return '#ef4444';
    case 'Sát Thủ': return '#a855f7';
    case 'Đấu Sĩ': return '#f59e0b';
    case 'Phòng Thủ': return '#10b981';
    default: return '#6b7280';
  }
}
