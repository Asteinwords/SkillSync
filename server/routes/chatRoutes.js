const express = require('express');
const router = express.Router();
const { getHistory, postMessage, getUnreadCount, markMessagesRead, deleteForMe, deleteForEveryone, getRecentChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:roomId', protect, getHistory);
router.post('/send', protect, postMessage);
router.get('/unread-count', protect, getUnreadCount);
router.post('/mark-read', protect, markMessagesRead);
router.delete('/messages/delete-for-me', protect, deleteForMe);
router.delete('/messages/delete-for-everyone', protect, deleteForEveryone);
router.get('/recent', protect, getRecentChats);
module.exports = router;