
// Import giữ chỗ - chúng ta có thể tạo các kỹ năng cụ thể sau
import PhoenixDashSkill from '../skills/Skill_of_phoenix/PhoenixDashSkill';
import PhoenixFireRingSkill from '../skills/Skill_of_phoenix/PhoenixFireRingSkill';
import PhoenixSupernovaSkill from '../skills/Skill_of_phoenix/PhoenixSupernovaSkill';
import StoneFormSkill from '../skills/utility/StoneFormSkill';

export default {
  name: 'Phoenix',
  color: 0xff4500, // Orange Red
  stats: {
    health: 800, // Phoenix có thể yếu máu hơn nhưng nhanh hơn?
    speed: 220
  },
  weapon: {
    range: 350,
    bulletSpeed: 400, 
    fireRate: 800,
    bulletStyle: 'phoenix', // Bullet style: 'standard' | 'gundam' | 'phoenix'
    singleBullet: true
  },

  skills: {
    e: PhoenixDashSkill,
    r: PhoenixSupernovaSkill,
    space: PhoenixFireRingSkill,
    q: StoneFormSkill
  }
};
