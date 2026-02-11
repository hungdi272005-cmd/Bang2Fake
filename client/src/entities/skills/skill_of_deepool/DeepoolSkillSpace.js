import Skill from '../Skill';
import Phaser from 'phaser';

export default class DeepoolSkillSpace extends Skill {
  constructor(scene) {
    super(scene, {
      name: 'Repulse',
      description: 'Space: Đẩy lùi địch (Tầm 100). Va tường -> Choáng + Sát thương.',
      cooldown: 8000 // Hồi chiêu 8s
    });
    
    this.maxRange = 100; // Tầm xa tối đa
    this.knockbackDistance = 250;
    this.knockbackSpeed = 800;
    this.knockbackDamage = 50; // Sát thương ban đầu
    this.wallDamage = 100; // Sát thương va tường
    this.stunDuration = 2000;
  }

  activate(tankContainer) {
    if (!this.canUse()) return false;

    // 1. Tìm mục tiêu dưới con trỏ chuột
    const pointer = this.scene.input.activePointer;
    let target = null;
    
    // Tạo một cảm biến tròn nhỏ tại vị trí chuột
    const sensor = this.scene.add.circle(pointer.worldX, pointer.worldY, 10, 0x000000, 0);
    this.scene.physics.add.existing(sensor);
    
    // Kiểm tra chồng lấn với địch
    if (this.scene.enemies) {
        this.scene.physics.overlap(sensor, this.scene.enemies, (s, enemy) => {
            if (!target && enemy.active && enemy !== tankContainer) {
                // Kiểm tra giới hạn khoảng cách
                const dist = Phaser.Math.Distance.Between(tankContainer.x, tankContainer.y, enemy.x, enemy.y);
                if (dist <= this.maxRange) {
                    target = enemy;
                }
            }
        });
    }
    
    sensor.destroy();

    if (!target) {
        // Tùy chọn: Hiệu ứng báo lỗi khi không có mục tiêu hoặc ngoài tầm
        // console.log("Deepool Space: Không có mục tiêu trong tầm 100");
        return false;
    }

    this.execute(tankContainer, target);
    this.lastUsed = this.scene.time.now;
    return true;
  }

  execute(owner, target) {
      console.log("Deepool Skill Space: Đẩy lùi mục tiêu!", target);
      
      // Gây sát thương ban đầu (50)
      if (target.tankInstance) {
          target.tankInstance.takeDamage(this.knockbackDamage);
      } else if (target.takeDamage) {
          target.takeDamage(this.knockbackDamage);
      }
      
      // Tính toán vector đẩy lùi (Deepool -> Mục tiêu)
      const angle = Phaser.Math.Angle.Between(owner.x, owner.y, target.x, target.y);
      const velocityX = Math.cos(angle) * this.knockbackSpeed;
      const velocityY = Math.sin(angle) * this.knockbackSpeed;
      
      // --- HIỆU ỨNG HÌNH ẢNH: Chém Chéo X ---
      const tx = target.x;
      const ty = target.y;
      const visuals = this.scene.add.graphics({ x: tx, y: ty }); // Tạo graphics tại vị trí mục tiêu
      const size = 60; // Kích thước

      // Nét kiếm lớn (Đỏ)
      visuals.lineStyle(10, 0xff0000, 0.8);
      // Nét 1: \ (Góc trên-trái -> Góc dưới-phải)
      visuals.beginPath();
      visuals.moveTo(-size, -size);
      visuals.lineTo(size, size);
      visuals.strokePath();
      // Nét 2: / (Góc trên-phải -> Góc dưới-trái)
      visuals.beginPath();
      visuals.moveTo(size, -size);
      visuals.lineTo(-size, size);
      visuals.strokePath();

      // Nét kiếm nhỏ (Trắng - Lõi)
      visuals.lineStyle(4, 0xffffff, 1);
      visuals.beginPath();
      visuals.moveTo(-size, -size);
      visuals.lineTo(size, size);
      visuals.strokePath();
      visuals.beginPath();
      visuals.moveTo(size, -size);
      visuals.lineTo(-size, size);
      visuals.strokePath();

      // Hiệu ứng phai màu & Biến mất
      this.scene.tweens.add({
          targets: visuals,
          alpha: 0,
          scaleX: 1.5, // Phóng to mạnh hơn chút
          scaleY: 1.5,
          angle: 15, // Xoay nhẹ cho động
          duration: 250,
          onComplete: () => visuals.destroy()
      });

      // Áp dụng vận tốc
      if (target.body) {
          // Tạm thời reset lực cản để bay
          target.orgDrag = target.body.drag.x;
          target.body.setDrag(0); 
          target.body.setVelocity(velocityX, velocityY);
          target.isKnockedBack = true;
          
          // Vô hiệu hóa di chuyển trong khi bị đẩy (Cơ chế choáng)
          if (target.tankInstance) {
              target.tankInstance.isStunned = true; 
          }
      }

      // Theo dõi quá trình đẩy lùi
      // Cần dừng lại sau khoảng thời gian = distance / speed
      const duration = (this.knockbackDistance / this.knockbackSpeed) * 1000;
      
      // Sử dụng sự kiện update để kiểm tra va chạm tường theo từng frame
      const startTime = this.scene.time.now;
      
      target.knockbackTimer = this.scene.time.addEvent({
          delay: 16, // xấp xỉ 60fps
          loop: true,
          callback: () => {
              if (!target.active || !target.body) {
                  this.stopKnockback(target);
                  return;
              }
              
              const elapsed = this.scene.time.now - startTime;
              
              // 1. Kiểm tra va chạm tường
              if (target.body.blocked.left || target.body.blocked.right || 
                  target.body.blocked.up || target.body.blocked.down ||
                  target.body.touching.left || target.body.touching.right ||
                  target.body.touching.up || target.body.touching.down) {
                      
                  // VA TƯỜNG!
                  this.onWallHit(target);
                  this.stopKnockback(target);
                  return;
              }
              
              // 2. Kiểm tra thời gian/khoảng cách
              if (elapsed >= duration) {
                  // Đã bay đủ đoạn đường
                  this.stopKnockback(target);
              }
          }
      });
  }
  
  stopKnockback(target) {
      if (target.knockbackTimer) {
          target.knockbackTimer.remove();
          target.knockbackTimer = null;
      }
      
      if (target.active && target.body) {
          target.body.setVelocity(0, 0);
          // Khôi phục lực cản
          if (target.orgDrag !== undefined) target.body.setDrag(target.orgDrag);
          else target.body.setDrag(100); // Giá trị mặc định
          
          target.isKnockedBack = false;
          
          // Bỏ choáng: Luôn xóa cờ "Choáng Đẩy Lùi".
          // Nếu va tường, applyStun() đã đặt một timer choáng riêng trên container.
          // Cần xóa cái choáng vĩnh viễn này để timer kia có hiệu lực.
          if (target.tankInstance) {
              target.tankInstance.isStunned = false; 
          }
      }
  }
  
  onWallHit(target) {
      console.log("Deepool Skill Space: Mục tiêu va tường! Choáng + Sát thương");
      
      // Sát thương va tường
      if (target.tankInstance) {
          target.tankInstance.takeDamage(this.wallDamage);
          
          // Reset trạng thái choáng để tạo timer mới
          target.tankInstance.container.isStunned = false; 
          target.tankInstance.applyStun(this.stunDuration);
      } else if (target.takeDamage) {
          target.takeDamage(this.wallDamage); // Cho dummy/quái
      }
      
      // Đánh dấu là bị choáng tường
      target.isWallStunned = true;
      this.scene.time.delayedCall(this.stunDuration, () => {
          if (target.active) target.isWallStunned = false;
      });
      
      // Hiệu ứng hình ảnh (Rung màn hình)
      this.scene.cameras.main.shake(100, 0.005);
  }
}
