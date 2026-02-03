export default class Skill {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.cooldown = config.cooldown || 1000;
    this.lastUsed = 0;
  }

  canUse() {
    return this.scene.time.now - this.lastUsed >= this.cooldown;
  }

  activate(tank, ...args) {
    if (this.canUse()) {
      this.lastUsed = this.scene.time.now;
      this.execute(tank, ...args);
      return true;
    }
    return false;
  }

  // Ghi đè phương thức này ở lớp con
  execute(tank, ...args) {
    console.warn('Skill execute method not implemented');
  }
}
