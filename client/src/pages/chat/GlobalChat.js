import { initSocket } from '../../services/socket.js';
import { PrivateChatManager } from './PrivateChatManager.js';

let activePrivateManager = null;

export function getPrivateChatManager() {
    return activePrivateManager;
}

export function initGlobalChat(user) {
  const chatInput = document.getElementById('global-chat-input');
  const chatSendBtn = document.getElementById('global-chat-send');
  const chatMessages = document.getElementById('global-chat-messages');
  const tabWorld = document.getElementById('tab-world');
  const tabPrivate = document.getElementById('tab-private');

  if (!chatInput || !chatSendBtn || !chatMessages || !tabWorld || !tabPrivate) return;

  let currentChannel = 'world';
  const worldMessages = [];
  
  // Singleton-like manager for this session
  if (!activePrivateManager) {
    activePrivateManager = new PrivateChatManager(user);
  }
  const privateManager = activePrivateManager;

  // UI Callback for notifications
  privateManager.onNotification = ({ total, friendId, friendCount }) => {
    // Update Private Tab count
    if (total > 0) {
      tabPrivate.innerHTML = `Riêng Tư <span class="unread-badge">${total}</span>`;
      tabPrivate.classList.add('has-notification');
    } else {
      tabPrivate.innerHTML = 'Riêng Tư';
      tabPrivate.classList.remove('has-notification');
    }

    // Proactively update Friends Popup if it's open
    updateFriendsPopupUnread(friendId, friendCount);
  };

  const socket = initSocket();

  // Tab switching
  tabWorld.onclick = () => {
    currentChannel = 'world';
    tabWorld.classList.add('active');
    tabPrivate.classList.remove('active');
    tabWorld.classList.remove('has-notification');
    renderMessages();
  };

  tabPrivate.onclick = () => {
    currentChannel = 'private';
    tabPrivate.classList.add('active');
    tabWorld.classList.remove('active');
    tabPrivate.classList.remove('has-notification');
    renderMessages();
  };

  // Listen for direct chat from friends list
  window.addEventListener('start_private_chat', (e) => {
    privateManager.setActiveFriend(e.detail.id, e.detail.name);
    currentChannel = 'private';
    tabPrivate.classList.add('active');
    tabWorld.classList.remove('active');
    tabPrivate.classList.remove('has-notification');
    renderMessages();
  });

  const renderMessages = () => {
    chatMessages.innerHTML = '';
    const activeFriend = privateManager.getActiveFriend();
    
    if (currentChannel === 'private' && !activeFriend) {
      chatMessages.innerHTML = '<div class="chat-message system-message">Chọn một người bạn từ danh sách để nhắn tin</div>';
      return;
    }

    if (currentChannel === 'private' && activeFriend) {
      const header = document.createElement('div');
      header.className = 'chat-message system-message';
      header.innerText = `💬 Đang nhắn tin với ${activeFriend.name}`;
      chatMessages.appendChild(header);
    }

    const messages = currentChannel === 'world' ? worldMessages : privateManager.getMessages(activeFriend.id);
    messages.forEach(data => addMessageToUI(data));
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const addMessageToUI = (data) => {
    const isMe = privateManager.isMe(data);
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${isMe ? 'own-message' : ''}`;
    
    if (data.isError) {
      msgEl.className = 'chat-message system-message text-error';
      msgEl.style.color = '#ef4444';
      msgEl.innerText = data.message;
      chatMessages.appendChild(msgEl);
      return;
    }

    let authorColor = (data.tier === 'vip') ? '#fbbf24' : '#60a5fa';
    if (currentChannel === 'private' && !isMe) authorColor = '#ec4899';
    if (isMe) authorColor = '#34d399';

    msgEl.innerHTML = `
      <span class="message-author" style="color: ${authorColor}">
        ${data.tier === 'vip' ? '👑 ' : ''}${data.sender}:
      </span>
      <span class="message-content">${data.message}</span>
    `;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  if (socket) {
    socket.removeAllListeners('global_chat_message');
    socket.removeAllListeners('private_message');
    socket.removeAllListeners('private_message_sent');
    socket.removeAllListeners('private_message_error');

    socket.on('global_chat_message', (data) => {
      worldMessages.push(data);
      if (currentChannel === 'world') {
        addMessageToUI(data);
      } else {
        tabWorld.classList.add('has-notification');
      }
    });

    socket.on('private_message', (data) => {
      privateManager.addMessage(data.senderId, data, false);
      const activeFriend = privateManager.getActiveFriend();
      if (currentChannel === 'private' && activeFriend?.id === data.senderId) {
        addMessageToUI(data);
      }
    });

    socket.on('private_message_sent', (data) => {
      privateManager.addMessage(data.to, data, true);
      const activeFriend = privateManager.getActiveFriend();
      if (currentChannel === 'private' && activeFriend?.id === data.to) {
        addMessageToUI(data);
      }
    });

    socket.on('private_message_error', (data) => {
      const activeFriend = privateManager.getActiveFriend();
      if (currentChannel === 'private' && activeFriend?.id === data.to) {
        addMessageToUI({ isError: true, message: data.message });
      }
    });
  }

  const sendMessage = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    if (socket && socket.connected) {
      if (currentChannel === 'world') {
        socket.emit('global_chat_message', text);
      } else {
        const activeFriend = privateManager.getActiveFriend();
        if (activeFriend) {
          socket.emit('private_message', { to: activeFriend.id, message: text });
        }
      }
      chatInput.value = '';
      chatInput.focus();
    }
  };

  chatSendBtn.onclick = sendMessage;
  chatInput.onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
}

function updateFriendsPopupUnread(friendId, count) {
    if (!friendId) return;
    const friendItem = document.querySelector(`.chat-friend-btn[data-id="${friendId}"]`);
    if (friendItem) {
        let badge = friendItem.querySelector('.friend-unread-badge');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'friend-unread-badge';
                friendItem.appendChild(badge);
            }
            badge.innerText = count;
        } else if (badge) {
            badge.remove();
        }
    }
}
