import Phaser from 'phaser';
import Skill from '../Skill';

// Chiêu R: Siêu Tân Tinh (Supernova) - Nổ diện rộng
export default class PhoenixSupernovaSkill extends Skill {
  constructor(scene) {
    super(scene, { 
        cooldown: 5000, // Hồi chiêu 5 giây
        key: 'r' 
    }); 
  }

  execute(tankContainer) {
    // 1. Hình ảnh: Vòng nổ lớn
    const radius = 150;
    
    // Tạo graphic/sprite vụ nổ
    const nova = this.scene.add.circle(tankContainer.x, tankContainer.y, radius, 0xff4500, 0.8);
    nova.setScale(0);
    nova.setBlendMode(Phaser.BlendModes.ADD);

    // Lõi bên trong
    const core = this.scene.add.circle(tankContainer.x, tankContainer.y, radius * 0.5, 0xffff00, 1);
    core.setScale(0);
    core.setBlendMode(Phaser.BlendModes.ADD);

    // 2. Animation: Mở rộng rồi mờ dần
    this.scene.tweens.add({
        targets: [nova, core],
        scale: 1,
        duration: 400,
        ease: 'Cubic.out',
        onComplete: () => {
            // Mờ dần
            this.scene.tweens.add({
                targets: [nova, core],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    nova.destroy();
                    core.destroy();
                }
            });
        }
    });

    // 3. Rung màn hình & Chớp sáng (Đã bỏ theo yêu cầu)
    // this.scene.cameras.main.shake(300, 0.02);
    // this.scene.cameras.main.flash(200, 255, 69, 0);

    // 4. Logic Knockback & Silence
    // Tìm kẻ địch trong bán kính nổ
    if (this.scene.enemies) {
        this.scene.enemies.getChildren().forEach(enemyContainer => {
            if (enemyContainer === tankContainer) return; // Không gây sát thương cho bản thân

            const distance = Phaser.Math.Distance.Between(
                tankContainer.x, tankContainer.y,
                enemyContainer.x, enemyContainer.y
            );

            if (distance <= radius) {
                // Tìm Tank Instance sở hữu container này
                // Quy ước: scene.dummy, scene.player, hoặc nếu trong group enemies thì cần cách truy cập ngược lại Tank
                // Tạm thời check thủ công với scene.dummy và scene.player
                
                let targetTank = null;
                if (this.scene.player && this.scene.player.container === enemyContainer) {
                    targetTank = this.scene.player;
                } else if (this.scene.dummy && this.scene.dummy.container === enemyContainer) {
                    targetTank = this.scene.dummy;
                }

                if (targetTank) {
                    // Gây sát thương (nếu cần, nhưng yêu cầu hiện tại chỉ nói về silence)
                    targetTank.takeDamage(150); // VD: 150 damage cho chiêu cuối

                    // Áp dụng Câm Lặng 1.5s
                    targetTank.applySilence(1500);
                }
            }
        });
    }
    
    // Tùy chọn: Sinh hạt
    this.createExplosionParticles(tankContainer.x, tankContainer.y, radius);
  }

  createExplosionParticles(x, y, radius) {
      if (!this.scene.textures.exists('fire_particle')) {
          // Dự phòng nếu chưa được tạo bởi kỹ năng khác
          const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
          graphics.fillStyle(0xff4500, 1);
          graphics.fillCircle(4, 4, 4);
          graphics.generateTexture('fire_particle', 8, 8);
      }

      const emitter = this.scene.add.particles(x, y, 'fire_particle', {
          speed: { min: 200, max: 400 },
          angle: { min: 0, max: 360 },
          scale: { start: 1, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 800,
          blendMode: 'ADD',
          // Phát ra từ vòng tròn?
          emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, radius * 0.5) } 
      });
      
      emitter.explode(40);
      this.scene.time.delayedCall(1000, () => emitter.destroy());
  }
}
