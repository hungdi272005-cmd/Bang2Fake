import DeepoolSkillE from '../skills/skill_of_deepool/DeepoolSkillE';
import DeepoolSkillR from '../skills/skill_of_deepool/DeepoolSkillR';
import DeepoolSkillSpace from '../skills/skill_of_deepool/DeepoolSkillSpace';

export default {
  name: 'Deepool',
  stats: {
    health: 1200, // Slightly tankier than Kakashi
    speed: 110    // Slightly faster
  },
  weapon: {
    range: 350,
    bulletSpeed: 500,
    fireRate: 800,  // Faster fire rate
    damage: 35,
    bulletStyle: 'deepool' // We might need a bullet image for this too, or reuse generic
  },
  skills: {
    e: DeepoolSkillE, // Chiêu E: Ám sát
    r: DeepoolSkillR, // Chiêu R: Liên hoàn kiếm 
    space: DeepoolSkillSpace     // Chiêu Space: Đẩy lùi
  }
};
