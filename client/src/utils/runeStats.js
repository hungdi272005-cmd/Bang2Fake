    /**
 * Rune Stats Utility
 * Tính toán chỉ số final của tank sau khi áp dụng ngọc phù trợ
 * 
 * Mapping ngọc → chỉ số:
 *   attack   → weapon.damage (+ %)
 *   defense  → stats.defense (giảm sát thương nhận %)
 *   speed    → stats.speed (+ %)
 *   crit     → stats.critChance (% bạo kích)
 *   vampirism → stats.vampirism (% hút máu)
 *   all      → cộng tất cả chỉ số trên
 */

import { calculatePageStats } from '../pages/rune-board/runeBoardData.js';

/**
 * Áp dụng ngọc phù trợ vào config tank
 * @param {Object} baseConfig - Config gốc của tank (VD: GundamConfig)
 * @param {Array} runeSlots - Mảng runeId [6 slots] từ trang ngọc đã gắn
 * @returns {Object} Config mới với chỉ số đã cộng ngọc
 */
export function applyRuneStatsToConfig(baseConfig, runeSlots) {
  if (!runeSlots || runeSlots.length === 0) return baseConfig;

  // Tính tổng bonus % từ trang ngọc
  const runeBonus = calculatePageStats(runeSlots);
  // runeBonus = { attack: 0, defense: 0, speed: 0, crit: 0, vampirism: 0 }

  // Deep clone config để không mutate gốc
  const config = JSON.parse(JSON.stringify(baseConfig));
  // Giữ lại skills (không clone được functions)
  config.skills = baseConfig.skills;

  // Áp dụng bonus %
  const baseStats = config.stats || {};
  const baseWeapon = config.weapon || {};

  // Speed: + % vào stats.speed
  if (runeBonus.speed > 0 && baseStats.speed) {
    baseStats.speed = Math.round(baseStats.speed * (1 + runeBonus.speed / 100));
  }

  // Attack: + % vào weapon.damage
  if (runeBonus.attack > 0 && baseWeapon.damage) {
    baseWeapon.damage = Math.round(baseWeapon.damage * (1 + runeBonus.attack / 100));
  }

  // Defense: base + rune bonus (dùng trong Tank.takeDamage)
  baseStats.defense = (baseStats.defense || 0) + (runeBonus.defense || 0);

  // Crit Chance: base + rune bonus (dùng trong TankWeapon.createBullet)
  baseWeapon.critChance = (baseStats.crit || 0) + (runeBonus.crit || 0);

  // Vampirism: base + rune bonus
  baseStats.vampirism = (baseStats.vampirism || 0) + (runeBonus.vampirism || 0);

  config.stats = baseStats;
  config.weapon = baseWeapon;

  return config;
}

/**
 * Tính chỉ số hiển thị cho UI (Tank Collection)
 * Trả về object dễ render so sánh base vs bonus
 * @param {Object} baseStats - { health, speed, damage, range } từ tankCollectionData
 * @param {Array} runeSlots - Mảng runeId
 * @returns {Object} { health: { base, bonus, total }, ... }
 */
export function getDisplayStats(baseStats, runeSlots) {
  const runeBonus = (runeSlots && runeSlots.length > 0) ? calculatePageStats(runeSlots) : {};

  return {
    health: {
      base: baseStats.health,
      bonus: 0, // Ngọc không cộng HP trực tiếp
      total: baseStats.health,
    },
    speed: {
      base: baseStats.speed,
      bonus: Math.round(baseStats.speed * (runeBonus.speed || 0) / 100),
      total: Math.round(baseStats.speed * (1 + (runeBonus.speed || 0) / 100)),
    },
    damage: {
      base: baseStats.damage,
      bonus: Math.round(baseStats.damage * (runeBonus.attack || 0) / 100),
      total: Math.round(baseStats.damage * (1 + (runeBonus.attack || 0) / 100)),
    },
    range: {
      base: baseStats.range,
      bonus: 0, // Ngọc không cộng range
      total: baseStats.range,
    },
    defense: {
      base: baseStats.defense || 0,
      bonus: runeBonus.defense || 0,
      total: (baseStats.defense || 0) + (runeBonus.defense || 0),
    },
    crit: {
      base: baseStats.crit || 0,
      bonus: runeBonus.crit || 0,
      total: (baseStats.crit || 0) + (runeBonus.crit || 0),
    },
    vampirism: {
      base: baseStats.vampirism || 0,
      bonus: runeBonus.vampirism || 0,
      total: (baseStats.vampirism || 0) + (runeBonus.vampirism || 0),
    },
  };
}
