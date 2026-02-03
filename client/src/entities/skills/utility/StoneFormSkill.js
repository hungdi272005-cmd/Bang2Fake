import Skill from '../Skill';

export default class StoneFormSkill extends Skill {
  constructor(scene) {
    super(scene, { cooldown: 12000 }); // Hồi chiêu 12 giây
  }

  execute(tankContainer) {
    // 1. Hiệu ứng hình ảnh: Chuyển sang màu xám (Dáng vẻ đá)
    const tankBody = tankContainer.getAt(0); // Thân xe là phần tử con đầu tiên (Hình chữ nhật)

    let fx; // Lưu FX để xóa sau

    // Kiểm tra PostFX (chỉ WebGL)
    if (tankBody.postFX) {
        fx = tankBody.postFX.addColorMatrix();
        fx.desaturate();
        fx.brightness(0.5); // Làm tối: độ sáng 0.5
        // Docs: brightness(value) => value: offset. 0 is normal? No, usually multiplied or offset.
        // Phaser ColorMatrix: brightness(value). 
        // Hãy giữ kết hợp desaturate + setTint nếu FX phức tạp, 
        // NHƯNG desaturate() là chìa khóa cho vẻ "Đá".
    } else {
        // Dự phòng cho Canvas
        if (tankBody.setTint) tankBody.setTint(0x666666); 
    }

    // 1.1 Hiệu ứng hạt (Nổ bụi)
    // Tạo texture cho bụi nếu chưa tồn tại
    if (!this.scene.textures.exists('dust_particle')) {
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xaaaaaa, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('dust_particle', 8, 8);
    }

    const emitter = this.scene.add.particles(tankContainer.x, tankContainer.y, 'dust_particle', {
        speed: { min: 50, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 600,
        gravityY: 0,
        layout: 'circle', // Not valid in all versions, but config object usually ok
    });
    emitter.explode(20); // Phát ra 20 hạt ngay lập tức
    
    // Chúng ta không cần giữ emitter mãi mãi, nhưng việc exploding sẽ xử lý nó.
    // Thực tế, chúng ta nên hủy đối tượng emitter cuối cùng hay nó vẫn ở đó?
    // Giả sử việc dọn dẹp tự động không tốn kém, nhưng an toàn là trên hết.
    this.scene.time.delayedCall(1000, () => emitter.destroy());


    // 2. Logic: Bất tử & Choáng
    tankContainer.isInvulnerable = true;
    tankContainer.isStunned = true; 
    
    // 3. Dừng di chuyển
    if (tankContainer.body) {
      tankContainer.body.setVelocity(0, 0);
    }

    // 4. Thời gian: 3 giây
    this.scene.time.delayedCall(3000, () => {
      // Hoàn tác hình ảnh
      if (fx) {
          // Xóa instance FX cụ thể
          tankBody.postFX.remove(fx);
      } else {
          if (tankBody.clearTint) tankBody.clearTint();
      }

      // Hoàn tác Logic
      tankContainer.isInvulnerable = false;
      tankContainer.isStunned = false; 
    });
  }
}
