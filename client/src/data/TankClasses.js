// Định nghĩa 6 Lớp Xe Tăng
export const TANK_CLASSES = {
  assault: {
    id: 'assault',
    name: 'Assault Tank',
    description: 'Xe tấn công - Sát thương cao, cận chiến',
    color: 0xff4444,
    abilities: {
      r: {
        name: 'Flame Wave',
        description: 'Sóng lửa xung quanh 360°',
        cooldown: 15000
      },
      e: {
        name: 'Rapid Fire',
        description: 'Tăng tốc độ bắn 3 giây',
        cooldown: 8000
      },
      space: {
        name: 'Grenade Launcher',
        description: 'Bắn lựu đạn nổ vùng',
        cooldown: 6000
      }
    }
  },
  
  defender: {
    id: 'defender',
    name: 'Defender Tank',
    description: 'Xe phòng thủ - Máu dày, hồi phục',
    color: 0x4444ff,
    abilities: {
      r: {
        name: 'Fortress Mode',
        description: 'Đứng yên, tạo khiên lớn, tăng damage',
        cooldown: 15000
      },
      e: {
        name: 'Energy Barrier',
        description: 'Tường chắn hấp thụ đạn',
        cooldown: 8000
      },
      space: {
        name: 'Heal Pulse',
        description: 'Hồi máu bản thân',
        cooldown: 10000
      }
    }
  },

  sniper: {
    id: 'sniper',
    name: 'Sniper Tank',
    description: 'Xe bắn tỉa - Tầm xa, chính xác',
    color: 0x44ff44,
    abilities: {
      r: {
        name: 'Railgun Shot',
        description: 'Bắn xuyên thủng mọi thứ',
        cooldown: 12000
      },
      e: {
        name: 'Scope Mode',
        description: 'Zoom xa, tăng chính xác',
        cooldown: 7000
      },
      space: {
        name: 'Smoke Bomb',
        description: 'Tạo khói che khuất',
        cooldown: 8000
      }
    }
  },

  artillery: {
    id: 'artillery',
    name: 'Artillery Tank',
    description: 'Xe pháo binh - AOE, kiểm soát vùng',
    color: 0xff8800,
    abilities: {
      r: {
        name: 'Orbital Strike',
        description: 'Tên lửa rơi từ trên',
        cooldown: 18000
      },
      e: {
        name: 'Rocket Barrage',
        description: 'Bắn 8 tên lửa mọi hướng',
        cooldown: 10000
      },
      space: {
        name: 'Mine Field',
        description: 'Thả 3 quả mìn',
        cooldown: 9000
      }
    }
  },

  speedster: {
    id: 'speedster',
    name: 'Speedster Tank',
    description: 'Xe tốc độ - Nhanh nhẹn, khó bắt',
    color: 0xffff44,
    abilities: {
      r: {
        name: 'Afterimage',
        description: 'Tạo 2 bản sao ảo bắn cùng',
        cooldown: 16000
      },
      e: {
        name: 'Drift Boost',
        description: 'Tăng tốc cực mạnh 2s',
        cooldown: 6000
      },
      space: {
        name: 'Shockwave',
        description: 'Sóng xung kích đẩy địch',
        cooldown: 8000
      }
    }
  },

  support: {
    id: 'support',
    name: 'Support Tank',
    description: 'Xe hỗ trợ - Debuff, kiểm soát',
    color: 0xff44ff,
    abilities: {
      r: {
        name: 'EMP Blast',
        description: 'Vô hiệu hóa abilities địch',
        cooldown: 20000
      },
      e: {
        name: 'Repair Kit',
        description: 'Hồi máu đồng đội gần',
        cooldown: 9000
      },
      space: {
        name: 'Vision Flare',
        description: 'Hiện kẻ địch ẩn',
        cooldown: 7000
      }
    }
  }
};

export default TANK_CLASSES;
