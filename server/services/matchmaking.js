const GameSession = require('../models/GameSession');
const { v4: uuidv4 } = require('uuid');

/**
 * Matchmaking Queue - Hàng đợi tìm trận
 */
class MatchmakingQueue {
  constructor() {
    this.queue = []; // Danh sách players đang chờ
  }

  /**
   * Thêm player vào hàng đợi
   */
  addPlayer(playerData) {
    // Kiểm tra player đã trong queue chưa
    const exists = this.queue.find(p => p.userId === playerData.userId);
    if (exists) {
      console.log(`Player ${playerData.username} đã trong queue`);
      return null;
    }

    this.queue.push(playerData);
    console.log(`✅ Player ${playerData.username} đã vào queue. Queue size: ${this.queue.length}`);

    // Nếu đủ 2 players, tạo trận đấu
    if (this.queue.length >= 2) {
      return this.createMatch();
    }

    return null;
  }

  /**
   * Tạo trận đấu với 2 players
   */
  async createMatch() {
    // Lấy 2 players đầu tiên trong queue
    const player1 = this.queue.shift();
    const player2 = this.queue.shift();

    const sessionId = uuidv4();

    try {
      // Tạo game session trong database
      const gameSession = await GameSession.create({
        sessionId,
        players: [
          {
            userId: player1.userId,
            username: player1.username,
            socketId: player1.socketId,
            tank: player1.tank,
            status: 'ready'
          },
          {
            userId: player2.userId,
            username: player2.username,
            socketId: player2.socketId,
            tank: player2.tank,
            status: 'ready'
          }
        ],
        status: 'waiting',
        startTime: new Date()
      });

      console.log(`🎮 Match created: ${sessionId}`);
      console.log(`   Player 1: ${player1.username}`);
      console.log(`   Player 2: ${player2.username}`);

      return {
        sessionId: gameSession.sessionId,
        players: [player1, player2]
      };
    } catch (error) {
      console.error('Error creating match:', error);
      // Nếu lỗi, đưa players lại vào queue
      this.queue.unshift(player1, player2);
      return null;
    }
  }

  /**
   * Xóa player khỏi queue (khi disconnect)
   */
  removePlayer(socketId) {
    const index = this.queue.findIndex(p => p.socketId === socketId);
    if (index !== -1) {
      const removed = this.queue.splice(index, 1)[0];
      console.log(`❌ Player ${removed.username} đã rời queue`);
      return true;
    }
    return false;
  }

  /**
   * Lấy số lượng players đang chờ
   */
  getQueueSize() {
    return this.queue.length;
  }
}

// Export singleton instance
const matchmakingQueue = new MatchmakingQueue();
module.exports = matchmakingQueue;
