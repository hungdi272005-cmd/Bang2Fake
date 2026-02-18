import Phaser from 'phaser';

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.onShootCallback = null;
    this.onSkillCallback = null;
    this.setupInput();
  }

  setupInput() {
    // Điều khiển di chuyển
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Các phím kỹ năng
    this.abilityKeys = this.scene.input.keyboard.addKeys({
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
  }

  handleInput(player, dummy, pointer) {
    // Cập nhật di chuyển player
    if (player) {
         player.update(null, this.wasd);
    }
    
    // Dummy giờ điều khiển bởi network, không dùng keyboard
    if (dummy) {
         // Không update movement, chỉ giữ weapon/abilities update
    }

    // Xử lý bắn (Giữ chuột trái để bắn liên tục)
    if (player && pointer.isDown) {
      player.shoot();
      // Gửi event bắn qua network
      if (this.onShootCallback) {
        this.onShootCallback(player);
      }
    }

    // Cập nhật hướng ngắm theo chuột liên tục
    if (player) {
        player.aim(pointer);
    }

    // Xử lý kỹ năng (dùng JustDown để tránh spam)
    if (player) {
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.q)) {
          player.useAbilityQ(pointer);
          if (this.onSkillCallback) this.onSkillCallback('q', player);
        }
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.e)) {
          player.useAbilityE(pointer);
          if (this.onSkillCallback) this.onSkillCallback('e', player);
        }
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.r)) {
          player.useAbilityR(pointer);
          if (this.onSkillCallback) this.onSkillCallback('r', player);
        }
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.space)) {
          player.useAbilitySpace(pointer);
          if (this.onSkillCallback) this.onSkillCallback('space', player);
        }
    }
  }
}
