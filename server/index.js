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

// Sockets Handlers
const registerChatHandlers = require('./sockets/chatHandler');
const registerGameHandlers = require('./sockets/gameHandler');

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

// Other API routes
app.use('/api/payment', require('./routes/payment'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/spin', require('./routes/spin'));
app.use('/api/runes', require('./routes/rune'));
app.use('/api/events', require('./routes/event'));
app.use('/api/friends', require('./routes/friend'));

// Socket.io setup với CORS
const io = new Server(server, {
  cors: {
    origin: "*", 
    credentials: true
  }
});

io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

  // Basic setup for each connected user
  const userId = socket.user._id.toString();
  socket.join(`user:${userId}`);
  socket.join('global_chat');
  
  // Register modular handlers
  registerChatHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
