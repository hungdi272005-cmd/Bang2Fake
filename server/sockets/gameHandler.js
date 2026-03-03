/**
 * Game Socket Handler - Handles matchmaking and in-game synchronization
 */
const matchmakingQueue = require('../services/matchmaking');

module.exports = (io, socket) => {
  const userId = socket.user._id.toString();

  /**
   * Event: findMatch - Tìm trận đấu
   */
  socket.on('findMatch', async () => {
    console.log(`🔍 ${socket.user.username} đang tìm trận...`);

    const playerData = {
      userId: userId,
      username: socket.user.username,
      displayName: socket.user.displayName || socket.user.username,
      socketId: socket.id
    };

    const match = await matchmakingQueue.addPlayer(playerData);

    if (match) {
      const [player1, player2] = match.players;

      const p1Socket = io.sockets.sockets.get(player1.socketId);
      const p2Socket = io.sockets.sockets.get(player2.socketId);
      if (p1Socket) p1Socket.join(`session:${match.sessionId}`);
      if (p2Socket) p2Socket.join(`session:${match.sessionId}`);

      io.to(player1.socketId).emit('matchFound', {
        sessionId: match.sessionId,
        opponent: {
          userId: player2.userId,
          username: player2.username,
          displayName: player2.displayName || player2.username
        }
      });

      io.to(player2.socketId).emit('matchFound', {
        sessionId: match.sessionId,
        opponent: {
          userId: player1.userId,
          username: player1.username,
          displayName: player1.displayName || player1.username
        }
      });

      console.log(`✅ Match found! Session: ${match.sessionId}`);
    } else {
      socket.emit('searching', {
        message: 'Đang tìm đối thủ...',
        queueSize: matchmakingQueue.getQueueSize()
      });
    }
  });

  /**
   * Event: cancelMatch - Hủy tìm trận
   */
  socket.on('cancelMatch', () => {
    const removed = matchmakingQueue.removePlayer(socket.id);
    if (removed) {
      socket.emit('matchCancelled', {
        message: 'Đã hủy tìm trận'
      });
      console.log(`❌ ${socket.user.username} đã hủy tìm trận`);
    }
  });

  /**
   * Event: selectTank - Chọn tank trong phòng chọn tank
   */
  socket.on('selectTank', (data) => {
    const { sessionId, tankId } = data;
    const session = matchmakingQueue.selectTank(sessionId, userId, tankId);
    if (session) {
      socket.to(`session:${sessionId}`).emit('opponentSelectTank', { tankId });
      console.log(`🎯 ${socket.user.username} chọn tank: ${tankId}`);
    }
  });

  /**
   * Event: confirmReady - Xác nhận sẵn sàng
   */
  socket.on('confirmReady', (data) => {
    const { sessionId } = data;
    const result = matchmakingQueue.confirmReady(sessionId, userId);

    socket.to(`session:${sessionId}`).emit('opponentReady', { userId });

    if (result.allReady) {
      const players = Object.values(result.session.players);
      console.log(`🚀 All ready! Starting game for session: ${sessionId}`);

      io.to(`session:${sessionId}`).emit('allReady', {
        sessionId,
        players: players.map(p => ({
          userId: p.userId,
          username: p.username,
          displayName: p.displayName,
          tank: p.tank
        }))
      });

      matchmakingQueue.removeSession(sessionId);
    }
  });

  /**
   * In-game synchronization events
   */
  socket.on('playerUpdate', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentUpdate', {
      x: data.x,
      y: data.y,
      bodyAngle: data.bodyAngle,
      turretRotation: data.turretRotation,
      health: data.health,
      maxHealth: data.maxHealth
    });
  });

  socket.on('playerShoot', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentShoot', {
      x: data.x,
      y: data.y,
      angle: data.angle,
      damage: data.damage,
      bulletSpeed: data.bulletSpeed
    });
  });

  socket.on('playerSkill', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentSkill', {
      skillKey: data.skillKey,
      x: data.x,
      y: data.y,
      angle: data.angle
    });
  });

  socket.on('playerEffect', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentEffect', {
      type: data.type,
      params: data.params
    });
  });

  // Đồng bộ phá tường mềm giữa 2 người chơi
  socket.on('wallDestroyed', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentWallDestroyed', {
      row: data.row,
      col: data.col
    });
  });

  // Sự kiện nhặt item
  socket.on('itemCollected', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentItemCollected', {
      row: data.row,
      col: data.col
    });
  });

  /**
   * Event: disconnect
   */
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected in gameHandler: ${socket.user.username}`);
    matchmakingQueue.removePlayer(socket.id);
  });
};
