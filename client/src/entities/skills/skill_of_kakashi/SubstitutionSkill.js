import Skill from '../Skill';
import Phaser from 'phaser';

export default class SubstitutionSkill extends Skill {
  constructor(scene) {
    super(scene, {
      name: 'Substitution Jutsu',
      description: 'Tạo phân thân, tàng hình và tăng tốc chạy',
      cooldown: 10000, // Hồi chiêu 10 giây
      key: 'e'
    });
    
    this.duration = 2000; // Thời gian hiệu ứng: 2 giây
    this.speedBonus = 0.3; // Tăng 30% tốc độ
  }

  execute(tankContainer) {
    const tankInstance = tankContainer.tankInstance;
    
    if (!tankInstance) {
        console.error("SubstitutionSkill: Tank Instance not found!");
        return;
    }

    // 1. Tạo Phân Thân (Clone) tại vị trí hiện tại
    // Clone là một sprite tĩnh giống hệt tank hiện tại
    const clone = this.scene.add.sprite(tankContainer.x, tankContainer.y, 'tank_kakashi');
    clone.setRotation(tankContainer.tankInstance.body.rotation); // Copy góc quay của body (không phải container)
    clone.setDisplaySize(90, 90); // Kích thước giống tank thật
    clone.setDepth(tankContainer.depth - 1); // Nằm dưới tank thật một chút
    
    // Hiệu ứng "Bùm" khói khi tạo phân thân (Optional)
    this.createSmokeEffect(tankContainer.x, tankContainer.y);

    // 1b. Tạo thanh máu giả cho phân thân (giống hệt thanh máu hiện tại)
    if (tankInstance.health) {
        const hpPercent = tankInstance.health.currentHealth / tankInstance.health.maxHealth;
        this.drawFakeHealthBar(this.scene, clone.x, clone.y - 35, hpPercent, clone);
    }

    // 2. Tàng hình (Giảm Alpha)
    // Lưu lại alpha gốc để restore
    const originalAlpha = tankContainer.alpha;
    tankContainer.setAlpha(0.2); // Mờ đi (gần như tàng hình)
    
    // 3. Tăng tốc độ chạy
    // Lấy movement component
    const movement = tankInstance.movement;
    if (movement) {
        const originalSpeed = movement.speed;
        const boostedSpeed = originalSpeed * (1 + this.speedBonus);
        movement.setSpeed(boostedSpeed);
        
        console.log(`Thuật Ẩn Thân: Speed ${originalSpeed} -> ${boostedSpeed}`);

        // 4. Cường hóa đòn đánh thường tiếp theo (X2 sát thương)
        tankInstance.nextAttackDamageBonus = true;
        // Hiệu ứng visual (nháy màu cam để khác màu xanh của Chidori)
        if (tankContainer.body && tankContainer.body.setTint) {
             tankContainer.body.setTint(0xffa500); // Cam
             this.scene.time.delayedCall(500, () => {
                 if (tankContainer && tankContainer.body) {
                     tankContainer.body.clearTint();
                 }
             });
        }

        // 5. Hẹn giờ kết thúc hiệu ứng (2 giây)
        this.scene.time.delayedCall(this.duration, () => {
            // Xóa phân thân và thanh máu giả
            this.createSmokeEffect(clone.x, clone.y);
            if (clone.fakeHealthBar) {
                clone.fakeHealthBar.destroy();
            }
            clone.destroy();
            
            // Hồi phục Alpha
            if (tankContainer.active) {
                tankContainer.setAlpha(originalAlpha);
            }
            
            // Hồi phục tốc độ
            if (movement) {
                movement.resetSpeed(); // Reset về originalSpeed đã lưu trong movement
            }
            
            console.log("Thuật Ẩn Thân kết thúc.");
        });
    }
  }

  createSmokeEffect(x, y) {
      // Giả lập hiệu ứng khói bằng particles hoặc graphics đơn giản
      // Ở đây dùng tweens circle cho nhanh gọn
      const smoke = this.scene.add.circle(x, y, 10, 0x888888, 0.8);
      this.scene.tweens.add({
          targets: smoke,
          scale: 3,
          alpha: 0,
          duration: 500,
          onComplete: () => smoke.destroy()
      });
  }

  drawFakeHealthBar(scene, x, y, percent, parentSprite) {
      // Vẽ thanh máu giả trực tiếp lên scene (không cần container phức tạp vì nó tĩnh)
      // Tuy nhiên để dễ quản lý khi xóa clone, ta nên group lại hoặc đơn giản là lưu ref
      
      const width = 60;
      const height = 8;
      const startX = x - width / 2;
      const startY = y - height / 2;
      
      // Container tạm để chứa thanh máu, giúp dễ xóa
      const barGroup = scene.add.container(0, 0);
      parentSprite.fakeHealthBar = barGroup; // Gán vào sprite để tiện destroy

      // Nền
      const bg = scene.add.rectangle(startX, startY, width, height, 0x222222).setOrigin(0, 0);
      barGroup.add(bg);

      // Thanh máu
      const currentWidth = width * percent;
      const color = 0x00ff00; // Màu xanh (giả định là đồng minh)
      const bar = scene.add.rectangle(startX, startY, currentWidth, height, color).setOrigin(0, 0);
      barGroup.add(bar);

      // Viền
      const border = scene.add.graphics();
      border.lineStyle(2, 0x000000);
      border.strokeRect(startX, startY, width, height);
      barGroup.add(border);
      
      // Quan trọng: Set depth để thanh máu nằm trên clone
      barGroup.setDepth(parentSprite.depth + 1);
  }
}
