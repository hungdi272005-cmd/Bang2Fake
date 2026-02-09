import Skill from '../Skill';
import Phaser from 'phaser';

export default class KamuiSkill extends Skill {
  constructor(scene) {
    super(scene, {
      name: 'Kamui',
      description: 'Không gian thần uy: Giam giữ và gây sát thương',
      cooldown: 12000, 
      key: 'space'
    });
    
    this.duration = 2500; // 2.5 giây
    this.radius = 150;    // Bán kính 100
    this.damage = 250;    // Sát thương khi kết thúc
  }

  execute(tankContainer) {
    const x = tankContainer.x;
    const y = tankContainer.y;

    // 1. Hiệu ứng Visual: Vòng tròn Kamui (Xoáy không gian)
    // Tạo graphics xoáy
    const kamuiCircle = this.scene.add.graphics();
    kamuiCircle.setDepth(5); // Nằm dưới tank một chút hoặc trên nền
    
    // Animation xoáy
    this.scene.tweens.addCounter({
        from: 0,
        to: 360,
        duration: 1000,
        repeat: -1,
        onUpdate: (tween) => {
            if (!kamuiCircle.active) return;
            
            kamuiCircle.clear();
            
            // Vẽ các vòng xoáy
            const angle = tween.getValue();
            kamuiCircle.lineStyle(3, 0x800080, 1); // Tím
            
            // Vẽ xoáy ốc đơn giản
            for (let i = 0; i < 5; i++) {
                const startAngle = Phaser.Math.DegToRad(angle + i * 72);
                const endAngle = startAngle + Math.PI;
                
                kamuiCircle.beginPath();
                kamuiCircle.arc(x, y, this.radius - (i * 10), startAngle, endAngle);
                kamuiCircle.strokePath();
            }
            
            // Vẽ viền
            kamuiCircle.lineStyle(2, 0x000000, 0.5);
            kamuiCircle.strokeCircle(x, y, this.radius);
            
            // Fill mờ
            kamuiCircle.fillStyle(0x4b0082, 0.2); // Indigo
            kamuiCircle.fillCircle(x, y, this.radius);
        }
    });

    // 1b. Cường hóa đòn đánh thường tiếp theo (X2 sát thương)
    const tankInstance = tankContainer.tankInstance;
    if (tankInstance) {
        tankInstance.nextAttackDamageBonus = true;
        // Hiệu ứng visual (nháy màu tím cho Kamui)
        if (tankContainer.body && tankContainer.body.setTint) {
             tankContainer.body.setTint(0xff00ff); // Màu tím/hồng
             this.scene.time.delayedCall(500, () => {
                 if (tankContainer && tankContainer.body) {
                     tankContainer.body.clearTint();
                 }
             });
        }
    }

    // 2. Logic Giam Giữ (Liên tục check vùng trong 2.5s)
    const trappedEnemies = new Set();
    const startTime = this.scene.time.now;

    const checkZone = () => {
        const elapsed = this.scene.time.now - startTime;
        if (elapsed >= this.duration) {
            this.scene.events.off('update', checkZone);
            this.onKamuiEnd(trappedEnemies, kamuiCircle);
            return;
        }

        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemyContainer => {
                if (enemyContainer === tankContainer) return;
                
                const dist = Phaser.Math.Distance.Between(x, y, enemyContainer.x, enemyContainer.y);
                
                if (dist <= this.radius) {
                    const enemyTank = enemyContainer.tankInstance;
                    if (enemyTank) {
                        // Tính thời gian choáng còn lại
                        const remainingTime = this.duration - elapsed;
                        
                        // Áp dụng choáng nếu chưa bị (hoặc cập nhật thời gian)
                        if (enemyTank.applyStun && remainingTime > 0) {
                            enemyTank.applyStun(remainingTime);
                            trappedEnemies.add(enemyTank);
                        }
                    }
                }
            });
        }
    };

    // Đăng ký update loop
    this.scene.events.on('update', checkZone);
  }

  onKamuiEnd(trappedEnemies, kamuiCircle) {
    // Gây sát thương cho những kẻ đã bị bắt
    trappedEnemies.forEach(enemy => {
        if (enemy && enemy.takeDamage) {
            enemy.takeDamage(this.damage);
        }
    });
    
    // Xóa visual
    if (kamuiCircle.active) {
        kamuiCircle.destroy();
    }
    
    console.log("Kamui finished. Damage dealt to all caught enemies.");
  }
}
