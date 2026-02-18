import { io } from "socket.io-client";
import { getToken, handleSessionExpired } from "../utils/auth.js";

let socket;
const SERVER_URL = 'http://localhost:3000';

export const initSocket = () => {
  const token = getToken();
  if (!token) return null;

  if (socket && socket.connected) return socket;

  // Nếu socket đã tạo nhưng bị disconnect, connect lại
  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(SERVER_URL, {
    auth: {
      token: token
    },
    transports: ['websocket'],
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
    // Kiểm tra nếu bị đá do đăng nhập nơi khác
    if (err.message && err.message.includes('SESSION_EXPIRED')) {
      handleSessionExpired();
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  // Lắng nghe event bị đá ra khi đăng nhập ở nơi khác
  socket.on('force_logout', (data) => {
    console.log('🚫 Force logout:', data.message);
    handleSessionExpired();
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    // Không set socket = null để tái sử dụng instance nếu cần
  }
};
