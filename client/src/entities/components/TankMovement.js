export default class TankMovement {
  constructor(scene, container, speed = 200) {
    this.scene = scene;
    this.container = container;
    this.speed = speed;
    this.originalSpeed = speed;
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
  }

  resetSpeed() {
    this.speed = this.originalSpeed;
  }

  update(cursors, wasd) {
    const body = this.container.body;

    // Reset vận tốc
    body.setVelocity(0);

    // Kiểm tra trạng thái bị choáng / Choáng váng
    if (this.container.isStunned) {
        return; 
    }

    // Helper check
    const isDown = (inputObj, key) => inputObj && inputObj[key] && inputObj[key].isDown;

    // Di chuyển (WASD hoặc Cursors)
    if (isDown(cursors, 'left') || isDown(wasd, 'left')) {
      body.setVelocityX(-this.speed);
    } else if (isDown(cursors, 'right') || isDown(wasd, 'right')) {
      body.setVelocityX(this.speed);
    }

    if (isDown(cursors, 'up') || isDown(wasd, 'up')) {
      body.setVelocityY(-this.speed);
    } else if (isDown(cursors, 'down') || isDown(wasd, 'down')) {
      body.setVelocityY(this.speed);
    }
    
    // Chuẩn hóa và scale vận tốc để đi chéo không bị nhanh hơn
    body.velocity.normalize().scale(this.speed);

    // Xoay thân xe theo hướng di chuyển (tuỳ chọn)
    if (body.velocity.length() > 0) {
        // Logic xoay thân xe có thể thêm sau
    }
  }
}
