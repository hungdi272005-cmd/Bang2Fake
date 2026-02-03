import Phaser from 'phaser';
import Skill from '../Skill';

// Chiêu E: Lướt Phượng Hoàng (Phoenix Dash)
export default class PhoenixDashSkill extends Skill {
  constructor(scene) {
    super(scene, { 
        cooldown: 8000, // Hồi chiêu gốc 8 giây
        key: 'e' 
    }); 
    this.initialCooldown = 8000;
    this.haloCooldown = 500; // Thời gian chờ giữa 2 lần lướt (0.5s)
    this.dashCount = 0;
    this.windowTimer = null;
    this.windowStartTime = 0;
    this.windowDuration = 0;
  }

  // Trả về tiến trình combo (0 -> 1 hoặc 1 -> 0) nếu đang trong trạng thái chờ
  getComboProgress() {
      if (this.dashCount !== 1) return null;
      
      const now = this.scene.time.now;
      const elapsed = now - this.windowStartTime;
      const progress = 1 - (elapsed / this.windowDuration);
      
      return Math.max(0, Math.min(1, progress));
  }

  activate(tank, ...args) {
    const now = this.scene.time.now;

    // Giai đoạn 1: Chưa lướt hoặc đã hồi chiêu xong
    if (this.dashCount === 0) {
        // Kiểm tra cooldown gốc (6000)
        // Lưu ý: this.cooldown có thể đang là 500 từ lần trước, cần đảm bảo logic đúng
        // Nhưng logic reset bên dưới sẽ set lại 6000 khi hết chain.
        
        if (now - this.lastUsed >= this.cooldown) {
            this.execute(tank, ...args);
            
            // Chuyển sang trạng thái chờ lướt 2
            this.dashCount = 1;
            this.lastUsed = now; // Ghi nhận thời gian lướt 1
            this.cooldown = this.haloCooldown; // Đổi cooldown thành 0.5s để UI hiển thị "Sẵn sàng" sớm

            // Combo Window Tracking
            this.windowDuration = 4000;
            this.windowStartTime = now;

            // Đặt timer 4 giây cho cửa sổ lướt lần 2
            if (this.windowTimer) this.windowTimer.remove();
            this.windowTimer = this.scene.time.delayedCall(4000, () => {
                // Hết 4 giây mà không lướt -> Reset về cooldown gốc và bắt đầu đếm
                if (this.dashCount === 1) {
                    this.dashCount = 0;
                    this.cooldown = this.initialCooldown;
                    this.lastUsed = this.scene.time.now; // Bắt đầu tính cooldown 6s TỪ LÚC NÀY
                }
            });
            return true;
        }
    } 
    // Giai đoạn 2: Đang trong cửa sổ lướt lần 2 (trong vòng 4s)
    else if (this.dashCount === 1) {
        // Kiểm tra cooldown ngắn (500ms) để tránh spam kép quá nhanh
        if (now - this.lastUsed >= this.cooldown) {
             this.execute(tank, ...args);
             
             // Hoàn thành combo -> Reset
             this.finishCombo();
             return true;
        }
    }
    return false;
  }

  finishCombo() {
      this.dashCount = 0;
      if (this.windowTimer) this.windowTimer.remove();
      
      // Kích hoạt cooldown gốc
      this.cooldown = this.initialCooldown;
      this.lastUsed = this.scene.time.now;
  }

  execute(tankContainer, pointer) {
    try {
        // 1. Xác định hướng lướt
        const tankX = tankContainer.x;
        const tankY = tankContainer.y;
        let direction = new Phaser.Math.Vector2();
        
        if (pointer) {
            direction.x = pointer.worldX - tankX;
            direction.y = pointer.worldY - tankY;
        } else {
            direction.setToPolar(tankContainer.rotation, 1);
        }
        direction.normalize();

        // 2. Tính điểm đến (Khoảng cách 300)
        const distance = 300;
        let targetX = tankX + (direction.x * distance);
        let targetY = tankY + (direction.y * distance);

        // --- CHECK TƯỜNG (RAYCAST & WALL JUMP) ---
        // Nếu map tồn tại, kiểm tra xem đường lướt có cắt tường không
        if (this.scene.map) {
             const line = new Phaser.Geom.Line(tankX, tankY, targetX, targetY);
             let closestPoint = null;
             let minDist = Infinity;
             
             // Helper: Check overlap point with any wall
             const isPointInWall = (x, y) => {
                 const checkGroup = (group) => {
                     if (!group) return false;
                     return group.getChildren().some(wall => {
                         return wall.getBounds().contains(x, y);
                     });
                 };
                 return checkGroup(this.scene.map.walls) || checkGroup(this.scene.map.softWalls);
             };

             // 1. Raycast tìm điểm chạm đầu tiên (Entry Point)
             const checkCollision = (group) => {
                 if (!group) return;
                 group.getChildren().forEach(wall => {
                     const bounds = wall.getBounds();
                     const points = Phaser.Geom.Intersects.GetLineToRectangle(line, bounds);
                     if (points.length > 0) {
                         for (let i = 0; i < points.length; i++) {
                             const p = points[i];
                             const d = Phaser.Math.Distance.Between(tankX, tankY, p.x, p.y);
                             if (d < minDist) {
                                 minDist = d;
                                 closestPoint = p;
                             }
                         }
                     }
                 });
             };

             checkCollision(this.scene.map.walls);
             checkCollision(this.scene.map.softWalls);

             // Nếu có va chạm trên đường đi
             if (closestPoint) {
                 // 2. Kiểm tra điểm đến (Target) có nằm trong tường không?
                 if (!isPointInWall(targetX, targetY)) {
                     // CASE A: Target nằm ngoài tường -> Đã nhảy qua tường thành công!
                     // Giữ nguyên targetX, targetY
                     console.log("Jumped over wall!");
                 } else {
                     // CASE B: Target nằm TRONG tường -> Kẹt
                     // Kiểm tra xem có thể "lướt ráng" ra ngoài không (Nudge)
                     // Bắn ray từ Target đi tiếp theo hướng dash để tìm điểm thoát
                     const escapeDist = 100; // Tìm trong 100px
                     const escapeLine = new Phaser.Geom.Line(targetX, targetY, targetX + direction.x * escapeDist, targetY + direction.y * escapeDist);
                     
                     let exitPoint = null;
                     let minExitDist = Infinity;

                     const findExit = (group) => {
                         if (!group) return;
                         group.getChildren().forEach(wall => {
                             const bounds = wall.getBounds();
                             const points = Phaser.Geom.Intersects.GetLineToRectangle(escapeLine, bounds);
                             // Points trả về các điểm giao cắt.
                             // Vì ta đang ở TRONG tường, điểm giao cắt sẽ là điểm THOÁT ra khỏi tường đó (hoặc vào tường khác)
                             // Ta cần tìm điểm ra khỏi khối tường hiện tại.
                             // Thực tế GetLineToRectangle trả về border points.
                             // Từ trong bắn ra, ta sẽ gặp boundary.
                             
                             if (points.length > 0) {
                                 points.forEach(p => {
                                      const d = Phaser.Math.Distance.Between(targetX, targetY, p.x, p.y);
                                      if (d < minExitDist) {
                                          minExitDist = d;
                                          exitPoint = p;
                                      }
                                 });
                             }
                         });
                     };
                     
                     findExit(this.scene.map.walls);
                     findExit(this.scene.map.softWalls);

                     // 3. Quy tắc: Nếu khoảng cách từ Target đến Exit < 20px thì cho qua
                     if (exitPoint && minExitDist < 20) {
                          targetX = exitPoint.x + direction.x * 25; // Buffer ra ngoài chút
                          targetY = exitPoint.y + direction.y * 25;
                          console.log("Nudged out of wall!");
                     } else {
                          // Không cứu được -> Về lại Entry Point (đứng trước tường)
                          const angle = Phaser.Math.Angle.Between(tankX, tankY, targetX, targetY);
                          targetX = closestPoint.x - Math.cos(angle) * 25;
                          targetY = closestPoint.y - Math.sin(angle) * 25;
                          console.log("Blocked by wall.");
                     }
                 }
             }
        }

        // 3. Lướt đi (Tween)
        this.scene.tweens.add({
          targets: tankContainer,
          x: targetX,
          y: targetY,
          duration: 450, 
          ease: 'Cubic.out',
          onUpdate: () => {
             try {
                // Rải lửa bằng hình tròn đơn giản (Primitive) - KHÔNG DÙNG TEXTURE
                if (Math.random() > 0.2) { 
                    this.spawnFirePrimitive(tankContainer.x, tankContainer.y);
                }

                // --- XỬ LÝ GÂY DAM (100) ---
                if (this.scene.enemies) {
                     this.scene.enemies.getChildren().forEach(enemyContainer => {
                        if (enemyContainer === tankContainer) return; // Không đánh bản thân

                        // Kiểm tra khoảng cách (Va chạm)
                        // Coi xe tăng là hình tròn bán kính 20, nên khoảng cách < 40 là va chạm
                        const dist = Phaser.Math.Distance.Between(tankContainer.x, tankContainer.y, enemyContainer.x, enemyContainer.y);
                        if (dist < 45) { // 45 cho du di một chút
                             // Tìm Tank Enemy
                             let targetTank = null;
                             if (this.scene.player && this.scene.player.container === enemyContainer) {
                                 targetTank = this.scene.player;
                             } else if (this.scene.dummy && this.scene.dummy.container === enemyContainer) {
                                 targetTank = this.scene.dummy;
                             }

                             // Nếu tìm thấy và chưa bị dính đòn lần này (tránh trừ máu liên tục mỗi frame)
                             if (targetTank) {
                                  // Ta cần cơ chế để "đánh dấu" kẻ địch đã bị trúng đạn trong lần lướt này
                                  // Gắn tạm 1 biến flag vào container enemy với timestamp hoặc ID lần lướt
                                  // Ở đây dùng this.lastUsed làm ID cho lần dash hiện tại
                                  if (enemyContainer.lastHitByDash !== this.lastUsed) {
                                      targetTank.takeDamage(100);
                                      enemyContainer.lastHitByDash = this.lastUsed;
                                      
                                      // Effect khi trúng đòn
                                      if (targetTank.body.setTint) {
                                           targetTank.body.setTint(0xff0000);
                                           this.scene.time.delayedCall(100, () => targetTank.body.clearTint());
                                      }
                                      console.log("Phoenix Dash hit enemy! Damage: 100");
                                  }
                             }
                        }
                     });
                }

             } catch (e) {
                 console.error("Error in dash update:", e);
             }
          }
        });

    } catch (err) {
        console.error("PhoenixDashSkill execution error:", err);
    }
  }

  spawnFirePrimitive(x, y) {
      // Dùng Circle thay vì Image để đảm bảo an toàn tuyệt đối
      const fire = this.scene.add.circle(x, y, 10, 0xff4500, 0.6); // Tăng size và chỉnh alpha
      
      // Random vị trí một chút
      fire.x += (Math.random() - 0.5) * 10;
      fire.y += (Math.random() - 0.5) * 10;

      // Enable Physics cho lửa để check overlap
      this.scene.physics.world.enable(fire);
      fire.body.setCircle(10);
      fire.body.setOffset(0, 0); // Reset offset nếu cần

      // Logic Check Burn
      if (this.scene.enemies) {
          this.scene.physics.add.overlap(fire, this.scene.enemies, (fireObj, enemyContainer) => {
              // Tìm Tank Instance sở hữu container này
              let targetTank = null;
              if (this.scene.player && this.scene.player.container === enemyContainer) {
                  targetTank = this.scene.player;
              } else if (this.scene.dummy && this.scene.dummy.container === enemyContainer) {
                  targetTank = this.scene.dummy;
              }

              if (targetTank) {
                  const now = this.scene.time.now;
                  // Nếu chưa bị đốt hoặc đã qua 1 giây từ lần đốt trước
                  if (!targetTank.lastBurnTime || now - targetTank.lastBurnTime > 1000) {
                      targetTank.takeDamage(15);
                      targetTank.lastBurnTime = now;
                      console.log("Enemy burned by fire trail! Damage: 15");
                      
                      // Hiệu ứng cháy (nháy đỏ nhẹ)
                      if (targetTank.body.setTint) {
                           targetTank.body.setTint(0xffa500); // Cam
                           this.scene.time.delayedCall(200, () => {
                               if(targetTank.body) targetTank.body.clearTint();
                           });
                      }
                  }
              }
          });
      }

      // Logic: Cháy 2 giây rồi mất
      this.scene.tweens.add({
          targets: fire,
          alpha: 0,
          scale: 0.5,
          delay: 1500, // Đợi 1.5s
          duration: 500, // Fade trong 0.5s => Tổng 2s
          onComplete: () => {
              fire.destroy();
          }
      });
  }
}
