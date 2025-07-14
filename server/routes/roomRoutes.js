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
// router.post('/leave', async (req, res) => {
//   const { roomId, userId } = req.body;

//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room) return res.status(404).json({ error: 'Room not found' });
//     console.log(`[📤 API /leave] Request from userId=${userId}, roomId=${roomId}`);

//     const participant = room.participants.find(
//       p => p.user.toString() === userId && !p.leftAt
//     );

//     if (participant) {
//       participant.leftAt = new Date();
//       console.log(`✅ Marked user ${userId} as left at ${participant.leftAt}`);
//       await room.save();
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
router.post('/leave', async (req, res) => {
  const { roomId, userId } = req.body;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const part = room.participants.find(p => p.user.toString() === userId && !p.leftAt);
    if (part) {
      part.leftAt = new Date();
      await room.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ leave route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// routes/roomRoutes.js
// router.get('/active', async (req, res) => {
//   const { userId } = req.query;
//   console.log(`🔍 Checking active rooms for user: ${userId}`);

//   try {
//     const rooms = await Room.find({ "participants.user": userId });

//     const activeRooms = rooms.filter(room => {
//       const participant = room.participants.find(p => p.user.toString() === userId);

//       if (!participant || participant.leftAt) {
//         return false; // skip if left
//       }

//       return room.ended === false;
//     });

//     const result = activeRooms.map(r => ({
//       roomId: r.roomId,
//       host: r.host || "N/A",
//       participants: r.participants.length,
//     }));

//     console.log("[GET ACTIVE] Final active rooms:", result);
//     return res.json(result);
//   } catch (err) {
//     console.error("❌ Error in GET /active:", err);
//     return res.status(500).json({ error: "Failed to fetch active rooms" });
//   }
// });
router.get('/active', async (req, res) => {
  const { userId } = req.query;
  try {
    const rooms = await Room.find({ "participants.user": userId });
    const active = rooms.filter(r => {
      const p = r.participants.find(p => p.user.toString() === userId);
      return p && !p.leftAt && !r.ended;
    }).map(r => ({ roomId: r.roomId, host: r.host, participants: r.participants.length }));
    res.json(active);
  } catch (err) {
    console.error('❌ /active error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ Past Rooms
// ✅ Past Rooms - WITH DEBUGGING + FIXES
// router.get('/history/:userId', async (req, res) => {
//   const userId = req.params.userId;
//   console.log(`📦 Fetching history for user: ${userId}`);

//   try {
//     const rooms = await Room.find({ 'participants.user': userId })
//       .populate('host', 'name')
//       .populate('participants.user', 'name');

//     console.log(`🔍 Total rooms found: ${rooms.length}`);

//     const history = [];

//     for (const room of rooms) {
//       const participant = room.participants.find(
//         (p) => p.user._id.toString() === userId
//       );

//       console.log(`➡️ Checking room: ${room.roomId}`);
//       console.log(`   Room ended: ${room.ended}`);
//       console.log(`   Participant found: ${!!participant}`);
//       console.log(`   leftAt: ${participant?.leftAt}`);
//       console.log(`   joinedAt: ${participant?.joinedAt}`);

//       const shouldInclude =
//         (participant && participant.leftAt) || room.ended;

//       if (shouldInclude) {
//         const joinedAt = participant?.joinedAt || room.createdAt;
//         const leftAt = participant?.leftAt || room.updatedAt;

//         history.push({
//           roomId: room.roomId,
//           host: room.host?.name || 'Unknown',
//           joinedAt,
//           leftAt,
//           participants: room.participants.length,
//         });

//         console.log(`✅ Included room in history: ${room.roomId}`);
//       } else {
//         console.log(`⛔ Skipped room: ${room.roomId} (Not ended or left)`);
//       }
//     }

//     res.json(history);
//   } catch (err) {
//     console.error('❌ Error fetching past rooms:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// })
// 
// ;
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const rooms = await Room.find({ "participants.user": userId })
                           .populate('host', 'name')
                           .populate('participants.user', 'name');
    const history = rooms.filter(r => r.ended || r.participants.some(p => p.user._id.toString() === userId && p.leftAt))
      .map(r => {
        const part = r.participants.find(p => p.user._id.toString() === userId);
        const joined = part?.joinedAt || r.createdAt;
        const left = part?.leftAt || r.updatedAt;
        return {
          roomId: r.roomId,
          host: r.host?.name || 'Unknown',
          joinedAt: joined,
          leftAt: left,
          participants: r.participants.length
        };
      });
    res.json(history);
  } catch (err) {
    console.error('❌ /history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// DELETE /api/rooms/history/:roomId/:userId
// ✅ DELETE a user's room history (only their participation record)
router.delete('/history/:roomId/:userId', async (req, res) => {
  const { roomId, userId } = req.params;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Remove the participant's entry completely
    room.participants = room.participants.filter(
      (p) => p.user.toString() !== userId || !p.leftAt
    );

    await room.save();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting room history:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/:roomId/record', async (req, res) => {
  const { roomId } = req.params;
  const { userId, action } = req.body;
  const room = await Room.findOne({ roomId });
  if (!room || room.host.toString() !== userId) return res.status(403).send('Only host can start/stop recording');
  room.isRecording = action === 'start';
  await room.save();
  res.json({ success: true, isRecording: room.isRecording });
});

// Participant asks to record
router.post('/:roomId/request-record', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  const room = await Room.findOne({ roomId });
  if (!room) return res.status(404).send('Room not found');
  // Notify via Socket or set flag:
  room.recordRequests = room.recordRequests || [];
  room.recordRequests.push(userId);
  await room.save();
  // You should emit via Socket.IO HERE
  res.json({ success: true });
});


module.exports = router;
