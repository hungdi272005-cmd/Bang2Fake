/**
 * Game Page - Khởi tạo Phaser Game
 * Được gọi khi navigate đến /game
 */

import Phaser from 'phaser';
import GameScene from '../../scenes/GameScene.js';
import { getSelectedTank } from '../tank-select/TankSelectionPage.js';
import { getGameMode } from '../game-room/GameRoomPage.js';

let gameInstance = null;

export function initGamePage() {
  // Chỉ init DOM, không khởi tạo game ở đây
  console.log('✅ Game page DOM initialized');
}

/**
 * Khởi tạo Phaser game khi vào trang /game
 */
export function startGame() {
  const container = document.getElementById('game-container');
  if (!container) {
    console.error('❌ game-container not found!');
    return;
  }
  
  // Destroy game cũ nếu có
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
  
  // Clear container
  container.innerHTML = '';
  
  const selectedTank = getSelectedTank();
  const gameMode = getGameMode();
  
  console.log('🎮 Starting game with tank:', selectedTank, 'mode:', gameMode);
  
  // Lưu thông tin để GameScene sử dụng
  window.gameConfig = {
    selectedTank,
    gameMode
  };
  
  // Phaser game config
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1a1a2e',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };
  
  // Khởi tạo game
  gameInstance = new Phaser.Game(config);
  
  console.log('✅ Phaser game started!');
}

/**
 * Dừng và hủy game
 */
export function stopGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
    
    // Clear container DOM
    const container = document.getElementById('game-container');
    if (container) {
      container.innerHTML = '';
    }
    
    console.log('🛑 Phaser game stopped');
  }
}

// Expose to window for synchronous access
window.stopPhaserGame = stopGame;
