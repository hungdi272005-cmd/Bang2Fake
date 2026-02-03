import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: 'game-container',
  backgroundColor: '#5d5d5d', // Nền màu xám giống sàn kim loại
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Game nhìn từ trên xuống, không có trọng lực
      debug: false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
