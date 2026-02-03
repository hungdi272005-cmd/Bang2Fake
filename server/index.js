const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả kết nối (tạm thời)
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Máy chủ Tank Bang Bang đang chạy</h1>');
});

io.on('connection', (socket) => {
  console.log('một người dùng đã kết nối: ' + socket.id);
  
  socket.on('disconnect', () => {
    console.log('người dùng đã ngắt kết nối');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
