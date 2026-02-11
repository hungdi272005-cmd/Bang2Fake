import { initSocket } from '../../services/socket.js';

export function initGlobalChat(user) {
  const chatInput = document.getElementById('global-chat-input');
  const chatSendBtn = document.getElementById('global-chat-send');
  const chatMessages = document.getElementById('global-chat-messages');

  console.log('💬 Initializing Global Chat...', { chatInput, chatSendBtn, chatMessages });

  if (chatInput && chatSendBtn && chatMessages) {
    const socket = initSocket();
    
    console.log('🔌 Chat Socket Status:', socket ? 'Connected' : 'Disconnected', socket?.id);

    // Listener for incoming messages
    if (socket) {
        console.log(`🔌 Setup Global Chat Listener for Socket ${socket.id}`);
        // Remove old listeners to prevent duplicates on socket
        socket.removeAllListeners('global_chat_message'); 
        
        const handledMessageIds = new Set();
        
        socket.on('global_chat_message', (data) => {
            console.log('📩 Received chat message:', data);
            
            // Deduplication check
            if (handledMessageIds.has(data.id)) {
                console.warn('⚠️ Duplicate message received, ignoring:', data.id);
                return;
            }
            handledMessageIds.add(data.id);
            
            // Limit set size
            if (handledMessageIds.size > 100) {
                const first = handledMessageIds.values().next().value;
                handledMessageIds.delete(first);
            }

            const isMe = data.senderId === user.id || data.sender === (user.displayName || user.username);
            
            const msgEl = document.createElement('div');
            msgEl.className = `chat-message ${isMe ? 'own-message' : ''}`;
            msgEl.innerHTML = `
                <span class="message-author" style="color: ${data.tier === 'vip' ? '#fbbf24' : '#60a5fa'}">
                  ${data.tier === 'vip' ? '👑 ' : ''}${data.sender}:
                </span>
                <span class="message-content">${data.message}</span>
            `;
            
            chatMessages.appendChild(msgEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // Send function
    const sendMessage = () => {
        const text = chatInput.value.trim();
        console.log('📤 Sending message:', text);
        if (!text) return;
        
        if (socket && socket.connected) {
            socket.emit('global_chat_message', text);
            chatInput.value = '';
            chatInput.focus();
        } else {
            console.error('❌ Socket not connected, cannot send message');
            // Try to reconnect?
            initSocket();
        }
    };

    // DOM elements are fresh because page re-rendered, so just add listeners
    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
  }
}
