import Phaser from 'phaser';
import StandardBullet from '../projectiles/standardbullet/StandardBullet';
import GundamBullet from '../projectiles/gundambullet/GundamBullet';
import PhoenixBullet from '../projectiles/phoenixbullet/PhoenixBullet';
import KakashiBullet from '../projectiles/kakashibullet/KakashiBullet';

const PROJECTILE_MAP = {
    'standard': StandardBullet,
    'gundam': GundamBullet,
    'phoenix': PhoenixBullet,
    'kakashi': KakashiBullet
};

export default class TankWeapon {
  constructor(scene, parentContainer, x, y, config = {}) {
    this.scene = scene;
    this.parentContainer = parentContainer;
    
    // Chỉ số vũ khí
    this.range = config.range || 300;
    this.bulletSpeed = config.bulletSpeed || 600;
    this.fireRate = config.fireRate || 500; // mili giây
    this.bulletStyle = config.bulletStyle || 'standard'; // 'standard', 'fire'
    this.damage = config.damage || 20; // Default damage
    this.singleBullet = config.singleBullet || false;

    // Tạo tháp pháo
    // Tháp pháo là một sprite riêng biệt bám theo vị trí container
    this.turret = scene.add.rectangle(x, y, 10, 40, 0xff0000);
    this.turret.setOrigin(0.5, 1); // Pivot ở phía sau (tâm xe)
    this.turret.setVisible(false); // Ẩn thanh súng theo yêu cầu người dùng
    
    // Chỉ số vũ khí
    this.lastFired = 0;
    this.burstMode = false;
    this.activeBullet = null;
  }

  setBurstMode(enabled) {
    this.burstMode = enabled;
  }

  update() {
    // Cập nhật vị trí Tháp pháo bám theo xe tăng
    this.turret.x = this.parentContainer.x;
    this.turret.y = this.parentContainer.y;
  }

  aim(pointer) {
    // Tính góc giữa xe tăng và con trỏ chuột
    const angle = Phaser.Math.Angle.Between(
      this.turret.x, 
      this.turret.y, 
      pointer.worldX, 
      pointer.worldY
    );
    
    // Xoay tháp pháo (cộng 90 độ vì hình chữ nhật của ta hướng 'lên' nhưng 0 radian là hướng 'phải')
    this.turret.rotation = angle + Math.PI/2; 
  }

  shoot() {
    // Không thể bắn nếu bị choáng hoặc câm lặng
    if (this.parentContainer.isStunned || this.parentContainer.isSilenced) return;

    // Single Bullet Mode: Không bắn nếu đạn cũ chưa mất
    if (this.singleBullet && this.activeBullet && this.activeBullet.active) {
        return;
    }

    const time = this.scene.time.now;    
    if (time > this.lastFired + this.fireRate) {
        if (this.burstMode) {
            // Bắn dồn dập: 3 viên đạn
            this.createBullet();
            this.scene.time.delayedCall(100, () => this.createBullet());
            this.scene.time.delayedCall(200, () => this.createBullet());
        } else {
            // Bắn thường
            this.createBullet();
        }

        this.lastFired = time;
    }
  }

  createBullet() {
    // Tạo đạn
    // Lấy vị trí đầu nòng súng
    const vec = new Phaser.Math.Vector2();
    vec.setToPolar(this.turret.rotation - Math.PI/2, 20); // 20 là khoảng cách từ tâm ra đầu nòng (vừa bằng bán kính xe)

    const spawnX = this.turret.x + vec.x;
    const spawnY = this.turret.y + vec.y;
    const angle = this.turret.rotation - Math.PI/2;

    // Chọn lớp (Class) Đạn dựa trên cấu hình config
    const BulletClass = PROJECTILE_MAP[this.bulletStyle] || StandardBullet;

    // Tính toán sát thương
    let damage = this.damage;
    
    // Check buff từ Tank (ví dụ từ chiêu R của Kakashi)
    if (this.parentContainer.tankInstance && this.parentContainer.tankInstance.nextAttackDamageBonus) {
        damage *= 2; // X2 sát thương
        this.parentContainer.tankInstance.nextAttackDamageBonus = false; // Reset buff
        console.log("⚡ Enhanced Attack! Damage:", damage);
        
        // Hiệu ứng visual cho đạn cường hóa (nếu cần)
        // Ví dụ: bullet.setScale(1.5); (nhưng cần bullet instance trước)
    }

    // Khởi tạo đạn
    const bullet = new BulletClass(this.scene, spawnX, spawnY, {
        speed: this.bulletSpeed,
        range: this.range,
        damage: damage, // Truyền damage vào option
        angle: angle
    });

    if (damage > this.damage) {
        bullet.setScale(1.5); // Đạn to hơn nếu được cường hóa
    }

    // Lưu reference đạn vừa bắn
    this.activeBullet = bullet;
    
    return bullet;
  }

}
