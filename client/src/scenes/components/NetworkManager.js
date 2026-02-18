/**
 * NetworkManager - Quản lý đồng bộ multiplayer qua Socket.IO
 * Gửi vị trí player mỗi 50ms (20 tick/s)
 * Nhận vị trí đối thủ → lerp tới vị trí đó
 * Sync damage/stun/slow/silence qua playerEffect/opponentEffect
 */

import Phaser from 'phaser';
import { getSocket } from '../../services/socket.js';

export default class NetworkManager {
  constructor(scene, sessionId) {
    this.scene = scene;
    this.sessionId = sessionId;
    this.socket = getSocket();
    
    // Tần suất gửi update (ms)
    this.sendRate = 50; // 20 tick/s
    this.lastSendTime = 0;
    
    // Dữ liệu đối thủ nhận được gần nhất (để lerp)
    this.opponentData = {
      x: 0,
      y: 0,
      bodyAngle: 0,
      turretRotation: 0,
      health: 100,
      maxHealth: 100
    };
    this.hasOpponentData = false;
    
    // Lerp speed (0-1, cao hơn = snap nhanh hơn)
    this.lerpFactor = 0.25;
    
    // Callbacks
    this.onOpponentShootCallback = null;
    this.onOpponentSkillCallback = null;
    this.onOpponentEffectCallback = null;
    
    // Setup listeners
    this.setupListeners();
    
    console.log('🌐 NetworkManager initialized - Session:', sessionId);
  }

  setupListeners() {
    if (!this.socket) return;

    // Nhận vị trí đối thủ
    this.socket.on('opponentUpdate', (data) => {
      this.opponentData.x = data.x;
      this.opponentData.y = data.y;
      this.opponentData.bodyAngle = data.bodyAngle;
      this.opponentData.turretRotation = data.turretRotation;
      if (data.health !== undefined) {
        this.opponentData.health = data.health;
        this.opponentData.maxHealth = data.maxHealth;
      }
      this.hasOpponentData = true;
    });

    // Nhận event bắn từ đối thủ
    this.socket.on('opponentShoot', (data) => {
      if (this.onOpponentShootCallback) {
        this.onOpponentShootCallback(data);
      }
    });

    // Nhận event skill từ đối thủ
    this.socket.on('opponentSkill', (data) => {
      if (this.onOpponentSkillCallback) {
        this.onOpponentSkillCallback(data);
      }
    });

    // Nhận effect từ đối thủ (damage, stun, slow, silence)
    this.socket.on('opponentEffect', (data) => {
      if (this.onOpponentEffectCallback) {
        this.onOpponentEffectCallback(data);
      }
    });
  }

  /**
   * Gửi vị trí player lên server (gọi mỗi frame, tự throttle)
   */
  sendPlayerUpdate(player) {
    if (!this.socket || !player || !player.container) return;
    
    const now = Date.now();
    if (now - this.lastSendTime < this.sendRate) return;
    this.lastSendTime = now;

    const container = player.container;
    this.socket.emit('playerUpdate', {
      sessionId: this.sessionId,
      x: Math.round(container.x),
      y: Math.round(container.y),
      bodyAngle: player.body ? Math.round(player.body.angle) : 0,
      turretRotation: player.weapon ? player.weapon.turret.rotation : 0,
      health: player.health ? player.health.currentHealth : 100,
      maxHealth: player.health ? player.health.maxHealth : 100
    });
  }

  /**
   * Gửi event bắn
   */
  sendShoot(player) {
    if (!this.socket || !player) return;
    
    this.socket.emit('playerShoot', {
      sessionId: this.sessionId,
      x: Math.round(player.container.x),
      y: Math.round(player.container.y),
      angle: player.weapon ? player.weapon.turret.rotation : 0,
      damage: player.weapon ? player.weapon.damage : 50,
      bulletSpeed: player.weapon ? player.weapon.bulletSpeed : 500
    });
  }

  /**
   * Gửi event dùng skill
   */
  sendSkill(skillKey, player) {
    if (!this.socket || !player) return;
    
    this.socket.emit('playerSkill', {
      sessionId: this.sessionId,
      skillKey,
      x: Math.round(player.container.x),
      y: Math.round(player.container.y),
      angle: player.weapon ? player.weapon.turret.rotation : 0
    });
  }

  /**
   * Gửi effect (damage/stun/slow/silence) — gọi bởi Tank.onEffectCallback
   */
  sendEffect(type, params) {
    if (!this.socket) return;
    
    this.socket.emit('playerEffect', {
      sessionId: this.sessionId,
      type,
      params
    });
  }

  /**
   * Cập nhật vị trí đối thủ bằng Lerp (gọi mỗi frame)
   */
  updateOpponent(opponentTank) {
    if (!this.hasOpponentData || !opponentTank || !opponentTank.container) return false;

    const container = opponentTank.container;
    
    // Lerp vị trí (mượt mà)
    container.x = Phaser.Math.Linear(container.x, this.opponentData.x, this.lerpFactor);
    container.y = Phaser.Math.Linear(container.y, this.opponentData.y, this.lerpFactor);
    
    // Cập nhật góc thân xe
    if (opponentTank.body) {
      const currentAngle = opponentTank.body.angle;
      const targetAngle = this.opponentData.bodyAngle;
      opponentTank.body.setAngle(Phaser.Math.Angle.RotateTo(
        Phaser.Math.DegToRad(currentAngle),
        Phaser.Math.DegToRad(targetAngle),
        0.15
      ) * Phaser.Math.RAD_TO_DEG);
    }
    
    // Cập nhật góc tháp pháo — quan trọng để thấy hướng ngắm
    if (opponentTank.weapon && opponentTank.weapon.turret) {
      opponentTank.weapon.turret.rotation = this.opponentData.turretRotation;
    }

    // Sync health (cập nhật visual)
    if (opponentTank.health && this.opponentData.health !== undefined) {
      opponentTank.health.currentHealth = this.opponentData.health;
      opponentTank.health.maxHealth = this.opponentData.maxHealth || opponentTank.health.maxHealth;
      if (opponentTank.health.draw) {
        opponentTank.health.draw();
      }
    }

    return true;
  }

  /**
   * Callback setters
   */
  onOpponentShoot(callback) {
    this.onOpponentShootCallback = callback;
  }

  onOpponentSkill(callback) {
    this.onOpponentSkillCallback = callback;
  }

  onOpponentEffect(callback) {
    this.onOpponentEffectCallback = callback;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.socket) {
      this.socket.off('opponentUpdate');
      this.socket.off('opponentShoot');
      this.socket.off('opponentSkill');
      this.socket.off('opponentEffect');
    }
    console.log('🌐 NetworkManager destroyed');
  }
}
