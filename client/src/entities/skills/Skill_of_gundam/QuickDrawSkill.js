import Phaser from 'phaser';
import Skill from '../Skill';

export default class QuickDrawSkill extends Skill {
  constructor(scene) {
    super(scene, { 
        cooldown: 5000, // Hồi chiêu 5 giây
        key: 'r'
    }); 
  }

  execute(tankContainer, pointer) {
    if (!pointer) {
        // Dự phòng nếu không có con trỏ
        this.executeWithRotation(tankContainer, tankContainer.rotation);
        return;
    }

    // Tính góc đến con trỏ
    const rotation = Phaser.Math.Angle.Between(
        tankContainer.x,
        tankContainer.y,
        pointer.worldX,
        pointer.worldY
    );

    this.executeWithRotation(tankContainer, rotation);
  }

  executeWithRotation(tankContainer, rotation) {
    // 1. Tạo đạn (Dùng sprite thay cho hình chữ nhật)
    // Kích thước mong muốn: 50x20
    const bulletLength = 70;
    const bulletWidth = 50;
    
    // Khoảng cách từ tâm ra trước
    const offsetDistance = 40; 
    const spawnX = tankContainer.x + Math.cos(rotation) * offsetDistance;
    const spawnY = tankContainer.y + Math.sin(rotation) * offsetDistance;

    // Thay thế hình chữ nhật bằng Sprite
    let bullet;
    if (this.scene.textures.exists('bullet_quickdraw')) {
        bullet = this.scene.physics.add.sprite(spawnX, spawnY, 'bullet_quickdraw');
        // Scale sprite để khớp size mong muốn (50x20)
        // Lưu ý: Cần check size gốc của ảnh để scale đúng tỷ lệ
        // Tạm thời setDisplaySize để ép về kích thước này
        bullet.setDisplaySize(bulletLength, bulletWidth);
    } else {
        // Fallback nếu chưa load được ảnh
        bullet = this.scene.add.rectangle(spawnX, spawnY, bulletLength, bulletWidth, 0xffff00);
        this.scene.physics.world.enable(bullet);
    }

    // Quan trọng: Thêm vào group projectiles để xử lý va chạm với Enemy và Tường
    this.scene.projectiles.add(bullet);

    // Đặt góc xoay đạn đạn theo hướng di chuyển
    bullet.rotation = rotation;

    const speed = 1500; // Đạn nhanh
    bullet.body.setVelocity(
      Math.cos(rotation) * speed,
      Math.sin(rotation) * speed
    );

    // Tầm đạn: 250 đơn vị
    // Thời gian = Khoảng cách / Tốc độ = 250 / 1500 = 0.1666... giây ~= 167ms
    const range = 250;
    const duration = (range / speed) * 1000;

    // Hủy đạn sau thời gian tính toán
    this.scene.time.delayedCall(duration, () => {
        if (bullet.active) {
            bullet.destroy();
        }
    });

    // 2. Logic giật lùi (Knockback)
    const recoilDistance = 70; 
    const recoilDuration = 100;
    
    // Tính toán hướng giật lùi (ngược hướng bắn)
    const recoilAngle = rotation + Math.PI; // Ngược lại 180 độ
    
    // Vị trí dự kiến
    let targetX = tankContainer.x + Math.cos(recoilAngle) * recoilDistance;
    let targetY = tankContainer.y + Math.sin(recoilAngle) * recoilDistance;

    // --- LOGIC XUYÊN TƯỜNG (Smart Wall Collision) ---
    const TILE_SIZE = 40; 
    const safeOffset = 45; // Khoảng cách an toàn để không bị dính vào tường

    const mapMatrix = this.scene.mapMatrix;
    
    // Hàm kiểm tra một điểm có phải là tường không
    const isWall = (x, y) => {
        if (!mapMatrix) return false;
        const col = Math.floor(x / TILE_SIZE);
        const row = Math.floor(y / TILE_SIZE);
        if (row >= 0 && row < mapMatrix.length && col >= 0 && col < mapMatrix[0].length) {
             const tile = mapMatrix[row][col];
             return tile === '1' || tile === '2';
        }
        return false;
    };

    // Kiểm tra xem vị trí đích (và lân cận) có bị kẹt trong tường không
    // Check 3 điểm:
    // 1. Tâm xe (Target)
    // 2. Đuôi xe (Target - 20px): Để phát hiện trường hợp vượt qua tường nhưng đuôi vẫn dính
    // 3. Đầu xe (Target + 20px): Để phát hiện trường hợp đụng tường phía sau
    const tankRadius = 20;

    const checkPoints = [
        { x: targetX, y: targetY }, // Tâm
        { x: targetX - Math.cos(recoilAngle) * tankRadius, y: targetY - Math.sin(recoilAngle) * tankRadius }, // Đuôi (Về phía tường vừa mới xuyên qua)
        { x: targetX + Math.cos(recoilAngle) * tankRadius, y: targetY + Math.sin(recoilAngle) * tankRadius }  // Đầu (Về phía xa hơn)
    ];

    let hitWall = false;
    let wallCenterX, wallCenterY;

    // Duyệt qua các điểm check
    for (const p of checkPoints) {
        if (isWall(p.x, p.y)) {
             hitWall = true;
             const col = Math.floor(p.x / TILE_SIZE);
             const row = Math.floor(p.y / TILE_SIZE);
             wallCenterX = col * TILE_SIZE + TILE_SIZE / 2;
             wallCenterY = row * TILE_SIZE + TILE_SIZE / 2;
             break; // Tìm thấy tường -> Xử lý ngay
        }
    }

    if (hitWall) {
        // --- TÍNH TOÁN ĐIỂM DỊCH CHUYỂN ---
        // Tính điểm "Bên kia tường" (Far Side)
        const farX = wallCenterX + Math.cos(recoilAngle) * safeOffset;
        const farY = wallCenterY + Math.sin(recoilAngle) * safeOffset;
        
        // Tính điểm "Bên này tường" (Near Side - Bật lại)
        const nearX = wallCenterX + Math.cos(rotation) * safeOffset;
        const nearY = wallCenterY + Math.sin(rotation) * safeOffset;

        // --- LOGIC QUYẾT ĐỊNH ---
        
        // 1. Kiểm tra nếu "Bên kia" vẫn bị chặn (Tường dày hoặc vật cản khác)
        // Chúng ta cũng nên check overlap tại điểm đến mới (farX)
        // Check farX + tankRadius có chạm tường không?
        // Đơn giản nhất: Check chính điểm farX
        if (isWall(farX, farY)) {
            targetX = nearX;
            targetY = nearY;
            console.log("Gundam QuickDraw: Tường đôi (Thick Wall) -> Bật lại!");
        } else {
            // 2. Tường đơn -> Xét vị trí tâm tank so với tâm tường
            const distToWallCenter = Phaser.Math.Distance.Between(tankContainer.x, tankContainer.y, wallCenterX, wallCenterY);
            
            // Nếu lực giật đủ để đưa tâm tank VƯỢT QUA tâm tường
            if (recoilDistance >= distToWallCenter) {
                targetX = farX;
                targetY = farY;
                console.log("Gundam QuickDraw: Đã qua tâm -> Xuyên tường!");
            } else {
                targetX = nearX;
                targetY = nearY;
                console.log("Gundam QuickDraw: Chưa qua tâm -> Dội lại!");
            }
        }
    }

    this.scene.tweens.add({
        targets: tankContainer,
        x: targetX,
        y: targetY,
        duration: recoilDuration,
        ease: 'Power2'
    });
  }
}
