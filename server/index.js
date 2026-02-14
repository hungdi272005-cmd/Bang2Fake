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
  socket.on('findMatch', async (data) => {
    console.log(`🔍 ${socket.user.username} đang tìm trận...`);

    const playerData = {
      userId: socket.user._id.toString(),
      username: socket.user.username,
      socketId: socket.id,
      tank: data.tank || socket.user.selectedTank
    };

    // Thêm vào matchmaking queue
    const match = await matchmakingQueue.addPlayer(playerData);

    if (match) {
      // Đã tìm được trận, notify cả 2 players
      const [player1, player2] = match.players;

      io.to(player1.socketId).emit('matchFound', {
        sessionId: match.sessionId,
        opponent: {
          username: player2.username,
          tank: player2.tank
        },
        yourTank: player1.tank
      });

      io.to(player2.socketId).emit('matchFound', {
        sessionId: match.sessionId,
        opponent: {
          username: player1.username,
          tank: player1.tank
        },
        yourTank: player2.tank
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
   * Event: gameInput - Xử lý input trong game
   * TODO: Implement game logic
   */
  socket.on('gameInput', (data) => {
    // Broadcast input tới session room
    socket.to(data.sessionId).emit('opponentInput', {
      playerId: socket.user._id.toString(),
      input: data.input
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
