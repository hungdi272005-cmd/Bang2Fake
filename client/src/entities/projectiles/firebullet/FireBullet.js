import Phaser from 'phaser';
import Projectile from '../Projectile';

export default class FireBullet extends Projectile {
  constructor(scene, x, y, options) {
    super(scene, x, y, options);
    this.createVisuals();
  }

  createVisuals() {
    // Hình ảnh: Cầu lửa (Fireball)
    // Đạn chính
    const mainBullet = this.scene.add.circle(0, 0, 8, 0xff4500); // Màu Cam Đỏ
    this.add(mainBullet);

    // Thêm hiệu ứng phát sáng (Glow FX)
    if (this.scene.renderer.type === Phaser.WEBGL && mainBullet.postFX) {
        mainBullet.postFX.addBloom(0xff8800, 1, 1, 1.5, 2);
    }
    
    // Tùy chọn: Thêm đuôi hạt (particle trail) sau này?
  }
}
