import RapidBoostSkill from '../skills/Skill_of_gundam/RapidBoostSkill';
import QuickDrawSkill from '../skills/Skill_of_gundam/QuickDrawSkill';
import LaserBlastSkill from '../skills/Skill_of_gundam/LaserBlastSkill';

export default {
  name: 'Kakashi',
  stats: {
    health: 1000,
    speed: 200
  },
  weapon: {
    range: 300,
    bulletSpeed: 600,
    fireRate: 500
  },
  skills: {
    e: RapidBoostSkill,
    r: QuickDrawSkill,
    space: LaserBlastSkill
    // Q mặc định là Dash trong lớp Tank, hoặc có thể được ghi đè ở đây
  }
};
