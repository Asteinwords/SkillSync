const express = require('express');
const router = express.Router();
const { getHistory, postMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:roomId', protect, getHistory);
router.post('/send', protect, postMessage);

module.exports = router;
