import { authFetch } from '../../../utils/auth.js';
import { getPrivateChatManager } from '../../chat/GlobalChat.js';

export function openFriendsPopup(onStartChat) {
    const existingPopup = document.getElementById('friends-popup');
    if (existingPopup) existingPopup.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'friends-popup';
    
    overlay.innerHTML = `
        <div class="modal-container glass-card friends-modal">
            <div class="modal-header">
                <span class="modal-icon">👥</span>
                <h3 class="modal-title">Bạn bè</h3>
                <button class="close-modal" id="close-friends-popup">×</button>
            </div>
            
            <div class="friends-tabs">
                <button class="friends-tab active" data-tab="list">Danh sách</button>
                <button class="friends-tab" data-tab="requests">Lời mời</button>
                <button class="friends-tab" data-tab="add">Kết bạn</button>
            </div>

            <div class="friends-content" id="friends-tab-list">
                <div class="friends-list" id="friends-list-container">
                    <p class="text-muted text-center mt-md">Đang tải...</p>
                </div>
            </div>

            <div class="friends-content hidden" id="friends-tab-requests">
                <div class="friends-list" id="requests-list-container">
                    <p class="text-muted text-center mt-md">Đang tải...</p>
                </div>
            </div>

            <div class="friends-content hidden" id="friends-tab-add">
                <div class="search-box mb-md">
                    <input type="text" id="search-friend-input" class="form-input" placeholder="Nhập tên người chơi...">
                    <button class="btn btn-primary" id="search-friend-btn">Tìm</button>
                </div>
                <div id="search-results-container">
                    <p class="text-muted text-center">Nhập tên để tìm kiếm bạn bè</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);

    const closeBtn = overlay.querySelector('#close-friends-popup');
    closeBtn.onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };

    // Tab switching
    const tabs = overlay.querySelectorAll('.friends-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.dataset.tab;
            overlay.querySelector('#friends-tab-list').classList.toggle('hidden', target !== 'list');
            overlay.querySelector('#friends-tab-requests').classList.toggle('hidden', target !== 'requests');
            overlay.querySelector('#friends-tab-add').classList.toggle('hidden', target !== 'add');
            
            if (target === 'list') loadFriendList();
            if (target === 'requests') loadFriendRequests();
        };
    });

    // Initial load
    loadFriendList();

    // Search logic
    const searchBtn = overlay.querySelector('#search-friend-btn');
    const searchInput = overlay.querySelector('#search-friend-input');
    
    searchBtn.onclick = async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        
        const resultsContainer = overlay.querySelector('#search-results-container');
        resultsContainer.innerHTML = '<p class="text-center">Đang tìm...</p>';
        
        try {
            const data = await authFetch(`http://localhost:3000/api/friends/search?query=${query}`);
            if (data.users.length === 0) {
                resultsContainer.innerHTML = '<p class="text-center">Không tìm thấy người chơi nào</p>';
                return;
            }
            
            resultsContainer.innerHTML = '';
            data.users.forEach(user => {
                const userEl = document.createElement('div');
                userEl.className = 'friend-item';
                userEl.innerHTML = `
                    <div class="friend-info">
                        <div class="friend-avatar">${user.avatar === 'male' ? '👨' : '👩'}</div>
                        <span>${user.displayName || user.username}</span>
                    </div>
                    <button class="btn btn-primary btn-sm add-friend-btn" data-id="${user._id}">Kết bạn</button>
                `;
                resultsContainer.appendChild(userEl);
            });
            
            // Add friend events
            resultsContainer.querySelectorAll('.add-friend-btn').forEach(btn => {
                btn.onclick = async () => {
                    try {
                        await authFetch('http://localhost:3000/api/friends/request', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ targetUserId: btn.dataset.id })
                        });
                        btn.innerText = 'Đã gửi';
                        btn.disabled = true;
                    } catch (err) {
                        alert(err.message);
                    }
                };
            });
        } catch (err) {
            resultsContainer.innerHTML = `<p class="text-center text-error">${err.message}</p>`;
        }
    };

    async function loadFriendList() {
        const listContainer = overlay.querySelector('#friends-list-container');
        const privateManager = getPrivateChatManager();
        
        try {
            const data = await authFetch('http://localhost:3000/api/friends');
            if (data.friends.length === 0) {
                listContainer.innerHTML = '<p class="text-muted text-center mt-md">Bạn chưa có bạn bè nào</p>';
                return;
            }
            
            listContainer.innerHTML = '';
            data.friends.forEach(friend => {
                const unreadCount = privateManager ? privateManager.getUnreadCount(friend._id) : 0;
                const friendEl = document.createElement('div');
                friendEl.className = 'friend-item clickable';
                friendEl.innerHTML = `
                    <div class="friend-info">
                        <div class="friend-avatar">${friend.avatar === 'male' ? '👨' : '👩'}</div>
                        <div class="friend-details">
                            <div class="friend-name">${friend.displayName || friend.username}</div>
                            <div class="friend-status online">Online</div>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm chat-friend-btn" data-id="${friend._id}" data-name="${friend.displayName || friend.username}">
                        Nhắn tin
                        ${unreadCount > 0 ? `<span class="friend-unread-badge">${unreadCount}</span>` : ''}
                    </button>
                `;
                listContainer.appendChild(friendEl);
            });
            
            // Click to chat
            listContainer.querySelectorAll('.chat-friend-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    overlay.classList.remove('show');
                    setTimeout(() => {
                        overlay.remove();
                        if (onStartChat) onStartChat(btn.dataset.id, btn.dataset.name);
                    }, 300);
                };
            });
        } catch (err) {
            listContainer.innerHTML = `<p class="text-center text-error">${err.message}</p>`;
        }
    }

    async function loadFriendRequests() {
        const listContainer = overlay.querySelector('#requests-list-container');
        try {
            const data = await authFetch('http://localhost:3000/api/friends/requests');
            if (!data.requests || data.requests.length === 0) {
                listContainer.innerHTML = '<p class="text-muted text-center mt-md">Không có lời mời nào</p>';
                return;
            }
            
            listContainer.innerHTML = '';
            data.requests.forEach(req => {
                const friend = req.from;
                const reqEl = document.createElement('div');
                reqEl.className = 'friend-item';
                reqEl.innerHTML = `
                    <div class="friend-info">
                        <div class="friend-avatar">${friend.avatar === 'male' ? '👨' : '👩'}</div>
                        <div class="friend-details">
                            <div class="friend-name">${friend.displayName || friend.username}</div>
                            <div class="friend-status">Muốn kết bạn với bạn</div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm accept-btn" data-id="${friend._id}">Chấp nhận</button>
                        <button class="btn btn-secondary btn-sm reject-btn" data-id="${friend._id}">Từ chối</button>
                    </div>
                `;
                listContainer.appendChild(reqEl);
            });
            
            // Action bindings
            listContainer.querySelectorAll('.accept-btn').forEach(btn => {
                btn.onclick = () => respondToRequest(btn.dataset.id, 'accepted');
            });
            listContainer.querySelectorAll('.reject-btn').forEach(btn => {
                btn.onclick = () => respondToRequest(btn.dataset.id, 'rejected');
            });
            
        } catch (err) {
            listContainer.innerHTML = `<p class="text-center text-error">${err.message}</p>`;
        }
    }

    async function respondToRequest(fromUserId, action) {
        try {
            await authFetch('http://localhost:3000/api/friends/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId, action })
            });
            // Reload requests list
            loadFriendRequests();
        } catch (err) {
            alert(err.message);
        }
    }
}
