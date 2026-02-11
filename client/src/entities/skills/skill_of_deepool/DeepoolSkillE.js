import Skill from '../Skill';
import Phaser from 'phaser';

export default class DeepoolSkillE extends Skill {
  constructor(scene) {
    super(scene, {
      name: 'Assassinate',
      description: 'E1: Ám khí (350). E2: Ám sát (Teleport + Damage + 40% Tốc chạy 2s). CD: 6s.',
      cooldown: 6000 // Base cooldown for UI (matching realCooldown)
    });

    this.stage = 1; // 1: Throw Mark, 2: Teleport
    this.markedTarget = null;
    this.markTimer = null;
    this.markDuration = 4000; // 3.5 seconds
    
    // Projectile properties
    this.projectileSpeed = 1000; // Increased speed for range 600
    this.projectileRange = 350; // Reset range to 300
    this.maxTeleportRange = 370; // Max range to activate E2 (Updated to 370)
    this.damageE1 = 50; // Damage for E1 (Mark)
    this.damage = 100; // Damage for E2 (Teleport)
  }

  // Override to check stage logic
  canUse() {
    // If we are in cooldown (based on lastUsed), we can't use
    // UNLESS we are in stage 2 (combo window)
    if (this.stage === 2) {
        // Check distance for E2
        if (this.markedTarget && this.markedTarget.container) {
             const dist = Phaser.Math.Distance.Between(
                 this.scene.player.container.x, this.scene.player.container.y,
                 this.markedTarget.container.x, this.markedTarget.container.y
             );
             if (dist > this.maxTeleportRange) return false;
        }
        return true;
    }
    
    return super.canUse();
  }

  getComboProgress() {
      if (this.stage === 2 && this.markTimer) {
          return this.markTimer.getProgress(); // Returns 0..1
      }
      return null;
  }

  activate(tankContainer) {
    if (this.stage === 1) {
        if (!this.canUse()) return false;
        
        this.executeStage1(tankContainer);
        // Important: Do NOT set lastUsed here yet. 
        // We want cooldown to start ONLY if we miss or finish combo.
        return true;
    } else if (this.stage === 2) {
        // Double check distance in activate
        if (this.markedTarget && this.markedTarget.container) {
             const dist = Phaser.Math.Distance.Between(
                 tankContainer.x, tankContainer.y,
                 this.markedTarget.container.x, this.markedTarget.container.y
             );
             if (dist > this.maxTeleportRange) {
                 console.log("Deepool Skill E: Target too far for E2");
                 // Optional: Show "Out of Range" text
                 const txt = this.scene.add.text(tankContainer.x, tankContainer.y - 50, "Out of Range!", {
                     fontSize: '16px', color: '#ff0000'
                 }).setOrigin(0.5);
                 this.scene.time.delayedCall(500, () => txt.destroy());
                 return false;
             }
        }
        
        this.executeStage2(tankContainer);
        return true;
    }
    return false;
  }

  executeStage1(tankContainer) {
    console.log("Deepool Skill E: Stage 1 - Throwing Mark");
    
    // Create Projectile
    const pointer = this.scene.input.activePointer;
    const startX = tankContainer.x;
    const startY = tankContainer.y;
    
    // Direction
    // Hướng
    const angle = Phaser.Math.Angle.Between(startX, startY, pointer.worldX, pointer.worldY);
    const velocity = this.scene.physics.velocityFromRotation(angle, this.projectileSpeed);

    // Tạo sprite đạn riêng cho chiêu này
    const projectile = this.scene.physics.add.sprite(startX, startY, 'bullet_quickdraw'); 
    projectile.setTint(0xff0000); // Màu đỏ đặc trưng
    projectile.setScale(0.2); // Kích thước nhỏ
    projectile.setVelocity(velocity.x, velocity.y);
    projectile.setRotation(angle);
    projectile.owner = tankContainer;
    projectile.isActive = true; 
    
    // Biến hỗ trợ dọn dẹp
    let wallCollider = null;
    let enemyCollider = null;

    // Hàm dọn dẹp
    const cleanup = () => {
        projectile.isActive = false;
        if (projectile.active) projectile.destroy();
        if (enemyCollider) enemyCollider.destroy();
        if (wallCollider) wallCollider.destroy();
        if (projectile.rangeTimer) projectile.rangeTimer.remove();
    };

    // 1. Va chạm với Địch -> Đánh dấu
    if (this.scene.enemies) {
        enemyCollider = this.scene.physics.add.overlap(projectile, this.scene.enemies, (proj, enemy) => {
            if (!proj.active || !projectile.isActive) return;
            
            if (enemy !== tankContainer) {
                 // Xác định thực thể địch dựa trên container
                 let enemyTank = null;
                 if (enemy.tankInstance) {
                     enemyTank = enemy.tankInstance;
                 } 
                 else if (this.scene.dummy && this.scene.dummy.container === enemy) {
                     enemyTank = this.scene.dummy;
                 } else if (this.scene.player && this.scene.player.container === enemy) {
                     enemyTank = this.scene.player; 
                 }
                 
                 // Nếu tìm thấy địch và khác đội
                 if (enemyTank) {
                    const myTeam = tankContainer.tankInstance ? tankContainer.tankInstance.team : (this.scene.player === tankContainer.tankInstance ? 1 : 2);
                    
                    if (enemyTank.team !== myTeam) {
                        this.onHitStage1(enemyTank);
                        cleanup();
                    }
                 }
            }
        });
    }

    // 2. Va chạm với Tường -> Bỏ qua (Xuyên tường)
    // if (this.scene.map) { ... } -> Đã xóa để tạo hiệu ứng "Sóng âm"


    // 3. Hết tầm -> Trượt (Hủy đạn, bắt đầu hồi chiêu)
    projectile.rangeTimer = this.scene.time.delayedCall(this.projectileRange / this.projectileSpeed * 1000, () => {
        if (projectile.isActive) {
            console.log("Deepool Skill E: Hết tầm (Trượt)");
            this.startCooldown();
            cleanup();
        }
    });
  }

  onHitStage1(target) {
      console.log("Deepool Skill E: Trúng đích! Đã đánh dấu mục tiêu.");
      
      // Gây sát thương E1
      if (target.takeDamage) {
          target.takeDamage(this.damageE1);
      }
      
      this.markedTarget = target;
      this.stage = 2;
      
      // Hiển thị Dấu ấn
      if (target.container) {
          const markIndicator = this.scene.add.text(0, -60, "☠️", {
              fontSize: '32px',
              color: '#ff0000',
              fontStyle: 'bold'
          }).setOrigin(0.5);
          
          target.container.add(markIndicator);
          this.markIndicator = markIndicator;
      }

      // Bắt đầu đếm ngược 3.5s để dùng E2
      this.markTimer = this.scene.time.delayedCall(this.markDuration, () => {
          console.log("Deepool Skill E: Dấu ấn hết hạn");
          this.resetStage(); // Dấu ấn hết hạn -> Quay về hồi chiêu
      });
  }

  executeStage2(tankContainer) {
      if (!this.markedTarget) {
          this.resetStage();
          return;
      }
      
      const targetContainer = this.markedTarget.container;
      // Kiểm tra xem mục tiêu còn hợp lệ không
      if (!targetContainer || !targetContainer.active) {
           console.log("Deepool Skill E: Mục tiêu đã mất");
           this.resetStage();
           return;
      }

      console.log("Deepool Skill E: Giai đoạn 2 - Ám Sát!");

      // Logic dịch chuyển
      const targetX = targetContainer.x;
      const targetY = targetContainer.y;
      
      // Cập nhật vị trí Container
      tankContainer.x = targetX;
      tankContainer.y = targetY;
      
      // *** VÁ LỖI QUAN TRỌNG: Reset Physics Body ***
      if (tankContainer.body) {
          tankContainer.body.reset(targetX, targetY);
      }
      
      // Gây sát thương
      if (this.markedTarget.takeDamage) {
          this.markedTarget.takeDamage(this.damage);
          // this.scene.cameras.main.shake(100, 0.01); // Đã xóa theo yêu cầu
      }
      
      // Tạo hiệu ứng Flash - ĐÃ XÓA theo yêu cầu
      /*
      const flash = this.scene.add.circle(targetX, targetY, 50, 0xff0000, 0.8);
      this.scene.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 2,
          duration: 200,
          onComplete: () => flash.destroy()
      });
      */

      // Tăng tốc chạy 40% trong 2s
      if (tankContainer.tankInstance && tankContainer.tankInstance.applySpeedBoost) {
          tankContainer.tankInstance.applySpeedBoost(1.4, 2000);
      }

      // Reset ngay sau khi E2 thành công
      this.resetStage();
  }

  startCooldown() {
      // Set lastUsed thành hiện tại, để lớp cơ sở vật lý/UI biết đang hồi chiêu
      this.lastUsed = this.scene.time.now;
      this.stage = 1;
      console.log("Deepool Skill E: Bắt đầu hồi chiêu (6s)");
  }

  resetStage() {
      // Xóa hiển thị dấu ấn
      if (this.markedTarget && this.markIndicator) {
          if (this.markedTarget.container) {
               this.markedTarget.container.remove(this.markIndicator);
          }
          this.markIndicator.destroy();
      }
      
      this.markedTarget = null;
      this.markIndicator = null;
      
      // Hủy timer nếu còn chạy
      if (this.markTimer) {
          this.markTimer.remove();
          this.markTimer = null;
      }

      // Đảm bảo bắt đầu hồi chiêu
      this.startCooldown();
  }
}
