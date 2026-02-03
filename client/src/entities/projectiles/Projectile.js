import Phaser from 'phaser';

export default class Projectile extends Phaser.GameObjects.Container {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y);
    this.scene = scene;
    this.speed = options.speed || 600;
    this.range = options.range || 300;
    this.angle = options.angle || 0; // Radian = Góc quay
    this.damage = options.damage || 10;
    
    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);
    
    // Fix: Set hitbox nhỏ gọn (hình tròn bán kính 4px) để tránh va chạm oan
    // Arcade Physics không hỗ trợ xoay hitbox hình chữ nhật, nên hình tròn là tối ưu nhất để đạn đi qua khe hẹp
    this.body.setCircle(4); 
    this.body.setOffset(-4, -4); // Căn chỉnh lại offset nếu cần (tùy thuộc vào origin của Container)

    // Đăng ký vào group projectiles của Scene (nếu có) để xử lý va chạm chung
    if (this.scene.projectiles) {
        this.scene.projectiles.add(this);
    }
    
    // Thiết lập vận tốc
    this.body.setVelocity(
        Math.cos(this.angle) * this.speed,
        Math.sin(this.angle) * this.speed
    );

    // Hủy đạn sau khi hết tầm bắn (Khoảng cách / Tốc độ = Thời gian)
    const duration = (this.range / this.speed) * 1000;
    this.scene.time.delayedCall(duration, () => {
        if (this.active) {
            this.destroy();
        }
    });
  }

  // Ghi đè hàm này để thêm hình ảnh hiển thị
  createVisuals() {
    // Mặc định là hình tròn
    const circle = this.scene.add.circle(0, 0, 5, 0xffff00);
    this.add(circle);
  }
}
