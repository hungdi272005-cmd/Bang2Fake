/**
 * Private Chat Manager - Handles state and notifications for private messages
 */
export class PrivateChatManager {
    constructor(user) {
        this.user = user;
        this.activeFriend = null; // { id, name }
        this.privateMessages = {}; // friendId -> messages[]
        this.unreadCounts = {}; // friendId -> count
        this.onNotification = null; // Callback for UI updates (totalCount, friendId, friendCount)
    }

    setActiveFriend(friendId, friendName) {
        this.activeFriend = { id: friendId, name: friendName };
        // Reset unread count for this friend when we start chatting
        this.unreadCounts[friendId] = 0;
        this.notifyUI();
    }

    getActiveFriend() {
        return this.activeFriend;
    }

    addMessage(friendId, messageData, isMe = false) {
        if (!this.privateMessages[friendId]) {
            this.privateMessages[friendId] = [];
        }
        
        this.privateMessages[friendId].push(messageData);

        // Update unread count if message is from a friend and we're not currently chatting with them
        if (!isMe && (!this.activeFriend || this.activeFriend.id !== friendId)) {
            this.unreadCounts[friendId] = (this.unreadCounts[friendId] || 0) + 1;
            this.notifyUI(friendId);
        }
    }

    getMessages(friendId) {
        return this.privateMessages[friendId] || [];
    }

    getUnreadCount(friendId) {
        return this.unreadCounts[friendId] || 0;
    }

    getTotalUnreadCount() {
        return Object.values(this.unreadCounts).reduce((sum, count) => sum + count, 0);
    }

    notifyUI(friendId = null) {
        if (this.onNotification) {
            const total = this.getTotalUnreadCount();
            this.onNotification({
                total,
                friendId,
                friendCount: friendId ? (this.unreadCounts[friendId] || 0) : 0
            });
        }
    }

    isMe(data) {
        const myId = this.user._id || this.user.id;
        return data.senderId === myId || data.sender === (this.user.displayName || this.user.username);
    }
}
