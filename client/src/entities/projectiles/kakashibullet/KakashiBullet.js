import Phaser from 'phaser';
import Projectile from '../Projectile';

// Đạn của Kakashi - Phi tiêu đơn giản
// Sử dụng 2 hình chữ nhật xoay chéo tạo hình dấu X (phi tiêu)
export default class KakashiBullet extends Projectile {
  constructor(scene, x, y, options) {
    super(scene, x, y, options);
    this.createVisuals();
  }

  createVisuals() {
    // Phi tiêu đơn giản: 2 thanh chéo tạo hình X
    const size = 16;      // To hơn
    const thickness = 4;  // Dày hơn
    
    // Thanh chéo 1 (/)
    const bar1 = this.scene.add.rectangle(0, 0, size, thickness, 0xc0c0c0); // Màu bạc
    bar1.rotation = Math.PI / 4; // Xoay 45 độ
    this.add(bar1);
    
    // Thanh chéo 2 (\)
    const bar2 = this.scene.add.rectangle(0, 0, size, thickness, 0xc0c0c0); // Màu bạc
    bar2.rotation = -Math.PI / 4; // Xoay -45 độ
    this.add(bar2);
    
    // Chấm tròn ở giữa
    const center = this.scene.add.circle(0, 0, 3, 0x808080); // Xám
    this.add(center);
  }
  
  // Không cần preUpdate xoay - bỏ để tối ưu performance
}
