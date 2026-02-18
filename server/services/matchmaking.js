const GameSession = require('../models/GameSession');
const { v4: uuidv4 } = require('uuid');

/**
 * Matchmaking Queue - Hàng đợi tìm trận
 * Ghép 2 người chơi bất kì khi đủ >= 2 người trong queue
 */
class MatchmakingQueue {
  constructor() {
    this.queue = []; // Danh sách players đang chờ
    this.sessions = new Map(); // sessionId → session data (để track chọn tank + ready)
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
   * Tạo trận đấu với 2 players (chưa chọn tank)
   */
  async createMatch() {
    // Lấy 2 players đầu tiên trong queue
    const player1 = this.queue.shift();
    const player2 = this.queue.shift();

    const sessionId = uuidv4();

    try {
      // Tạo game session trong database (chưa có tank)
      const gameSession = await GameSession.create({
        sessionId,
        players: [
          {
            userId: player1.userId,
            username: player1.username,
            socketId: player1.socketId,
            tank: null, // Chưa chọn tank
            status: 'waiting'
          },
          {
            userId: player2.userId,
            username: player2.username,
            socketId: player2.socketId,
            tank: null, // Chưa chọn tank
            status: 'waiting'
          }
        ],
        status: 'waiting',
        startTime: new Date()
      });

      // Lưu session data để track chọn tank + ready
      this.sessions.set(sessionId, {
        sessionId,
        players: {
          [player1.userId]: {
            userId: player1.userId,
            username: player1.username,
            displayName: player1.displayName,
            socketId: player1.socketId,
            tank: null,
            ready: false
          },
          [player2.userId]: {
            userId: player2.userId,
            username: player2.username,
            displayName: player2.displayName,
            socketId: player2.socketId,
            tank: null,
            ready: false
          }
        }
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
   * Player chọn tank trong session
   */
  selectTank(sessionId, userId, tankId) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.players[userId]) return null;

    session.players[userId].tank = tankId;
    return session;
  }

  /**
   * Player confirm ready
   * Trả về true nếu cả 2 đều ready
   */
  confirmReady(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.players[userId]) return { allReady: false };

    session.players[userId].ready = true;

    // Kiểm tra cả 2 đã ready chưa
    const players = Object.values(session.players);
    const allReady = players.every(p => p.ready);

    return { allReady, session };
  }

  /**
   * Lấy session data
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Xóa session (khi game bắt đầu hoặc bị hủy)
   */
  removeSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Xóa player khỏi queue (khi disconnect hoặc hủy)
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
