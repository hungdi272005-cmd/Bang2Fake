/**
 * Chat Socket Handler - Handles global and private chat messages
 */
module.exports = (io, socket) => {
  const userId = socket.user._id.toString();

  // Event: global_chat_message
  socket.on('global_chat_message', (message) => {
    if (!message || message.trim().length === 0) return;
    if (message.length > 100) message = message.substring(0, 100);

    const chatData = {
      id: Date.now().toString(),
      sender: socket.user.displayName || socket.user.username,
      senderId: userId,
      messageSide: 'left', // Default for others
      message: message,
      tier: socket.user.vipLevel > 0 ? 'vip' : 'normal',
      timestamp: new Date()
    };

    io.to('global_chat').emit('global_chat_message', chatData);
  });

  // Event: private_message
  socket.on('private_message', (data) => {
    const { to, message } = data;
    if (!to || !message || message.trim().length === 0) return;

    // KIỂM TRA ONLINE: Tìm room của người nhận
    const recipientRoom = io.sockets.adapter.rooms.get(`user:${to}`);
    if (!recipientRoom || recipientRoom.size === 0) {
      socket.emit('private_message_error', {
        to,
        message: 'Người dùng này hiện không online'
      });
      return;
    }

    const chatData = {
      id: Date.now().toString(),
      sender: socket.user.displayName || socket.user.username,
      senderId: userId,
      message: message.substring(0, 100),
      timestamp: new Date()
    };

    // Gửi cho người nhận
    io.to(`user:${to}`).emit('private_message', chatData);
    
    // Gửi lại cho người gửi (để đồng bộ UI)
    socket.emit('private_message_sent', { ...chatData, to });
    
    console.log(`📩 Private: ${socket.user.username} -> ${to}`);
  });
};
