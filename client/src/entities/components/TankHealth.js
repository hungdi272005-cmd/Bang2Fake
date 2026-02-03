import Phaser from 'phaser';

export default class TankHealth {
  constructor(scene, parentContainer, maxHealth = 1000, isEnemy = false) {
    this.scene = scene;
    this.parentContainer = parentContainer;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.isEnemy = isEnemy;

    // Tạo một container riêng cho thanh máu,
    // gắn vào container của xe tăng cha để nó di chuyển cùng.
    // Đặt nó hơi cao hơn thân xe.
    this.barContainer = scene.add.container(0, -35);
    this.parentContainer.add(this.barContainer);

    this.barWidth = 60;
    this.barHeight = 8;

    this.draw();
  }

  draw() {
    // Xóa các hình vẽ trước đó
    this.barContainer.removeAll(true);

    // 1. Nền (Đen/Xám đậm)
    const bg = this.scene.add.rectangle(0, 0, this.barWidth, this.barHeight, 0x000000);
    bg.setOrigin(0.5, 0.5);
    this.barContainer.add(bg);

    // 2. Thanh máu (Xanh -> Đỏ dựa trên HP?)
    // Tính chiều rộng dựa trên phần trăm máu
    const healthPercent = Math.max(0, this.currentHealth / this.maxHealth);
    const currentWidth = this.barWidth * healthPercent;

    // Vấn đề căn chỉnh trung tâm: 
    // Chiều rộng giảm, nhưng nếu origin là 0.5, nó co lại từ hai phía. 
    // Chúng ta muốn nó co từ phải sang trái (neo trái).
    // Vậy hãy điều chỉnh origin hoặc vị trí.
    
    // Cách tiếp cận dễ hơn: Hình chữ nhật căn trái bên trong container
    const startX = -this.barWidth / 2;
    
    // Nền (Toàn chiều rộng)
    // Vẽ lại nền với origin 0 để căn chỉnh dễ hơn
    const bgXY = this.scene.add.rectangle(startX, -this.barHeight/2, this.barWidth, this.barHeight, 0x222222);
    bgXY.setOrigin(0, 0);
    // Xóa BG cũ trước để tránh trùng lặp nếu chưa xác minh logic trên
    this.barContainer.removeAll(true);
    this.barContainer.add(bgXY);

    // Thanh máu
    const color = this.getHealthColor(healthPercent);
    const healthBar = this.scene.add.rectangle(startX, -this.barHeight/2, currentWidth, this.barHeight, color);
    healthBar.setOrigin(0, 0);
    this.barContainer.add(healthBar);
    
    // Viền (Tùy chọn)
    const border = this.scene.add.graphics();
    border.lineStyle(2, 0x000000);
    border.strokeRect(startX, -this.barHeight/2, this.barWidth, this.barHeight);
    this.barContainer.add(border);
  }

  getHealthColor(percent) {
    if (this.isEnemy) return 0xff0000; // Địch luôn màu Đỏ
    return 0x00ff00; // Phe mình (Player + Ally) luôn màu Xanh lá
  }

  takeDamage(amount) {
    this.currentHealth -= amount;
    if (this.currentHealth < 0) this.currentHealth = 0;
    this.draw();
    
    return this.currentHealth; // Trả về lượng máu còn lại
  }

  heal(amount) {
    this.currentHealth += amount;
    if (this.currentHealth > this.maxHealth) this.currentHealth = this.maxHealth;
    this.draw();
  }
}
