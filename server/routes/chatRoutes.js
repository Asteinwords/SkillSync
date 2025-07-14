const express = require('express');
const router = express.Router();
const { getHistory, postMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

router.get('/:roomId', protect, getHistory);
router.post('/send', protect, postMessage);

// 🧹 Soft delete for current user
router.delete('/messages', protect, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!Array.isArray(messageIds) || !userId) {
      return res.status(400).json({ error: 'Message IDs and userId required' });
    }

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { deletedBy: userId } }
    );

    res.status(200).json({ message: 'Messages deleted for current user only' });
  } catch (err) {
    console.error('❌ Error in deleting messages for user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
