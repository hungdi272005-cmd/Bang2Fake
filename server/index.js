require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const { socketAuth } = require('./middleware/auth');
const matchmakingQueue = require('./services/matchmaking');

// Kết nối Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Attach Socket.io to request for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('<h1>🎮 Máy chủ Tank Bang Bang đang chạy</h1>');
});

// Auth routes
app.use('/api/auth', authRoutes);

// Payment routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

// Checkin routes
const checkinRoutes = require('./routes/checkin');
app.use('/api/checkin', checkinRoutes);

// Spin routes
const spinRoutes = require('./routes/spin');
app.use('/api/spin', spinRoutes);

// Rune routes
const runeRoutes = require('./routes/rune');
app.use('/api/runes', runeRoutes);

// Event routes
const eventRoutes = require('./routes/event');
app.use('/api/events', eventRoutes);

// Socket.io setup với CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Trong production nên chỉ định cụ thể origin
    credentials: true
  }
});

// Socket.io middleware: Xác thực JWT
io.use(socketAuth);

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

  // Join user-specific room for private notifications (like payment success)
  const userId = socket.user._id.toString();
  socket.join(`user:${userId}`);
  socket.join('global_chat'); // Join global chat room
  console.log(`👤 User ${socket.user.username} joined room: user:${userId} and global_chat`);

  /**
   * Event: global_chat_message
   */
  socket.on('global_chat_message', (message) => {
    // Basic validation
    if (!message || message.trim().length === 0) return;
    if (message.length > 100) message = message.substring(0, 100);

    const chatData = {
      id: Date.now().toString(),
      sender: socket.user.displayName || socket.user.username,
      senderId: userId,
      message: message,
      tier: socket.user.vipLevel > 0 ? 'vip' : 'normal',
      timestamp: new Date()
    };

    // Broadcast to everyone in global_chat
    io.to('global_chat').emit('global_chat_message', chatData);
  });

  /**
   * Event: findMatch - Tìm trận đấu
   */
  socket.on('findMatch', async () => {
    console.log(`🔍 ${socket.user.username} đang tìm trận...`);

    const playerData = {
      userId: socket.user._id.toString(),
      username: socket.user.username,
      displayName: socket.user.displayName || socket.user.username,
      socketId: socket.id
    };

    // Thêm vào matchmaking queue
    const match = await matchmakingQueue.addPlayer(playerData);

    if (match) {
      // Đã tìm được trận, notify cả 2 players
      const [player1, player2] = match.players;

      // Cả 2 join session room
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
      // Chưa đủ người, thông báo đang chờ
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
    const userId = socket.user._id.toString();

    const session = matchmakingQueue.selectTank(sessionId, userId, tankId);
    if (session) {
      // Broadcast cho đối thủ biết mình chọn tank gì
      socket.to(`session:${sessionId}`).emit('opponentSelectTank', {
        tankId
      });
      console.log(`🎯 ${socket.user.username} chọn tank: ${tankId}`);
    }
  });

  /**
   * Event: confirmReady - Xác nhận sẵn sàng
   */
  socket.on('confirmReady', (data) => {
    const { sessionId } = data;
    const userId = socket.user._id.toString();

    const result = matchmakingQueue.confirmReady(sessionId, userId);

    // Broadcast cho đối thủ biết mình đã ready
    socket.to(`session:${sessionId}`).emit('opponentReady', {
      userId
    });

    if (result.allReady) {
      // Cả 2 đều ready → bắt đầu game!
      const session = result.session;
      const players = Object.values(session.players);

      console.log(`🚀 All ready! Starting game for session: ${sessionId}`);

      // Emit allReady cho cả 2 player
      io.to(`session:${sessionId}`).emit('allReady', {
        sessionId,
        players: players.map(p => ({
          userId: p.userId,
          username: p.username,
          displayName: p.displayName,
          tank: p.tank
        }))
      });

      // Cleanup session từ matchmaking queue (game đã bắt đầu)
      matchmakingQueue.removeSession(sessionId);
    }
  });

  /**
   * Event: playerUpdate - Đồng bộ vị trí/rotation (~20 tick/s)
   * Relay trực tiếp cho đối thủ trong session room
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

  /**
   * Event: playerShoot - Thông báo bắn đạn
   */
  socket.on('playerShoot', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentShoot', {
      x: data.x,
      y: data.y,
      angle: data.angle,
      damage: data.damage,
      bulletSpeed: data.bulletSpeed
    });
  });

  /**
   * Event: playerSkill - Thông báo dùng skill
   */
  socket.on('playerSkill', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentSkill', {
      skillKey: data.skillKey,
      x: data.x,
      y: data.y,
      angle: data.angle
    });
  });

  /**
   * Event: playerEffect - Thông báo gây effect (damage, stun, slow, silence)
   * Relay toàn bộ data cho đối thủ áp dụng
   */
  socket.on('playerEffect', (data) => {
    socket.to(`session:${data.sessionId}`).emit('opponentEffect', {
      type: data.type,
      params: data.params
    });
  });

  /**
   * Event: disconnect
   */
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);
    // Xóa khỏi queue nếu đang chờ
    matchmakingQueue.removePlayer(socket.id);
    
    // TODO: Xử lý disconnect trong game (player rời giữa trận)
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
