import Phaser from 'phaser';
import Skill from '../Skill';

export default class LaserBlastSkill extends Skill {
  constructor(scene) {
    super(scene, { 
        cooldown: 15000, // Hồi chiêu 15 giây
        key: 'space'
    }); 
  }

  execute(tankContainer, movementComponent, pointer) {
    // 0. Khóa xe tăng (Choáng)
    tankContainer.isStunned = true; // Ngăn di chuyển, bắn, kỹ năng
    tankContainer.body.setVelocity(0); // Dừng ngay lập tức

    // 1. Logic tụ lực (Gồng)
    // Tạo chỉ báo hình ảnh cho việc tụ lực
    const chargeDuration = 500; // 0.5 giây (đã sửa lại từ comment cũ nếu cần)
    
    // Hình ảnh đơn giản: Vòng tròn phát sáng hoặc văn bản quanh xe tăng
    const chargeText = this.scene.add.text(tankContainer.x, tankContainer.y - 50, 'Charging...', {
        fontSize: '16px',
        fill: '#00ffff'
    }).setOrigin(0.5);

    // Tính góc ngắm NGAY TẠI THỜI ĐIỂM ẤN SPACE (Lock Aim)
    let lockedRotation = tankContainer.rotation;
    if (pointer) {
        lockedRotation = Phaser.Math.Angle.Between(
            tankContainer.x,
            tankContainer.y,
            pointer.worldX,
            pointer.worldY
        );
    }

    this.scene.time.delayedCall(chargeDuration, () => {
        chargeText.destroy();
        // Truyền góc đã khóa vào hàm bắn
        this.fireLaser(tankContainer, lockedRotation);
    });
  }

  fireLaser(tankContainer, rotation) {
    // 2. Logic bắn Laser
    const laserLength = 300;
    const laserWidth = 30;

    // Không tính lại góc dựa trên pointer nữa, dùng rotation được truyền vào
    // let rotation = tankContainer.rotation;
    // if (pointer) { ... }

    // Vị trí xuất hiện: Laser nên bắt đầu từ đầu nòng súng và mở rộng ra ngoài.
    // Khoảng cách đầu nòng súng từ tâm xe (khoảng 30-40px)
    const offsetDistance = 40; 
    
    // Chúng ta muốn đặt hình chữ nhật sao cho *điểm bắt đầu* của nó ở đầu nòng súng.
    // Origin mặc định là (0.5, 0.5) (giữa). Chúng ta đặt thành (0, 0.5) (trái-giữa).
    // Cách này, x,y chúng ta cung cấp sẽ là "điểm bắt đầu" của tia.
    
    // Vị trí tâm xe
    const spawnX = tankContainer.x + Math.cos(rotation) * offsetDistance;
    const spawnY = tankContainer.y + Math.sin(rotation) * offsetDistance;

    // Tạo Laser (Dùng Sprite 'skill_laser_blast' - laze.png)
    let laser;
    if (this.scene.textures.exists('skill_laser_blast')) {
        laser = this.scene.physics.add.sprite(spawnX, spawnY, 'skill_laser_blast');
        // Scale sprite để khớp size mong muốn (Dài 300, Rộng 1000 như bạn chỉnh, hoặc 1000x130 nếu muốn đẹp)
        // Code cũ bạn đang để: Length 300, Width 1000. Mình sẽ giữ nguyên biến ở trên.
        laser.setDisplaySize(laserLength, laserWidth);
    } else {
         // Fallback
        laser = this.scene.add.rectangle(spawnX, spawnY, laserLength, laserWidth, 0x00ffff);
        this.scene.physics.world.enable(laser);
    }

    laser.setOrigin(0, 0.5); // Neo ở phía bên trái (đầu tia)
    laser.rotation = rotation;
    
    // Thêm vật lý phòng trường hợp cần va chạm sau này, nhưng không có vận tốc
    this.scene.physics.world.enable(laser);
    laser.body.setImmovable(true);
    laser.body.moves = false; // Nó tĩnh, không di chuyển

    // Hủy sau thời gian ngắn (bắn nhanh)
    this.scene.time.delayedCall(300, () => {
        if (laser.active) {
            laser.destroy();
        }
        // Mở khóa xe tăng
        tankContainer.isStunned = false;
    });

    // --- XỬ LÝ SÁT THƯƠNG (Piercing Damage) - Fix Hitbox Rotation ---
    // Phaser Arcade Physics không hỗ trợ Body xoay (Rotated Body).
    // Nên ta phải dùng hình học (Geometry) để check va chạm thủ công.

    const damage = 150; 
    
    // 1. Tạo Polygon đại diện cho tia Laser đã xoay
    // Laser là hình chữ nhật: x, y (top-left/origin), width (length), height (width)
    // Nhưng origin là (0, 0.5)
    
    // Tính toán 4 đỉnh của hình chữ nhật Laser trong không gian World
    // Local coords relative to spawnX, spawnY (with rotation applied)
    // Top-Left: (0, -width/2)
    // Top-Right: (length, -width/2)
    // Bottom-Right: (length, width/2)
    // Bottom-Left: (0, width/2)
    
    const halfWidth = laserWidth / 2;
    const p1 = new Phaser.Math.Vector2(0, -halfWidth); // Top-Left
    const p2 = new Phaser.Math.Vector2(laserLength, -halfWidth); // Top-Right
    const p3 = new Phaser.Math.Vector2(laserLength, halfWidth); // Bottom-Right
    const p4 = new Phaser.Math.Vector2(0, halfWidth); // Bottom-Left

    // Xoay các điểm theo góc bắn
    p1.rotate(rotation);
    p2.rotate(rotation);
    p3.rotate(rotation);
    p4.rotate(rotation);

    // Dịch chuyển về vị trí spawn (Cộng vector)
    p1.add({ x: spawnX, y: spawnY });
    p2.add({ x: spawnX, y: spawnY });
    p3.add({ x: spawnX, y: spawnY });
    p4.add({ x: spawnX, y: spawnY });

    // Tạo Polygon
    const laserPoly = new Phaser.Geom.Polygon([p1, p2, p3, p4]);

    // Debug: Vẽ polygon hitbox (nếu cần)
    if (this.scene.physics.config.debug) {
        const graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } });
        graphics.strokePoints(laserPoly.points, true);
        this.scene.time.delayedCall(300, () => graphics.destroy());
    }

    // 2. Duyệt qua danh sách kẻ địch để check va chạm
    this.scene.enemies.getChildren().forEach(enemyContainer => {
        if (!enemyContainer.active) return;

        // Lấy bounds của enemy (Là hình chữ nhật AABB)
        const enemyBounds = enemyContainer.getBounds();
        
        // Check giao nhau giữa Polygon (Laser) và Rectangle (Enemy)
        // Phaser không có hàm trực tiếp Poly vs Rect, nhưng có thể check Point in Poly hoặc Rect in Poly
        // Cách đơn giản nhất: Check nếu Polygon chứa bất kỳ điểm nào của Rect hoặc Rect chứa điểm của Poly?
        // Hoặc dùng: Phaser.Geom.Intersects.RectangleToTriangle (chia Poly thành 2 tam giác)
        
        // Cách chính xác: Dùng Intersects.GetRectangleToTriangle
        // Chia hcn Laser thành 2 tam giác: (p1, p2, p3) và (p1, p3, p4)
        const tri1 = new Phaser.Geom.Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        const tri2 = new Phaser.Geom.Triangle(p1.x, p1.y, p3.x, p3.y, p4.x, p4.y);

        if (Phaser.Geom.Intersects.RectangleToTriangle(enemyBounds, tri1) || 
            Phaser.Geom.Intersects.RectangleToTriangle(enemyBounds, tri2)) {
            
            // --- TRÚNG ĐẠN ---
            // Tìm Tank Instance 
            if (this.scene.dummy && this.scene.dummy.container === enemyContainer) {
                this.scene.dummy.takeDamage(damage);
                console.log(`Laser Hit (Rotated)! Deals ${damage} damage.`);
                
                 // Visual Effect
                if (this.scene.dummy.body.setTint) {
                    this.scene.dummy.body.setTint(0xff0000);
                    this.scene.time.delayedCall(100, () => {
                         if(this.scene.dummy && this.scene.dummy.body) this.scene.dummy.body.clearTint();
                    });
                }
            }
        }
    });

    // Tùy chọn: Rung camera để tạo cảm giác va chạm
    this.scene.cameras.main.shake(100, 0.01);
  }
}
