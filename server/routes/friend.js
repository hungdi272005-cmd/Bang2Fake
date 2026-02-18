const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  getFriendRequests
} = require('../controllers/friendController');

// All routes are protected
router.use(protect);

router.get('/search', searchUsers);
router.get('/requests', getFriendRequests);
router.post('/request', sendFriendRequest);
router.post('/respond', respondToFriendRequest);
router.get('/', getFriends);

module.exports = router;
