export default class TankAbilities {
  constructor(scene, parentContainer, skillConfig) {
    this.scene = scene;
    this.parentContainer = parentContainer;
    
    // Khởi tạo kỹ năng từ cấu hình
    // Định dạng mong đợi của skillConfig: { q: Class, e: Class, r: Class, space: Class }
    this.skills = {};
    
    // Chúng ta khởi tạo các lớp kỹ năng ở đây
    if (skillConfig.q) this.skills.q = new skillConfig.q(scene);
    if (skillConfig.e) this.skills.e = new skillConfig.e(scene);
    if (skillConfig.r) this.skills.r = new skillConfig.r(scene);
    if (skillConfig.space) this.skills.space = new skillConfig.space(scene);
  }

  // Phương thức thực thi chung
  useSkill(key, ...args) {
    // Không thể sử dụng kỹ năng nếu bị choáng hoặc bị câm lặng
    if (this.parentContainer.isStunned || this.parentContainer.isSilenced) return;

    const skill = this.skills[key];
    if (skill) {
      skill.activate(this.parentContainer, ...args);
    }
  }

  // Các hàm bao riêng lẻ để thuận tiện cho InputManager, ánh xạ tới các phím
  useDash(pointer) {
    this.useSkill('q', pointer);
  }

  useShield(pointer, ...args) {
    this.useSkill('e', pointer, ...args);
  }

  useRocketBarrage(...args) {
    this.useSkill('r', ...args);
  }

  useSpeedBoost(movementComponent, pointer) {
    this.useSkill('space', movementComponent, pointer);
  }

  update() {
    // Bắt đầu cập nhật trên tất cả các kỹ năng nếu chúng có phương thức cập nhật
    Object.values(this.skills).forEach(skill => {
      if (skill && typeof skill.update === 'function') {
        skill.update(this.parentContainer);
      }
    });
  }

  // Hàm hỗ trợ cho UI để lấy thời gian hồi chiêu
  getCooldownRemaining(key) {
    const skill = this.skills[key];
    if (!skill) return 0;
    
    const now = this.scene.time.now;
    const remaining = skill.cooldown - (now - skill.lastUsed);
    return Math.max(0, remaining);
  }
}
