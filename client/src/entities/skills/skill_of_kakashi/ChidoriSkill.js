import Skill from '../Skill';
import Phaser from 'phaser';

export default class ChidoriSkill extends Skill {
  constructor(scene) {
    super(scene, {
      name: 'Chidori',
      description: 'Lao tới, sát thương và làm chậm',
      cooldown: 8000
    });
    
    this.isDashing = false;
    this.tankContainer = null;
    this.tankInstance = null;
    
    this.startPos = new Phaser.Math.Vector2();
    this.targetPos = new Phaser.Math.Vector2();
    this.lightningGraphics = null;
    this.chidoriSprite = null;
    this.dashSpeed = 800;
    this.maxRange = 300;
    this.damage = 150; // Sát thương cao
    
    // Bind update method
    this.update = this.update.bind(this);
  }

  execute(tankContainer) {
    this.tankContainer = tankContainer;
    this.tankInstance = tankContainer.tankInstance;
    
    if (!this.tankInstance) {
        console.error("ChidoriSkill: Tank Instance not found on container!");
        return;
    }

    // Lấy vị trí chuột
    const pointer = this.scene.input.activePointer;
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;

    // Tính vector hướng
    this.startPos.set(tankContainer.x, tankContainer.y);
    const direction = new Phaser.Math.Vector2(worldX - this.startPos.x, worldY - this.startPos.y);
    
    // Giới hạn tầm xa: max 300
    let distance = direction.length();
    if (distance > this.maxRange) {
        direction.setLength(this.maxRange);
        distance = this.maxRange;
    }
    
    this.targetPos.set(this.startPos.x + direction.x, this.startPos.y + direction.y);
    
    // Bắt đầu dash
    this.isDashing = true;
    
    // Set velocity cho tank
    const velocity = direction.clone().normalize().scale(this.dashSpeed);
    tankContainer.body.setVelocity(velocity.x, velocity.y);
    
    // Block input/movement khác
    this.tankInstance.isStunned = true; 

    // GHOST MODE: Tắt va chạm PHYSICS (để xuyên tường)
    // Lưu ý: Việc này cũng tắt overlap tự động của Arcade Physics với body này
    tankContainer.body.checkCollision.none = true;
    
    // Đăng ký update loop
    this.scene.events.on('update', this.update);
    
    // Tạo Sprite Chidori
    if (!this.chidoriSprite) {
        // Tính vị trí đầu súng (offset khoảng 40px từ tâm)
        const offset = 40;
        const angle = direction.angle();
        const startX = tankContainer.x + Math.cos(angle) * offset;
        const startY = tankContainer.y + Math.sin(angle) * offset;

        this.chidoriSprite = this.scene.add.sprite(startX, startY, 'skill_chidori');
        this.chidoriSprite.setDepth(100);
        // Xoay sprite theo hướng dash
        this.chidoriSprite.setRotation(angle);
        // Scale nhỏ lại theo yêu cầu (bằng đầu súng) - Giữ nguyên 0.15 user đã chỉnh
        this.chidoriSprite.setScale(0.15); 
    }
  }
  
  update(time, delta) {
    if (!this.isDashing || !this.tankContainer) {
        this.stopDash();
        return;
    }
    
    const currentPos = new Phaser.Math.Vector2(this.tankContainer.x, this.tankContainer.y);
    const distToTarget = currentPos.distance(this.targetPos);
    
    // 1. Cập nhật vị trí Sprite theo Tank (giữ offset đầu súng)
    if (this.chidoriSprite) {
        const offset = 40;
        const angle = this.chidoriSprite.rotation; // Góc quay đã set lúc tạo
        
        this.chidoriSprite.setPosition(
            this.tankContainer.x + Math.cos(angle) * offset, 
            this.tankContainer.y + Math.sin(angle) * offset
        );
    }
    
    // 2. Check Collision với Enemies (Thủ công vì checkCollision.none = true)
    this.checkCollisionManual();
    
    // 3. Điều kiện dừng: Gần đích (20px)
    if (distToTarget < 20) {
        this.stopDash();
    }
  }
  
  checkCollisionManual() {
     if (!this.scene.enemies) return;
     
     const enemies = this.scene.enemies.getChildren();
     // Bán kính va chạm dựa trên kích thước VISUAL của tank (displaySize = 90x90)
     // Mỗi tank rìa = 45px, 2 tank chạm rìa = 45 + 45 = 90px
     const tankVisualRadius = 45; // Nửa displaySize (90/2)
     const hitRadius = tankVisualRadius * 2; // Rìa tank chạm rìa tank = 90px

     for (const enemyContainer of enemies) {
         // Bỏ qua chính mình
         if (enemyContainer === this.tankContainer) continue;
         
         const dist = Phaser.Math.Distance.Between(
             this.tankContainer.x, this.tankContainer.y,
             enemyContainer.x, enemyContainer.y
         );
         
         if (dist <= hitRadius) {
             // Va chạm rìa! Đẩy tank lại đúng vị trí rìa chạm rìa
             const angle = Phaser.Math.Angle.Between(
                 enemyContainer.x, enemyContainer.y,
                 this.tankContainer.x, this.tankContainer.y
             );
             // Đặt tank dừng lại ở đúng vị trí rìa chạm rìa (cách tâm enemy = hitRadius)
             this.tankContainer.x = enemyContainer.x + Math.cos(angle) * hitRadius;
             this.tankContainer.y = enemyContainer.y + Math.sin(angle) * hitRadius;

             const enemyTank = enemyContainer.tankInstance;
             
             // Fallback dummy logic (nếu dummy chưa update tankInstance kịp)
             if (!enemyTank && this.scene.dummy && this.scene.dummy.container === enemyContainer) {
                 if (this.scene.dummy.team !== this.tankInstance.team) {
                     this.onHitEnemy(this.scene.dummy);
                     return; 
                 }
             }

             if (enemyTank && enemyTank.team !== this.tankInstance.team) {
                 this.onHitEnemy(enemyTank);
                 return;
             }
         }
     }
  }
  
  onHitEnemy(enemy) {
    if (!this.isDashing) return;
    
    console.log('⚡ Chidori Hit!', enemy.name || 'Enemy');
    
    // Gây sát thương
    if (enemy.takeDamage) {
        enemy.takeDamage(this.damage);
    }
    
    // Làm chậm
    if (enemy.stats && enemy.stats.speed) {
        const originalSpeed = enemy.movement ? enemy.movement.originalSpeed : enemy.stats.speed;
        
        // Gọi hàm applySlow của Tank nếu có
        if (typeof enemy.applySlow === 'function') {
             enemy.applySlow(50, 1500); // Giảm 50 speed trong 1.5 giây
        } else {
            // Fallback chỉnh stats thủ công
             enemy.stats.speed = originalSpeed * 0.5;
            this.scene.time.delayedCall(1500, () => {
                if (enemy && enemy.stats) {
                    enemy.stats.speed = originalSpeed;
                }
            });
        }
    }
    
    // Dừng dash NGAY LẬP TỨC khi va chạm enemy tank
    this.stopDash();
  }
  
  stopDash() {
    if (!this.isDashing) return;
    
    this.isDashing = false;
    
    if (this.tankInstance) {
        this.tankInstance.isStunned = false; // Mở khóa input
        // Tính năng mới: Sau khi dùng chiêu, đòn đánh thường tiếp theo được tăng sát thương
        this.tankInstance.nextAttackDamageBonus = true;
        console.log("⚡ Chidori finished! Next attack enhanced!");
        
        // Hiệu ứng visual cho Tank (nếu cần)
        if (this.tankContainer.body && this.tankContainer.body.setTint) {
             // Nháy sáng màu xanh điện
             this.tankContainer.body.setTint(0x00ffff);
             this.scene.time.delayedCall(500, () => {
                 if (this.tankContainer && this.tankContainer.body) {
                     this.tankContainer.body.clearTint();
                 }
             });
        }
    }
    
    if (this.tankContainer && this.tankContainer.body) {
         this.tankContainer.body.setVelocity(0, 0);
         // Tắt GHOST MODE: Bật lại va chạm vật lý bình thường
         this.tankContainer.body.checkCollision.none = false;
    }
    
    // Xóa sprite
    if (this.chidoriSprite) {
        this.chidoriSprite.destroy();
        this.chidoriSprite = null;
    }
    
    // Hủy đăng ký update
    this.scene.events.off('update', this.update);
  }
}
