import Phaser from 'phaser';
import Projectile from './Projectile';

export default class GundamBullet extends Projectile {
  constructor(scene, x, y, options) {
    super(scene, x, y, options);
    this.createVisuals();
  }

  createVisuals() {
    // Hình ảnh: Tia năng lượng (Trụ dài thanh mảnh)
    // Xoay container theo hướng bắn để hình chữ nhật nằm đúng hướng
    this.rotation = this.angle;

    // Vẽ hình chữ nhật dài (Width: 30, Height: 4)
    // Màu lõi trắng sáng, viền hoặc glow màu cam

    // 1. Fake Glow (Hình chữ nhật to hơn, mờ hơn ở dưới) - Rẻ hơn nhiều so với PostFX
    const glow = this.scene.add.rectangle(0, 0, 40, 8, 0xff4500, 0.6);
    this.add(glow);

    // 2. Lõi đạn (Trắng sáng)
    const mainBullet = this.scene.add.rectangle(0, 0, 30, 4, 0xffffff); 
    this.add(mainBullet);

    // Xóa PostFX (Gây lag khi spam đạn)
    // if (this.scene.renderer.type === Phaser.WEBGL && mainBullet.postFX) {
    //    mainBullet.postFX.addBloom(0xff4500, 1, 1, 2, 1.2); 
    // }
  }
}
