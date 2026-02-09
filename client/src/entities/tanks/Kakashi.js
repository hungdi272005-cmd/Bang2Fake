import SubstitutionSkill from '../skills/skill_of_kakashi/SubstitutionSkill';
import ChidoriSkill from '../skills/skill_of_kakashi/ChidoriSkill';
import KamuiSkill from '../skills/skill_of_kakashi/KamuiSkill'; 

export default {
  name: 'Kakashi',
  stats: {
    health: 1000,
    speed: 100
  },
  weapon: {
    range: 300,
    bulletSpeed: 400,
    fireRate: 1000,
    damage: 40, // Sát thương cơ bản
    bulletStyle: 'kakashi' // Sử dụng đạn phi tiêu của Kakashi
  },
  skills: {
    e: SubstitutionSkill, // Chiêu E: Thuật Ẩn Thân
    r: ChidoriSkill,      // Chiêu R: Chidori
    space: KamuiSkill     // Chiêu Space: Kamui
  }
};
