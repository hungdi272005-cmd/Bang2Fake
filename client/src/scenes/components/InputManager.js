import Phaser from 'phaser';

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
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
    // Cập nhật di chuyển
    if (player) {
         player.update(null, this.wasd);
    }
    
    if (dummy) {
         dummy.update(this.cursors, null);
    }

    // Xử lý bắn (Giữ chuột trái để bắn liên tục)
    if (player && pointer.isDown) {
      player.shoot();
    }

    // Cập nhật hướng ngắm theo chuột liên tục
    if (player) {
        player.aim(pointer);
    }

    // Xử lý kỹ năng (dùng JustDown để tránh spam)
    if (player) {
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.q)) {
          player.useAbilityQ(pointer);
        }
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.e)) {
          player.useAbilityE(pointer);
        }
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.r)) {
          player.useAbilityR(pointer);
        }
        if (Phaser.Input.Keyboard.JustDown(this.abilityKeys.space)) {
          player.useAbilitySpace(pointer);
        }
    }
  }
}
