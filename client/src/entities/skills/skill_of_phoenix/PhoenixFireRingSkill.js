import Phaser from 'phaser';
import Skill from '../Skill';

// Chiêu Space: Vòng Lửa Phượng Hoàng (Phoenix Fire Ring)
export default class PhoenixFireRingSkill extends Skill {
  constructor(scene) {
    super(scene, { 
        cooldown: 10000, // Hồi chiêu 10 giây (tăng lên chút vì hiệu ứng mạnh 4s)
        key: 'space' 
    }); 
  }

  execute(tankContainer) {
    // 0. Hiệu ứng khống chế: Hóa đá (Immobilize)
    // Ngừng di chuyển ngay lập tức
    if (tankContainer.body) {
        tankContainer.body.setVelocity(0, 0);
    }
    // Khóa di chuyển và các hành động khác
    tankContainer.isStunned = true;

    // 1. Tạo hiệu ứng vòng lửa
    // Dùng container riêng để quản lý các thành phần của vòng lửa
    const ringContainer = this.scene.add.container(0, 0);
    tankContainer.add(ringContainer); // Gắn vào xe để di chuyển theo xe

    // Bán kính vòng lửa rộng hơn
    const radius = 200; 

    // Vòng tròn nền (mờ)
    const ring = this.scene.add.circle(0, 0, radius, 0xff4500, 0.3);
    ring.setStrokeStyle(3, 0xffff00);
    ringContainer.add(ring);

    // 2. Logic tạo hạt lửa (Particles) xung quanh viền
    
    // Timer để spam hạt lửa
    const particleEvent = this.scene.time.addEvent({
        delay: 50, // Nhanh hơn chút để vòng lửa dày hơn
        loop: true,
        callback: () => {
             this.spawnFireParticle(ringContainer, radius);
        }
    });

    // 3. Logic Gây Sát Thương (50 dame/s)
    const damageTimer = this.scene.time.addEvent({
        delay: 200, // Check mỗi 0.2s
        loop: true,
        callback: () => {
             if (this.scene.enemies) {
                 this.scene.enemies.getChildren().forEach(enemyContainer => {
                     if (enemyContainer === tankContainer) return;

                     const dist = Phaser.Math.Distance.Between(tankContainer.x, tankContainer.y, enemyContainer.x, enemyContainer.y);
                     if (dist <= radius) {
                         // Tìm Tank Instance
                         let targetTank = null;
                         if (this.scene.player && this.scene.player.container === enemyContainer) {
                             targetTank = this.scene.player;
                         } else if (this.scene.dummy && this.scene.dummy.container === enemyContainer) {
                             targetTank = this.scene.dummy;
                         }

                         if (targetTank) {
                             const now = this.scene.time.now;
                             
                             // Hiệu ứng làm chậm (Slow 30 speed)
                             // Áp dụng mỗi tick loop (200ms), duration 500ms để duy trì liên tục
                             targetTank.applySlow(50, 500);

                             // Burn mỗi 1 giây
                             if (!targetTank.lastFireRingBurnTime || now - targetTank.lastFireRingBurnTime >= 1000) {
                                 targetTank.takeDamage(50);
                                 targetTank.lastFireRingBurnTime = now;
                                 console.log("Enemy burned by Fire Ring! Damage: 50");

                                 // Effect
                                 if (targetTank.body.setTint) {
                                     targetTank.body.setTint(0xff8c00); // Dark Orange
                                     this.scene.time.delayedCall(200, () => {
                                        if(targetTank.body) targetTank.body.clearTint();
                                     });
                                 }
                             }
                         }
                     }
                 });
             }
        }
    });

    // 4. Tồn tại trong 4 giây
    this.scene.time.delayedCall(4000, () => {
        // Dọn dẹp
        particleEvent.remove();
        damageTimer.remove();
        ringContainer.destroy();

        // Mở khóa (Hết hóa đá)
        tankContainer.isStunned = false;
    });
  }

  spawnFireParticle(container, radius) {
      if (!container.scene) return; // Kiểm tra xem đã bị hủy chưa

      // Random góc
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const particle = this.scene.add.circle(x, y, 4, 0xffff00, 1);
      container.add(particle);

      // Tween bay lên/mất dần
      this.scene.tweens.add({
          targets: particle,
          alpha: 0,
          scale: 0.5,
          y: y - 20, // Bay lên chút
          duration: 500,
          onComplete: () => {
              particle.destroy();
          }
      });
  }
}
