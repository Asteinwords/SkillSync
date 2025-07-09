const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');

// ✅ Create Room
router.post('/create', async (req, res) => {
  const { roomId, password, userId } = req.body;
  if (!roomId || !password || !userId)
    return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const room = new Room({
      roomId,
      password: hashedPassword,
      host: userId,
      participants: [{ user: userId }]
    });

    await room.save();
    res.json({ success: true, roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ✅ Join Room
router.post('/join', async (req, res) => {
  const { roomId, password, userId } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const match = await bcrypt.compare(password, room.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const existing = room.participants.find(p => p.user?.toString() === userId && !p.leftAt);

    if (!existing) {
      room.participants = room.participants.filter(p => p.user?.toString() !== userId);
      room.participants.push({ user: userId });
      await room.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Join Room Error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Leave Room
router.post('/leave', async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const participant = room.participants.find(
      p => p.user.toString() === userId && !p.leftAt
    );

    if (participant) {
      participant.leftAt = new Date();
      await room.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Active Rooms
router.get('/active', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const rooms = await Room.find({ 'participants.user': userId })
      .populate('host', 'name')
      .populate('participants.user', 'name');

    const active = rooms.filter(room =>
      room.participants.some(p => p.user?._id.toString() === userId && !p.leftAt)
    ).map(room => ({
      roomId: room.roomId,
      host: room.host.name,
      participants: room.participants.filter(p => !p.leftAt).length
    }));

    res.json(active);
  } catch (err) {
    console.error('❌ Error fetching active rooms:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Past Rooms
router.get('/history/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const rooms = await Room.find({ 'participants.user': userId })
      .populate('host', 'name')
      .populate('participants.user', 'name');

    const history = [];

    for (const room of rooms) {
      const participant = room.participants.find(
        p => p.user._id.toString() === userId && p.leftAt
      );
      if (participant) {
        history.push({
          roomId: room.roomId,
          host: room.host.name,
          joinedAt: participant.joinedAt,
          leftAt: participant.leftAt,
          participants: room.participants.length
        });
      }
    }

    res.json(history);
  } catch (err) {
    console.error('❌ Error fetching past rooms:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
