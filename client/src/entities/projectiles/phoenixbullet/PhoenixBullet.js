import Phaser from 'phaser';
import Projectile from '../Projectile';

export default class PhoenixBullet extends Projectile {
  constructor(scene, x, y, options) {
    super(scene, x, y, options);
    this.createVisuals();
  }

  createVisuals() {
    // Hình ảnh: Cầu lửa Phượng Hoàng (Màu đỏ rực)
    const mainBullet = this.scene.add.circle(0, 0, 8, 0xff0000); // Đỏ thuần
    this.add(mainBullet);

    // Thêm hiệu ứng phát sáng (Glow FX)
    if (this.scene.renderer.type === Phaser.WEBGL && mainBullet.postFX) {
        mainBullet.postFX.addBloom(0xff4500, 1, 1, 1.5, 2);
    }
  }
}
