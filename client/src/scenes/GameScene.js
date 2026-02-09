import Phaser from 'phaser';
import Tank from '../entities/Tank';
import UIManager from './components/UIManager';
import InputManager from './components/InputManager';
import GundamConfig from '../entities/tanks/Gundam'; // Import Định nghĩa Tank
import PhoenixConfig from '../entities/tanks/Phoenix'; // Import Phoenix
import KakashiConfig from '../entities/tanks/Kakashi'; // Import Kakashi
import BattleMap from '../maps/BattleMap';
import FPSDisplay from '../trangthai/FPSDisplay';
import NetworkStatus from '../trangthai/NetworkStatus';
  
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.map = null;
    this.fpsDisplay = null;
    this.networkStatus = null;
  }

  preload() {
    // Xác định đường dẫn assets - dùng hình chữ nhật tạm nếu chưa có ảnh
    // hình hộp đơn giản cho thân xe và tháp pháo
    // xác định đường dẫn assets
    this.load.path = './assets/';
    
    // Tải hình ảnh
    this.load.image('tank_phoenix', 'Pictures_of_phoenix/tank_phoenix.png');
    this.load.image('tank_gundam', 'Pictures_of_gundam/tank_gundam.png');
    this.load.image('tank_kakashi', 'picktures_of_kakashi/tank_kakashi.png');
    this.load.image('bullet_quickdraw', 'Pictures_of_gundam/Danrutsungnhanh.png');
    this.load.image('skill_laser_blast', 'Pictures_of_gundam/laze.png');
    this.load.image('skill_chidori', 'picktures_of_kakashi/chidori.png');
  }

  create() {
    // --- XỬ LÝ MAP ---
    this.map = new BattleMap(this);
    this.map.create();

    const mapWidth = this.map.getWidth();
    const mapHeight = this.map.getHeight();
    
    // Nhóm Projectiles & Enemies
    this.projectiles = this.physics.add.group({ runChildUpdate: true }); // Đạn
    this.enemies = this.physics.add.group(); // Nhóm Enemy (Hình nộm)

    // --- SPAWN TANK (PLAYER) ---
    const spawnPoints = this.map.getSpawnPoints();
    const spawnPos = spawnPoints.length > 0 ? spawnPoints[0] : { x: 100, y: 100 };
    // Player: Team 1 - Kakashi
    const pConfig = { ...KakashiConfig, team: 1 };
    this.player = new Tank(this, spawnPos.x, spawnPos.y, pConfig);

    // --- SPAWN DUMMY ENEMY (Gundam) ---
    // Spawn cách player một đoạn
    const dummyPos = { x: spawnPos.x + 200, y: spawnPos.y };
    // Kiểm tra nếu map rộng thì spawn xa hơn chút
    if (spawnPoints.length > 1) {
        // dummyPos = spawnPoints[1]; // Nếu muốn dùng điểm spawn 2
    }
    
    // Enemy: Team 2
    const eConfig = { ...GundamConfig, team: 2 };
    this.dummy = new Tank(this, dummyPos.x, dummyPos.y, eConfig);
    // Add container của dummy vào group enemies để xử lý va chạm chung
    this.enemies.add(this.dummy.container);

    // --- SPAWN ALLY (Phoenix - Team 1) ---
    // Spawn một đồng minh để test đi xuyên
    const allyPos = { x: spawnPos.x - 100, y: spawnPos.y };
    const allyConfig = { ...PhoenixConfig, team: 1 };
    this.ally = new Tank(this, allyPos.x, allyPos.y, allyConfig);
    
    // Ally Collision
    this.physics.add.collider(this.ally.container, this.map.walls);
    this.physics.add.collider(this.ally.container, this.map.softWalls);
    
    // Ally vs Enemy (Chặn nhau)
    this.physics.add.collider(this.ally.container, this.enemies, null, (ally, enemy) => {
        return true; // Khác team -> Chặn
    });

    // --- XỬ LÝ VA CHẠM (COLLISION) ---
    // 1. Tank vs Map
    this.physics.add.collider(this.player.container, this.map.walls);
    this.physics.add.collider(this.player.container, this.map.softWalls);
    
    // Dummy vs Map
    this.physics.add.collider(this.dummy.container, this.map.walls);
    this.physics.add.collider(this.dummy.container, this.map.softWalls);
    
    // 2. Tank vs Tank (Chặn nhau nếu khác Team)
    // Player vs Dummy Is Handled inside generic logic if we grouped them, but here we do explicit pairs for now
    
    const checkTeamCollision = (obj1, obj2) => {
        // Lấy Tank instance từ container (giả sử ta gán manually hoặc tìm cách nào đó)
        // Hiện tại ta so sánh trực tiếp this.player, this.dummy, this.ally
        let t1 = null; 
        if (obj1 === this.player.container) t1 = this.player;
        else if (obj1 === this.dummy.container) t1 = this.dummy;
        else if (obj1 === this.ally.container) t1 = this.ally;

        let t2 = null;
        if (obj2 === this.player.container) t2 = this.player;
        else if (obj2 === this.dummy.container) t2 = this.dummy;
        else if (obj2 === this.ally.container) t2 = this.ally;

        if (t1 && t2) {
            return t1.team !== t2.team;
        }
        return true;
    };

    this.physics.add.collider(this.player.container, this.dummy.container, null, checkTeamCollision);
    this.physics.add.collider(this.player.container, this.ally.container, null, checkTeamCollision);

    // 2. Tank vs Item (Overlap -> Ăn)
    this.physics.add.overlap(this.player.container, this.map.items, (player, item) => {
        item.destroy(); // Ăn item -> mất item
        console.log("Collected Item!");
        // TODO: Thêm logic buff (Buff máu, speed...)
    });

    // 3. Đạn vs Tường cứng -> Đạn nổ
    this.physics.add.collider(this.projectiles, this.map.walls, (projectile, wall) => {
        projectile.destroy();
        // TODO: Thêm hiệu ứng nổ
    });

    // 4. Đạn vs Tường mềm -> Cả 2 cùng mất (Hoặc tường mất máu)
    this.physics.add.collider(this.projectiles, this.map.softWalls, (projectile, wall) => {
        projectile.destroy();
        this.map.destroySoftWall(wall);
    });

    // 5. Đạn vs Enemy (Phoenix Dummy)
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemyContainer) => {
        projectile.destroy(); // Hủy đạn
        
        // Tìm instance Tank từ container (hoặc xử lý trực tiếp nếu logic đơn giản)
        // Ở đây mình biết enemyContainer là container của this.dummy
        if (this.dummy && this.dummy.container === enemyContainer) {
            // Lấy damage từ viên đạn (đã được TankWeapon tính toán)
            const damage = projectile.damage || 50; 
            this.dummy.takeDamage(damage); 
            console.log(`Enemy Hit! Damage: ${damage}. Health: ${this.dummy.health.currentHealth}/${this.dummy.health.maxHealth}`);
            
            // Hiệu ứng nháy đỏ khi trúng đạn
            if (this.dummy.body.setTint) {
                this.dummy.body.setTint(0xff0000);
                this.time.delayedCall(100, () => {
                   if(this.dummy && this.dummy.body) this.dummy.body.clearTint();
                });
            }
        }
    });

    // Camera theo dõi tank player (tức thì - không delay)
    this.cameras.main.startFollow(this.player.container);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Xử lý khi resize cửa sổ
    this.scale.on('resize', this.resize, this);

    // Khởi tạo Input Manager
    this.inputManager = new InputManager(this);

    // Khởi tạo UI Manager
    this.uiManager = new UIManager(this);
    this.uiManager.createAbilityUI();

    // --- TRẠNG THÁI (Status) ---
    this.fpsDisplay = new FPSDisplay(this, 10, 10);
    this.networkStatus = new NetworkStatus(this, 10, 40);
  }

  update(time, delta) {
    // Xử lý input
    this.inputManager.handleInput(this.player, this.dummy, this.input.activePointer);

    // Cập nhật UI
    this.uiManager.updateAbilityUI(this.player);

    // Cập nhật Trạng thái
    if (this.fpsDisplay) this.fpsDisplay.update();
    if (this.networkStatus) {
         // Giả lập ping (vì chưa có server thực tế)
         // Ping dao động từ 15ms đến 45ms
         if (time % 1000 < 20) { // Cập nhật mỗi giây
            const fakePing = Math.floor(Math.random() * 30) + 15;
            this.networkStatus.updatePing(fakePing);
         }
    }
  }

  resize(gameSize, baseSize, displaySize, resolution) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.main.setViewport(0, 0, width, height);
    // QUAN TRỌNG: Giữ bounds của camera theo kích thước MAP, KHÔNG theo kích thước màn hình
    // Nếu set theo width/height màn hình thì camera sẽ đi ra ngoài map (khoảng đen)
    if (this.map) {
         this.cameras.main.setBounds(0, 0, this.map.getWidth(), this.map.getHeight());
    }
    
    // Update UI position
    if (this.uiManager) {
        // Cần phương thức resize trong UIManager
        this.uiManager.resize(width, height);
    }
  }
}
