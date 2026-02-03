// Định nghĩa các Kỹ năng Tiện ích cho phím Q
export const UTILITY_SKILLS = {
  dash: {
    id: 'dash',
    name: 'Dash',
    description: 'Lướt nhanh về phía con trỏ chuột',
    cooldown: 5000,
    color: 0xffffff
  },
  
  blink: {
    id: 'blink',
    name: 'Blink',
    description: 'Teleport tức thời (xa hơn Dash)',
    cooldown: 7000,
    color: 0x00ffff
  },
  
  miniShield: {
    id: 'miniShield',
    name: 'Mini Shield',
    description: 'Lá chắn nhỏ trong 1.5 giây',
    cooldown: 6000,
    color: 0x0088ff
  },
  
  speedBoost: {
    id: 'speedBoost',
    name: 'Speed Boost',
    description: 'Tăng tốc độ di chuyển',
    cooldown: 6000,
    color: 0xffff00
  }
};

export default UTILITY_SKILLS;
