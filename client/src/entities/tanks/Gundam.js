
import QuickDrawSkill from '../skills/Skill_of_gundam/QuickDrawSkill';
import LaserBlastSkill from '../skills/Skill_of_gundam/LaserBlastSkill';
import RapidBoostSkill from '../skills/Skill_of_gundam/RapidBoostSkill';
import StoneFormSkill from '../skills/utility/StoneFormSkill';

export default {
  name: 'Gundam',
  color: 0xeeeeee, // White/Silver
  stats: {
    health: 1000,
    speed: 200
  },
  weapon: {
    range: 300,
    bulletSpeed: 600,
    fireRate: 500,
    bulletStyle: 'gundam', // Bullet style: 'standard' | 'gundam' | 'phoenix'
    singleBullet: true
  },
  skills: {
    e: RapidBoostSkill,
    r: QuickDrawSkill,
    space: LaserBlastSkill,
    q: StoneFormSkill
  }
};
