import Phaser from 'phaser';
import TankMovement from './components/TankMovement';
import TankWeapon from './components/TankWeapon';
import TankAbilities from './components/TankAbilities';
import TankHealth from './components/TankHealth'; // Import Health Component
import DashSkill from './skills/utility/DashSkill'; // Kỹ năng Q mặc định

export default class Tank {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.team = config.team || 0; // Thêm team (0: Neutral, 1: Team 1, 2: Team 2...)
    
    // Chỉ số mặc định nếu không được cung cấp
    const stats = config.stats || { speed: 200, health: 1000 }; // Thêm máu mặc định
  
  // Chỉ số từ ngọc phù trợ
  this.defense = stats.defense || 0;       // % giảm sát thương nhận
  this.vampirism = stats.vampirism || 0;   // % hút máu khi gây sát thương
    
    // Tạo container để chứa thân xe
    this.container = scene.add.container(x, y);
    this.container.setSize(40, 40);
    this.container.tankInstance = this; // Link Tank instance to container
    
    // Bật physics cho container
    scene.physics.world.enable(this.container);
    this.container.body.setCollideWorldBounds(true);
    this.container.body.setDrag(100);
    // this.container.body.setAngularDrag(100); 

    // Thân xe (Giao diện) - thêm vào container
    const color = config.color || 0x00ff00;
    
    // Kiểm tra và sử dụng sprite nếu đã load
    // Kiểm tra và sử dụng sprite nếu đã load
    // Kiểm tra và sử dụng sprite nếu đã load
    let textureName = null;
    
    // Ưu tiên 1: Lấy theo tên Tank (VD: 'Phoenix' -> 'tank_phoenix')
    if (config.name) {
        const specificTexture = 'tank_' + config.name.toLowerCase();
        if (scene.textures.exists(specificTexture)) {
            textureName = specificTexture;
        }
    }

    // Ưu tiên 2 (Fallback cũ): Check lần lượt
    if (!textureName) {
        if (scene.textures.exists('tank_gundam')) {
            textureName = 'tank_gundam';
        } else if (scene.textures.exists('tank_phoenix')) {
            textureName = 'tank_phoenix';
        }
    }

    if (textureName) {
        this.body = scene.add.sprite(0, 0, textureName);
        
        // Scale hình ảnh cho vừa với hitbox 40x40 (hoặc lớn hơn chút để đẹp)
        // Kích thước gốc của ảnh AI thường lớn (1024x1024), nên scale nhỏ lại
        this.body.setDisplaySize(90, 90); 

        // Thêm hiệu ứng Glow (Phát sáng) để tạo cảm giác năng lượng
        if (this.scene.renderer.type === Phaser.WEBGL && this.body.postFX) {
            this.body.postFX.addBloom(0xffffff, 1, 1, 0.9, 1.2);
        }

        // Thêm hiệu ứng "Thở" (Breathing) - Co giãn nhẹ
        this.scene.tweens.add({
            targets: this.body,
            scaleX: this.body.scaleX * 1.05,
            scaleY: this.body.scaleY * 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

    } else {
        // Fallback dùng hình chữ nhật
        this.body = scene.add.rectangle(0, 0, 40, 40, color);
    }
    this.container.add(this.body);

    // Chuẩn bị cấu hình vũ khí
    const weaponConfig = config.weapon || {};

    // Khởi tạo các Component
    this.movement = new TankMovement(scene, this.container, stats.speed);
    this.weapon = new TankWeapon(scene, this.container, x, y, weaponConfig);
    
    // Khởi tạo Máu
    const isEnemy = this.team !== 1; // Team 1 là phe ta, còn lại là địch
    this.health = new TankHealth(scene, this.container, stats.health, isEnemy);

    // Chuẩn bị cấu hình kỹ năng
    // Kết hợp các kỹ năng được truyền vào với kỹ năng Q mặc định nếu không có
    const providedSkills = config.skills || {};
    const finalSkillConfig = {
      q: providedSkills.q || DashSkill,
      e: providedSkills.e,
      r: providedSkills.r,
      space: providedSkills.space
    };

    this.abilities = new TankAbilities(scene, this.container, finalSkillConfig);
  }

  // Xử lý sát thương
  takeDamage(amount) {
    // Áp dụng giảm sát thương từ ngọc Phòng Thủ
    const reducedAmount = Math.round(amount * (1 - (this.defense || 0) / 100));
    const remaining = this.health.takeDamage(reducedAmount);
    
    // Hiển thị số dame
    this.showDamagePopup(reducedAmount);

    if (remaining <= 0) {
      // Logic chết (tương lai)
      console.log("Tank Died");
      // this.container.destroy(); // Hủy đơn giản hoặc sự kiện cho hiện tại
    }
  }

  showDamagePopup(amount) {
      // Tạo text sát thương
      const damageText = this.scene.add.text(this.container.x, this.container.y - 30, `-${amount}`, {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ff0000',
          stroke: '#ffffff',
          strokeThickness: 2,
          fontStyle: 'bold'
      }).setOrigin(0.5);

      // Animation bay lên và mờ dần
      this.scene.tweens.add({
          targets: damageText,
          y: damageText.y - 50,
          alpha: 0,
          duration: 800,
          ease: 'Power1',
          onComplete: () => {
              damageText.destroy();
          }
      });
  }

  // Áp dụng hiệu ứng Câm lặng
  applySilence(duration) {
    if (this.container.isSilenced) return; // Đang bị silence thì thôi (hoặc reset time)

    this.container.isSilenced = true;
    console.log(`${this.container} is Silenced!`);
    
    // Hiệu ứng visual (VD: Icon câm lặng trên đầu)
    const silenceText = this.scene.add.text(0, -50, 'SILENCED!', {
        fontSize: '14px',
        color: '#ff00ff',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(silenceText);

    this.scene.time.delayedCall(duration, () => {
        if (this.container) {
            this.container.isSilenced = false;
            silenceText.destroy();
        }
    });
  }

  // Áp dụng làm chậm (Slow)
  applySlow(amount, duration) {
      // Chỉ số speed tối thiểu
      const minSpeed = 50;
      
      // Tính tốc độ mới
      let newSpeed = this.movement.originalSpeed - amount;
      if (newSpeed < minSpeed) newSpeed = minSpeed;

      // Áp dụng tốc độ
      this.movement.setSpeed(newSpeed);

      // Reset timer nếu đã có (làm mới thời gian hiệu ứng)
      if (this.slowTimer) {
          this.slowTimer.remove();
      }

      // Hẹn giờ trả lại tốc độ cũ
      this.slowTimer = this.scene.time.delayedCall(duration, () => {
          this.movement.resetSpeed();
          this.slowTimer = null;
      });
  }

  // Áp dụng tăng tốc (Speed Boost)
  applySpeedBoost(multiplier, duration) {
      const newSpeed = this.movement.originalSpeed * multiplier;
      this.movement.setSpeed(newSpeed);

      if (this.speedBoostTimer) {
          this.speedBoostTimer.remove();
      }

      this.speedBoostTimer = this.scene.time.delayedCall(duration, () => {
          this.movement.resetSpeed();
          this.speedBoostTimer = null;
      });
  }

  // Áp dụng Choáng (Stun)
  applyStun(duration) {
      // Luôn dừng vận tốc ngay lập tức khi trúng hiệu ứng choáng 
      // (kể cả khi đã bị choáng trước đó để tránh bị trôi/đẩy)
      if (this.container.body) {
          this.container.body.setVelocity(0, 0);
      }

      if (this.container.isStunned) return; // Nếu đã hiện text "STUNNED" rồi thì thôi

      this.container.isStunned = true;
      console.log(`${this.container} is Stunned!`);

      // Hiệu ứng Visual (Vòng xoáy trên đầu?)
      const stunText = this.scene.add.text(0, -60, 'STUNNED!', {
          fontSize: '16px',
          color: '#ffff00',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
      }).setOrigin(0.5);
      this.container.add(stunText);

      this.scene.time.delayedCall(duration, () => {
          if (this.container) {
              this.container.isStunned = false;
              if (stunText.active) stunText.destroy();
          }
      });
  }

  update(cursors, wasd) {
    // Cập nhật di chuyển
    this.movement.update(cursors, wasd);
    
    // Cập nhật vũ khí (bám theo vị trí)
    this.weapon.update();

    // Cập nhật kỹ năng (vị trí khiên, v.v.)
    this.abilities.update();

    // Xoay thân xe theo hướng di chuyển
    if (this.container.body.speed > 0) {
        // Lấy góc từ vận tốc (radians) và chuyển sang độ
        // Phaser: 0 = Right, 90 = Down, 180 = Left, -90 = Up
        const angle = Phaser.Math.RadToDeg(this.container.body.velocity.angle());
        this.body.setAngle(angle);
    }
  }

  // Các hàm bao để Scene gọi
  aim(pointer) {
    this.weapon.aim(pointer);
  }

  shoot() {
    this.weapon.shoot();
  }

  // Các hàm bao kỹ năng
  useAbilityQ(pointer) {
    this.abilities.useDash(pointer);
  }

  useAbilityE(pointer) {
    this.abilities.useShield(pointer, this.movement, this.weapon);
  }

  useAbilityR(pointer) {
    this.abilities.useRocketBarrage(pointer);
  }

  useAbilitySpace(pointer) {
    this.abilities.useSpeedBoost(this.movement, pointer);
  }
}
