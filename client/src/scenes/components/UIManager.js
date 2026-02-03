export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.abilityUI = [];
  }

  createAbilityUI() {
    this.abilityUI = []; // Reset array
    
    // Sử dụng kích thước màn hình hiện tại
    const { width, height } = this.scene.scale;
    
    // Vị trí giữa đáy màn hình
    const centerX = width / 2;
    const bottomY = height - 40;
    const spacing = 70;
    const startX = centerX - (spacing * 1.5); // Để căn giữa 4 ô

    // Thứ tự: R, E, Space, Q
    const abilities = [
      { key: 'r', label: 'R', color: 0xff0000 },
      { key: 'e', label: 'E', color: 0x00ffff },
      { key: 'space', label: 'Space', color: 0xffff00 },
      { key: 'q', label: 'Q', color: 0xffffff }
    ];

    abilities.forEach((ability, index) => {
      const x = startX + (index * spacing);
      
      // Nền ô skill
      const bg = this.scene.add.rectangle(x, bottomY, 60, 60, 0x000000, 0.7);
      bg.setStrokeStyle(2, ability.color);
      bg.setScrollFactor(0);

      // Graphics để vẽ vòng tròn cooldown (kiểu kim đồng hồ)
      const cooldownCircle = this.scene.add.graphics();
      cooldownCircle.setScrollFactor(0);

      // Graphics để vẽ viền combo (cho chiêu E Phoenix)
      const comboBorder = this.scene.add.graphics();
      comboBorder.setScrollFactor(0);

      // Label phím
      const label = this.scene.add.text(x, bottomY - 20, ability.label, {
        font: 'bold 14px Arial',
        fill: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0);

      // Text hiển thị cooldown
      const cooldownText = this.scene.add.text(x, bottomY + 10, 'Ready', {
        font: 'bold 12px Arial',
        fill: '#00ff00'
      }).setOrigin(0.5).setScrollFactor(0);

      this.abilityUI.push({
        key: ability.key,
        x: x, // Lưu offset ban đầu hoặc index để tính lại
        index: index, // Lưu index để dễ resize
        y: bottomY,
        bg,
        label,
        cooldownText,
        cooldownCircle,
        comboBorder,
        color: ability.color
      });
    });
  }

  resize(width, height) {
      if (!this.abilityUI) return;

      const centerX = width / 2;
      const bottomY = height - 40;
      const spacing = 70;
      const startX = centerX - (spacing * 1.5);
      
      this.abilityUI.forEach((ui) => {
          const newX = startX + (ui.index * spacing);
          
          ui.x = newX;
          ui.y = bottomY;
          
          ui.bg.setPosition(newX, bottomY);
          // Label text
          ui.label.setPosition(newX, bottomY - 20);
          // Cooldown text
          ui.cooldownText.setPosition(newX, bottomY + 10);
          
          ui.cooldownCircle.clear(); 
          ui.comboBorder.clear();
      });
  }

  updateAbilityUI(player) {
    if (!this.abilityUI || !player) return;

    this.abilityUI.forEach(ui => {
      const remaining = player.abilities.getCooldownRemaining(ui.key);
      const skill = player.abilities.skills[ui.key];
      const totalDuration = skill ? skill.cooldown : 1;
      
      // Xóa graphics cũ
      ui.cooldownCircle.clear();
      ui.comboBorder.clear();

      // --- LOGIC COMBO TIMER (VIỀN CHẠY) ---
      let isComboActive = false;
      if (skill && typeof skill.getComboProgress === 'function') {
          const comboProgress = skill.getComboProgress(); // 0 -> 1 hoặc 1 -> 0
          if (comboProgress !== null && comboProgress > 0) {
              isComboActive = true;
              
              const size = 60;
              const halfSize = size / 2;
              const perimeter = size * 4;
              const drawLength = perimeter * comboProgress;
              
              ui.comboBorder.lineStyle(4, 0xffff00, 1); // Màu vàng
              ui.comboBorder.beginPath();
              
              // Bắt đầu từ Top-Left
              // Vẽ ngược chiều kim đồng hồ (CCW) để khi co lại (1->0) đầu mút sẽ chạy theo chiều kim đồng hồ (CW)
              // Path: TL -> BL -> BR -> TR -> TL
              const tl = { x: ui.x - halfSize, y: ui.y - halfSize };
              const bl = { x: ui.x - halfSize, y: ui.y + halfSize };
              const br = { x: ui.x + halfSize, y: ui.y + halfSize };
              const tr = { x: ui.x + halfSize, y: ui.y - halfSize };
              
              ui.comboBorder.moveTo(tl.x, tl.y);
              
              let remainingDraw = drawLength;
              
              // 1. Left edge (TL -> BL) (Down)
              if (remainingDraw > 0) {
                  const draw = Math.min(remainingDraw, size);
                  ui.comboBorder.lineTo(tl.x, tl.y + draw);
                  remainingDraw -= draw;
              }
              // 2. Bottom edge (BL -> BR) (Right)
              if (remainingDraw > 0) {
                  const draw = Math.min(remainingDraw, size);
                  ui.comboBorder.lineTo(bl.x + draw, bl.y);
                  remainingDraw -= draw;
              }
              // 3. Right edge (BR -> TR) (Up)
              if (remainingDraw > 0) {
                  const draw = Math.min(remainingDraw, size);
                  ui.comboBorder.lineTo(br.x, br.y - draw);
                  remainingDraw -= draw;
              }
              // 4. Top edge (TR -> TL) (Left)
              if (remainingDraw > 0) {
                  const draw = Math.min(remainingDraw, size);
                  ui.comboBorder.lineTo(tr.x - draw, tr.y);
                  remainingDraw -= draw;
              }
              
              ui.comboBorder.strokePath();

              // Update Text
              ui.cooldownText.setText('E2');
              ui.cooldownText.setColor('#ffff00');
          }
      }

      // --- LOGIC COOLDOWN THƯỜNG ---
      if (!isComboActive) {
          if (remaining > 0) {
            // Còn cooldown - vẽ vòng tròn đếm ngược
            const seconds = Math.ceil(remaining / 1000);
            ui.cooldownText.setText(seconds + 's');
            ui.cooldownText.setColor('#ff0000');
            ui.bg.setAlpha(0.5);

            // Tính phần trăm còn lại (0 = hết cooldown, 1 = mới bắt đầu)
            const percentage = remaining / totalDuration;

            // Vẽ vòng tròn overlay (quay ngược chiều kim đồng hồ)
            // Bắt đầu từ -90 độ (12 giờ) và quay ngược chiều kim đồng hồ
            const startAngle = Phaser.Math.DegToRad(-90);
            const endAngle = startAngle - (Phaser.Math.DegToRad(360) * percentage);

            ui.cooldownCircle.fillStyle(ui.color, 0.4);
            ui.cooldownCircle.slice(ui.x, ui.y, 28, startAngle, endAngle, true);
            ui.cooldownCircle.fillPath();

            // Vẽ viền vòng tròn
            ui.cooldownCircle.lineStyle(2, ui.color, 0.8);
            ui.cooldownCircle.strokeCircle(ui.x, ui.y, 28);
          } else {
            // Sẵn sàng
            ui.cooldownText.setText('Ready');
            ui.cooldownText.setColor('#00ff00');
            ui.bg.setAlpha(0.9);
          }
      }
    });
  }
}
