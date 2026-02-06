# Tank Bang Bang - Backend

## Cài Đặt

### 1. Install Dependencies
```bash
npm install mongoose bcryptjs jsonwebtoken cors dotenv uuid
```

### 2. Setup MongoDB
Cài đặt MongoDB trên máy local hoặc sử dụng MongoDB Atlas (cloud)

**Option A: MongoDB Local**
- Tải và cài đặt MongoDB Community Server: https://www.mongodb.com/try/download/community
- Chạy MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Đăng ký tài khoản miễn phí tại: https://www.mongodb.com/cloud/atlas
- Tạo cluster mới
- Lấy connection string
- Cập nhật `MONGODB_URI` trong file `.env`

### 3. Config Environment Variables
File `.env` đã được tạo sẵn với config mẫu. Nếu dùng MongoDB Atlas, update `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tankbangbang
```

### 4. Chạy Server
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## API Endpoints

### Authentication

#### 1. Register (Đăng ký)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "phone": "0912345678",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "phone": "0912345678",
    "stats": {
      "gamesPlayed": 0,
      "wins": 0,
      "losses": 0,
      "kills": 0,
      "deaths": 0
    },
    "selectedTank": "Gundam",
    "createdAt": "2026-02-06T09:14:31.000Z"
  }
}
```

#### 2. Login (Đăng nhập)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "123456"
}
```

**Response:** Giống như register

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "stats": { ... },
    "selectedTank": "Gundam",
    "createdAt": "2026-02-06T09:14:31.000Z",
    "lastLogin": "2026-02-06T09:20:15.000Z"
  }
}
```

## Socket.io Events

### Connection
Client phải gửi JWT token khi connect:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### 1. Find Match (Tìm trận)
```javascript
socket.emit('findMatch', {
  tank: 'Gundam' // Optional, default là selectedTank của user
});
```

**Server Response:**
- Nếu chưa đủ người:
```javascript
socket.on('searching', (data) => {
  // data = { message: 'Đang tìm đối thủ...', queueSize: 1 }
});
```

- Nếu đã tìm được trận:
```javascript
socket.on('matchFound', (data) => {
  // data = {
  //   sessionId: 'uuid-session-id',
  //   opponent: { username: 'player2', tank: 'Phoenix' },
  //   yourTank: 'Gundam'
  // }
});
```

#### 2. Cancel Match (Hủy tìm trận)
```javascript
socket.emit('cancelMatch');
```

**Server Response:**
```javascript
socket.on('matchCancelled', (data) => {
  // data = { message: 'Đã hủy tìm trận' }
});
```

#### 3. Game Input (Gửi input trong game)
```javascript
socket.emit('gameInput', {
  sessionId: 'uuid-session-id',
  input: { /* game input data */ }
});
```

**Receive Opponent Input:**
```javascript
socket.on('opponentInput', (data) => {
  // data = { playerId: 'user-id', input: { ... } }
});
```

## File Structure
```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Auth logic (register, login, getMe)
├── middleware/
│   └── auth.js              # JWT middleware (HTTP + Socket.io)
├── models/
│   ├── User.js              # User schema
│   └── GameSession.js       # Game session schema
├── routes/
│   └── auth.js              # Auth routes
├── services/
│   └── matchmaking.js       # Matchmaking queue
├── .env                     # Environment variables
├── index.js                 # Main server file
└── package.json
```

## Testing với Postman/Thunder Client

### 1. Test Register
```
POST http://localhost:3000/api/auth/register
Body: { "username": "test1", "phone": "0912345678", "password": "123456" }
```

### 2. Test Login
```
POST http://localhost:3000/api/auth/login
Body: { "username": "test1", "password": "123456" }
```
Copy `token` từ response

### 3. Test Protected Route
```
GET http://localhost:3000/api/auth/me
Headers: Authorization: Bearer <paste-token-here>
```

## Next Steps
- [ ] Cài đặt dependencies
- [ ] Setup MongoDB
- [ ] Test API endpoints
- [ ] Implement Frontend (Landing page, Auth page, Lobby page)
- [ ] Connect Frontend với Backend APIs
- [ ] Connect Phaser game với Socket.io matchmaking
