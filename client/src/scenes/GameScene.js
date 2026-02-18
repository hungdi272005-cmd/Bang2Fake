import Phaser from 'phaser';
import Tank from '../entities/Tank';
import UIManager from './components/UIManager';
import InputManager from './components/InputManager';
import NetworkManager from './components/NetworkManager';
import GundamConfig from '../entities/tanks/Gundam'; // Import Định nghĩa Tank
import PhoenixConfig from '../entities/tanks/Phoenix'; // Import Phoenix
import KakashiConfig from '../entities/tanks/Kakashi'; // Import Kakashi
import DeepoolConfig from '../entities/tanks/Deepool'; // Import Deepool
import BattleMap from '../maps/BattleMap';
import FPSDisplay from '../trangthai/FPSDisplay';
import NetworkStatus from '../trangthai/NetworkStatus';
import { applyRuneStatsToConfig } from '../utils/runeStats.js';
import { fetchRuneData } from '../pages/rune-board/runeApi.js';

// Map tank ID → config
const TANK_MAP = {
  'gundam': GundamConfig,
  'phoenix': PhoenixConfig,
  'kakashi': KakashiConfig,
  'deepool': DeepoolConfig
};

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
    this.load.image('tank_deepool', 'Pictures_of_deepool/tank_deepool.png'); // Load Deepool
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
    this.enemies = this.physics.add.group(); // Nhóm Enemy

    // --- XÁC ĐỊNH TANK ĐƯỢC CHỌN ---
    const myTankId = (window.gameConfig?.selectedTank || 'gundam').toLowerCase();
    const PlayerTankConfig = TANK_MAP[myTankId] || GundamConfig;

    // Xác định tank đối thủ từ gamePlayers (lưu từ trang chọn tank)
    let opponentTankId = 'gundam';
    try {
      const gamePlayers = JSON.parse(localStorage.getItem('gamePlayers') || '[]');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const myUserId = user.id;
      const opponent = gamePlayers.find(p => p.userId !== myUserId);
      if (opponent && opponent.tank) {
        opponentTankId = opponent.tank.toLowerCase();
      }
    } catch (e) {
      console.warn('⚠️ Không đọc được thông tin đối thủ, dùng default');
    }
    const OpponentTankConfig = TANK_MAP[opponentTankId] || GundamConfig;

    console.log(`🎮 Player tank: ${PlayerTankConfig.name} | Opponent tank: ${OpponentTankConfig.name}`);

    // --- SPAWN TANK (PLAYER) ---
    const spawnPoints = this.map.getSpawnPoints();
    const spawnPos = spawnPoints.length > 0 ? spawnPoints[0] : { x: 100, y: 100 };

    const pConfig = { ...PlayerTankConfig, team: 1 };
    this.player = new Tank(this, spawnPos.x, spawnPos.y, pConfig);

    // Load rune data bất đồng bộ → áp dụng sau khi load xong
    this.loadAndApplyRunes(pConfig);

    // --- SPAWN ĐỐI THỦ ---
    const dummyPos = spawnPoints.length > 1 
      ? spawnPoints[1] 
      : { x: spawnPos.x + 300, y: spawnPos.y };

    const eConfig = { ...OpponentTankConfig, team: 2 };
    this.dummy = new Tank(this, dummyPos.x, dummyPos.y, eConfig);
    this.enemies.add(this.dummy.container);

    // --- XỬ LÝ VA CHẠM (COLLISION) ---
    // 1. Tank vs Map
    this.physics.add.collider(this.player.container, this.map.walls);
    this.physics.add.collider(this.player.container, this.map.softWalls);
    this.physics.add.collider(this.dummy.container, this.map.walls);
    this.physics.add.collider(this.dummy.container, this.map.softWalls);
    
    // 2. Tank vs Tank (Chặn nhau - khác team)
    this.physics.add.collider(this.player.container, this.dummy.container);

    // 3. Tank vs Item (Overlap -> Ăn)
    this.physics.add.overlap(this.player.container, this.map.items, (player, item) => {
        item.destroy();
        console.log("Collected Item!");
    });

    // 4. Đạn vs Tường cứng -> Đạn nổ
    this.physics.add.collider(this.projectiles, this.map.walls, (projectile, wall) => {
        projectile.destroy();
    });

    // 5. Đạn vs Tường mềm -> Cả 2 cùng mất
    this.physics.add.collider(this.projectiles, this.map.softWalls, (projectile, wall) => {
        projectile.destroy();
        this.map.destroySoftWall(wall);
    });

    // 6. Đạn vs Enemy
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemyContainer) => {
        projectile.destroy();
        
        if (this.dummy && this.dummy.container === enemyContainer) {
            const damage = projectile.damage || 50; 
            this.dummy.takeDamage(damage); 
            // onEffectCallback trên dummy sẽ tự broadcast damage qua network
            
            if (this.dummy.body && this.dummy.body.setTint) {
                this.dummy.body.setTint(0xff0000);
                this.time.delayedCall(100, () => {
                   if(this.dummy && this.dummy.body) this.dummy.body.clearTint();
                });
            }
        }
    });

    // Camera theo dõi tank player
    this.cameras.main.startFollow(this.player.container);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Xử lý khi resize cửa sổ
    this.scale.on('resize', this.resize, this);

    // Khởi tạo Input Manager
    this.inputManager = new InputManager(this);

    // Khởi tạo Network Manager (multiplayer sync)
    const gameSessionId = localStorage.getItem('gameSessionId') || '';
    this.networkManager = new NetworkManager(this, gameSessionId);

    // Set vị trí ban đầu của opponent cho NetworkManager
    if (this.dummy) {
      this.networkManager.opponentData.x = this.dummy.container.x;
      this.networkManager.opponentData.y = this.dummy.container.y;
    }

    // --- DUMMY: Khi bị effect → broadcast qua network cho đối thủ ---
    if (this.dummy) {
      this.dummy.onEffectCallback = (type, params) => {
        this.networkManager.sendEffect(type, params);
      };
    }

    // Callback khi đối thủ bắn → spawn đạn visual
    this.networkManager.onOpponentShoot((data) => {
      if (this.dummy && this.dummy.weapon) {
        this.dummy.shoot();
      }
    });

    // --- PLAYER: Nhận effect từ đối thủ → áp dụng lên player ---
    this.networkManager.onOpponentEffect((data) => {
      if (!this.player) return;
      const { type, params } = data;
      
      switch (type) {
        case 'damage':
          this.player.takeDamage(params.amount, true); // fromNetwork = true
          console.log(`🔴 Bị đối thủ gây ${params.amount} damage! HP: ${this.player.health.currentHealth}`);
          break;
        case 'stun':
          this.player.applyStun(params.duration, true);
          console.log(`⚡ Bị choáng ${params.duration}ms!`);
          break;
        case 'slow':
          this.player.applySlow(params.amount, params.duration, true);
          console.log(`🐌 Bị làm chậm ${params.amount} trong ${params.duration}ms!`);
          break;
        case 'silence':
          this.player.applySilence(params.duration, true);
          console.log(`🔇 Bị câm lặng ${params.duration}ms!`);
          break;
      }
    });

    // Wire InputManager callbacks → NetworkManager
    this.inputManager.onShootCallback = (player) => {
      this.networkManager.sendShoot(player);
    };
    this.inputManager.onSkillCallback = (skillKey, player) => {
      this.networkManager.sendSkill(skillKey, player);
    };

    // Khởi tạo UI Manager
    this.uiManager = new UIManager(this);
    this.uiManager.createAbilityUI();

    // --- TRẠNG THÁI (Status) ---
    this.fpsDisplay = new FPSDisplay(this, 10, 10);
    this.networkStatus = new NetworkStatus(this, 10, 40);
  }

  /**
   * Load rune data từ server và áp dụng vào player tank (chạy bất đồng bộ)
   * Hot-patch stats trực tiếp lên Tank đã tạo
   */
  async loadAndApplyRunes(baseConfig) {
    try {
      const runeData = await fetchRuneData();
      const tankId = (baseConfig.name || '').toLowerCase();
      const assignedPageId = runeData.tankMapping?.[tankId];
      if (!assignedPageId) return;

      const assignedPage = runeData.pages.find(p => p.pageId === assignedPageId);
      if (!assignedPage || !assignedPage.slots) return;

      const buffedConfig = applyRuneStatsToConfig(baseConfig, assignedPage.slots);

      // Hot-patch stats lên player đang chạy
      if (this.player) {
        // Speed
        if (buffedConfig.stats.speed && this.player.movement) {
          this.player.movement.speed = buffedConfig.stats.speed;
        }
        // Defense
        this.player.defense = buffedConfig.stats.defense || 0;
        // Vampirism
        this.player.vampirism = buffedConfig.stats.vampirism || 0;
        // Weapon damage + crit
        if (this.player.weapon && buffedConfig.weapon) {
          this.player.weapon.damage = buffedConfig.weapon.damage || this.player.weapon.damage;
          this.player.weapon.critChance = buffedConfig.weapon.critChance || 0;
        }
        console.log('💎 Rune stats applied:', buffedConfig.stats, buffedConfig.weapon);
      }
    } catch (err) {
      console.warn('⚠️ Could not load rune data, using base stats:', err.message);
    }
  }

  update(time, delta) {
    // Xử lý input (chỉ player, không điều khiển dummy nữa)
    this.inputManager.handleInput(this.player, null, this.input.activePointer);

    // --- MULTIPLAYER SYNC ---
    if (this.networkManager) {
      // Gửi vị trí player lên server (throttled 20Hz)
      this.networkManager.sendPlayerUpdate(this.player);
      
      // Nhận + lerp vị trí đối thủ
      this.networkManager.updateOpponent(this.dummy);
    }

    // Cập nhật weapon/abilities cho dummy (để visual đúng vị trí)
    if (this.dummy) {
      this.dummy.weapon.update();
      this.dummy.abilities.update();
    }

    // Cập nhật UI
    this.uiManager.updateAbilityUI(this.player);

    // Cập nhật Trạng thái
    if (this.fpsDisplay) this.fpsDisplay.update();
    if (this.networkStatus) {
         if (time % 1000 < 20) {
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
