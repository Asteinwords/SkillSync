const Message = require('../models/Message');

// GET /api/chat/:roomId
exports.getHistory = async (req, res) => {
  try {
    const msgs = await Message
      .find({ roomId: req.params.roomId })
      .sort({ time: 1 });
    res.json(msgs);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ message: 'Error loading chat history' });
  }
};

// POST /api/chat/send
exports.postMessage = async (req, res) => {
  const { roomId, from, to, message, time } = req.body;
  try {
    const saved = await Message.create({ roomId, from, to, message, time });
    res.json(saved);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ message: 'Error saving message' });
  }
};
