import Phaser from 'phaser';
import Projectile from './Projectile';

export default class StandardBullet extends Projectile {
  constructor(scene, x, y, options) {
    super(scene, x, y, options);
    this.createVisuals();
  }

  createVisuals() {
    // Hình ảnh: Chấm tròn vàng
    const circle = this.scene.add.circle(0, 0, 5, 0xffff00);
    this.add(circle);
  }
}
