import Skill from '../Skill';
import Phaser from 'phaser';

export default class DeepoolSkillR extends Skill {
  constructor(scene) {
    super(scene, {
      name: 'Continuous Sword Stabs',
      description: 'R: Liên Hoàn Kiếm (1s, 10 đòn, 20 st/đòn). Phạm vi: 100x50.',
      cooldown: 12000 // Hồi chiêu 12s
    });

    this.duration = 1000; // 1 giây
    this.tickRate = 100; // 100ms mỗi đòn (Tổng 10 đòn)
    this.damagePerHit = 20;
    this.hitboxWidth = 100;
    this.hitboxHeight = 50;
    
    this.isAttacking = false;
    this.attackTimer = null;
    this.visuals = null;
    
    // Lưu trạng thái khi bắt đầu chiêu
    this.castAngle = 0;
    this.ownerTank = null;
  }

  activate(tankContainer) {
    if (!this.canUse()) return false;
    
    this.execute(tankContainer);
    this.lastUsed = this.scene.time.now;
    return true;
  }

  execute(tankContainer) {
      console.log("Deepool Skill R: Liên Hoàn Kiếm bắt đầu!");
      this.isAttacking = true;
      this.ownerTank = tankContainer;

      // 1. Trói Chân (Đóng băng di chuyển)
      // Đặt cờ để TankMovement dừng xử lý input
      if (tankContainer.tankInstance) {
          tankContainer.tankInstance.isStunned = true; 
          // Dừng ngay lập tức
          if (tankContainer.body) tankContainer.body.setVelocity(0, 0);
      }
      
      // 2. Khóa Hướng (Theo hướng chuột hiện tại)
      const pointer = this.scene.input.activePointer;
      this.castAngle = Phaser.Math.Angle.Between(tankContainer.x, tankContainer.y, pointer.worldX, pointer.worldY);
      
      // Xoay Tank theo hướng thi triển
      if (tankContainer.tankInstance && tankContainer.tankInstance.body) {
           tankContainer.tankInstance.body.setRotation(this.castAngle);
      }
      
      // Nhóm hiệu ứng hình ảnh
      this.visuals = this.scene.add.group();
      
      let ticks = 0;
      const totalTicks = this.duration / this.tickRate; // 10 ticks

      // Timer gây sát thương liên tục
      this.attackTimer = this.scene.time.addEvent({
          delay: this.tickRate,
          callback: () => {
              this.performStab(tankContainer);
              ticks++;
              if (ticks >= totalTicks) {
                  this.stopSkill();
              }
          },
          repeat: totalTicks - 1
      });
      
      // Chém nhát đầu tiên ngay lập tức
      this.performStab(tankContainer);
  }

  performStab(tankContainer) {
      if (!tankContainer.active) {
          this.stopSkill();
          return;
      }

      // Tính vị trí Hitbox dựa trên GÓC ĐÃ KHÓA
      const rotation = this.castAngle;
      
      // Offset tâm hitbox
      // Tính khoảng cách từ tâm tank đến tâm hitbox
      const offsetDistance = 20 + (this.hitboxWidth / 2); 
      const centerX = tankContainer.x + Math.cos(rotation) * offsetDistance;
      const centerY = tankContainer.y + Math.sin(rotation) * offsetDistance;
      
      // --- HIỆU ỨNG HÌNH ẢNH ---
      const graphics = this.scene.add.graphics();
      this.visuals.add(graphics);
      
      // Vẽ Lưỡi Kiếm Hình Thang (Chisel-Tip)
      graphics.clear();
      
      const perpAngle = rotation + Math.PI / 2;
      const offset = (Math.random() - 0.5) * (this.hitboxHeight * 0.8);
      
      // Vị trí Gốc (Chuôi kiếm)
      const baseDist = 40; 
      const baseX = tankContainer.x + Math.cos(rotation) * baseDist + Math.cos(perpAngle) * offset;
      const baseY = tankContainer.y + Math.sin(rotation) * baseDist + Math.sin(perpAngle) * offset;
      
      // Kích thước Lưỡi kiếm
      const bladeLen = this.hitboxWidth * (0.8 + Math.random() * 0.4); // 80-120
      const bladeWidth = 18;
      const tipSlant = 30; // Độ vát của mũi kiếm
      
      // 4 Điểm cục bộ tương đối với trục giữa
      // Helper xoay và dịch chuyển điểm
      const transform = (lx, ly) => {
          const rx = lx * Math.cos(rotation) - ly * Math.sin(rotation);
          const ry = lx * Math.sin(rotation) + ly * Math.cos(rotation);
          return { x: baseX + rx, y: baseY + ry };
      };
      
      const p1 = transform(0, -bladeWidth/2);                 // Góc Trên-Gốc
      const p2 = transform(bladeLen - tipSlant, -bladeWidth/2); // Góc Trên-Mũi
      const p3 = transform(bladeLen, bladeWidth/2);           // Góc Dưới-Mũi
      const p4 = transform(0, bladeWidth/2);                  // Góc Dưới-Gốc
      
      // Vẽ Viền Ngoài (Đỏ)
      graphics.fillStyle(0xff0000, 0.6);
      graphics.beginPath();
      graphics.moveTo(p1.x, p1.y);
      graphics.lineTo(p2.x, p2.y);
      graphics.lineTo(p3.x, p3.y);
      graphics.lineTo(p4.x, p4.y);
      graphics.closePath();
      graphics.fillPath();
      
      // Vẽ Lõi Trong (Trắng) - Hình thang nhỏ hơn
      const coreWidth = bladeWidth * 0.4;
      const coreSlant = tipSlant * 0.8;
      const p1c = transform(0, -coreWidth/2);
      const p2c = transform(bladeLen - coreSlant, -coreWidth/2);
      const p3c = transform(bladeLen, coreWidth/2);
      const p4c = transform(0, coreWidth/2);
      
      graphics.fillStyle(0xffffff, 1);
      graphics.beginPath();
      graphics.moveTo(p1c.x, p1c.y);
      graphics.lineTo(p2c.x, p2c.y);
      graphics.lineTo(p3c.x, p3c.y);
      graphics.lineTo(p4c.x, p4c.y);
      graphics.closePath();
      graphics.fillPath();

      // Hiệu ứng phai màu
      this.scene.tweens.add({
          targets: graphics,
          alpha: 0,
          scaleX: 1.1, // Dài ra một chút
          scaleY: 0.8, 
          duration: 150, 
          onComplete: () => graphics.destroy()
      });

      // --- XỬ LÝ VA CHẠM (HIT DETECTION) ---
      // Kiểm tra nếu tâm địch nằm trong vùng hitbox
      
      if (this.scene.enemies) {
          this.scene.enemies.children.each((enemy) => {
              if (enemy !== tankContainer && enemy.active) {
                   // Chuyển vị trí địch sang hệ tọa độ cục bộ của skill
                   const dx = enemy.x - centerX;
                   const dy = enemy.y - centerY;
                   
                   // Xoay ngược lại để kiểm tra theo trục AABB
                   const localX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
                   const localY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);
                   
                   // Kiểm tra kích thước hình chữ nhật (+ buffer bán kính địch)
                   const hitW = this.hitboxWidth / 2 + 20;
                   const hitH = this.hitboxHeight / 2 + 20;
                   
                   if (Math.abs(localX) <= hitW && Math.abs(localY) <= hitH) {
                       this.applyDamage(enemy, tankContainer);
                   }
              }
          });
      }
  }

  applyDamage(enemy, owner) {
      let enemyTank = null;
      if (enemy.tankInstance) enemyTank = enemy.tankInstance;
      else if (this.scene.dummy && this.scene.dummy.container === enemy) enemyTank = this.scene.dummy;
      else if (this.scene.player && this.scene.player.container === enemy) enemyTank = this.scene.player;

      if (enemyTank) {
          const myTeam = owner.tankInstance ? owner.tankInstance.team : 1;
          if (enemyTank.team !== myTeam) {
               enemyTank.takeDamage(this.damagePerHit);
               // Hiệu ứng nhấp nháy đỏ
               if (enemy.body) {
                   // const originalTint = enemyTank.container.list[0].tintTopLeft; // (Tùy chọn)
               }
          }
      }
  }

  stopSkill() {
      // Bỏ khóa di chuyển
      if (this.isAttacking && this.ownerTank && this.ownerTank.tankInstance) {
          this.ownerTank.tankInstance.isStunned = false; 
      }
      
      this.isAttacking = false;

      if (this.attackTimer) {
          this.attackTimer.remove();
          this.attackTimer = null;
      }
      if (this.visuals) {
          this.visuals.destroy(true);
          this.visuals = null;
      }
      console.log("Deepool Skill R: Kết thúc");
  }
}
