import Phaser from 'phaser';
import Skill from '../Skill';

export default class DashSkill extends Skill {
  constructor(scene) {
    super(scene, { cooldown: 5000 }); // Hồi chiêu 5 giây
  }

  execute(tankContainer, pointer) {
    // Tính hướng từ xe tăng đến con trỏ chuột
    const tankX = tankContainer.x;
    const tankY = tankContainer.y;
    const mouseX = pointer.worldX;
    const mouseY = pointer.worldY;

    // Tạo vector hướng
    const direction = new Phaser.Math.Vector2(mouseX - tankX, mouseY - tankY);
    direction.normalize();

    // Khoảng cách dash (3cm ≈ 150 pixels)
    const dashDistance = 150;
    
    // Tính vị trí đích
    const targetX = tankX + (direction.x * dashDistance);
    const targetY = tankY + (direction.y * dashDistance);

    // Tween để di chuyển mượt mà
    this.scene.tweens.add({
      targets: tankContainer,
      x: targetX,
      y: targetY,
      duration: 200, // 0.2 giây
      ease: 'Power2',
      onUpdate: () => {
        // Tạo vệt khói trong quá trình dash
        if (Math.random() > 0.7) {
          this.createDashTrail(tankContainer);
        }
      }
    });
  }

  createDashTrail(tankContainer) {
    const trail = this.scene.add.circle(
      tankContainer.x,
      tankContainer.y,
      20,
      0xffffff,
      0.5
    );
    
    // Làm mờ dần
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => trail.destroy()
    });
  }
}
