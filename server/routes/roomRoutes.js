// const express = require('express');
// const router = express.Router();
// const Room = require('../models/Room');
// const bcrypt = require('bcryptjs');

// // ✅ Create Room
// router.post('/create', async (req, res) => {
//   const { roomId, password, userId } = req.body;
//   if (!roomId || !password || !userId)
//     return res.status(400).json({ success: false, error: "Missing fields" });

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const room = new Room({
//       roomId,
//       password: hashedPassword,
//       host: userId,
//       participants: [{ user: userId }]
//     });

//     await room.save();
//     res.json({ success: true, roomId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });

// // ✅ Join Room
// router.post('/join', async (req, res) => {
//   const { roomId, password, userId } = req.body;

//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room) return res.status(404).json({ error: 'Room not found' });

//     const match = await bcrypt.compare(password, room.password);
//     if (!match) return res.status(401).json({ error: 'Incorrect password' });

//     const existing = room.participants.find(p => p.user?.toString() === userId && !p.leftAt);

//     if (!existing) {
//       room.participants = room.participants.filter(p => p.user?.toString() !== userId);
//       room.participants.push({ user: userId });
//       await room.save();
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error('[Join Room Error]', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ✅ Leave Room
// // router.post('/leave', async (req, res) => {
// //   const { roomId, userId } = req.body;

// //   try {
// //     const room = await Room.findOne({ roomId });
// //     if (!room) return res.status(404).json({ error: 'Room not found' });
// //     console.log(`[📤 API /leave] Request from userId=${userId}, roomId=${roomId}`);

// //     const participant = room.participants.find(
// //       p => p.user.toString() === userId && !p.leftAt
// //     );

// //     if (participant) {
// //       participant.leftAt = new Date();
// //       console.log(`✅ Marked user ${userId} as left at ${participant.leftAt}`);
// //       await room.save();
// //     }

// //     res.json({ success: true });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // });
// router.post('/leave', async (req, res) => {
//   const { roomId, userId } = req.body;
//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room) return res.status(404).json({ error: 'Room not found' });

//     const part = room.participants.find(p => p.user.toString() === userId && !p.leftAt);
//     if (part) {
//       part.leftAt = new Date();
//       await room.save();
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error('❌ leave route error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // routes/roomRoutes.js
// // router.get('/active', async (req, res) => {
// //   const { userId } = req.query;
// //   console.log(`🔍 Checking active rooms for user: ${userId}`);

// //   try {
// //     const rooms = await Room.find({ "participants.user": userId });

// //     const activeRooms = rooms.filter(room => {
// //       const participant = room.participants.find(p => p.user.toString() === userId);

// //       if (!participant || participant.leftAt) {
// //         return false; // skip if left
// //       }

// //       return room.ended === false;
// //     });

// //     const result = activeRooms.map(r => ({
// //       roomId: r.roomId,
// //       host: r.host || "N/A",
// //       participants: r.participants.length,
// //     }));

// //     console.log("[GET ACTIVE] Final active rooms:", result);
// //     return res.json(result);
// //   } catch (err) {
// //     console.error("❌ Error in GET /active:", err);
// //     return res.status(500).json({ error: "Failed to fetch active rooms" });
// //   }
// // });
// router.get('/active', async (req, res) => {
//   const { userId } = req.query;
//   try {
//     const rooms = await Room.find({ "participants.user": userId });
//     const active = rooms.filter(r => {
//       const p = r.participants.find(p => p.user.toString() === userId);
//       return p && !p.leftAt && !r.ended;
//     }).map(r => ({ roomId: r.roomId, host: r.host, participants: r.participants.length }));
//     res.json(active);
//   } catch (err) {
//     console.error('❌ /active error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// // ✅ Past Rooms
// // ✅ Past Rooms - WITH DEBUGGING + FIXES
// // router.get('/history/:userId', async (req, res) => {
// //   const userId = req.params.userId;
// //   console.log(`📦 Fetching history for user: ${userId}`);

// //   try {
// //     const rooms = await Room.find({ 'participants.user': userId })
// //       .populate('host', 'name')
// //       .populate('participants.user', 'name');

// //     console.log(`🔍 Total rooms found: ${rooms.length}`);

// //     const history = [];

// //     for (const room of rooms) {
// //       const participant = room.participants.find(
// //         (p) => p.user._id.toString() === userId
// //       );

// //       console.log(`➡️ Checking room: ${room.roomId}`);
// //       console.log(`   Room ended: ${room.ended}`);
// //       console.log(`   Participant found: ${!!participant}`);
// //       console.log(`   leftAt: ${participant?.leftAt}`);
// //       console.log(`   joinedAt: ${participant?.joinedAt}`);

// //       const shouldInclude =
// //         (participant && participant.leftAt) || room.ended;

// //       if (shouldInclude) {
// //         const joinedAt = participant?.joinedAt || room.createdAt;
// //         const leftAt = participant?.leftAt || room.updatedAt;

// //         history.push({
// //           roomId: room.roomId,
// //           host: room.host?.name || 'Unknown',
// //           joinedAt,
// //           leftAt,
// //           participants: room.participants.length,
// //         });

// //         console.log(`✅ Included room in history: ${room.roomId}`);
// //       } else {
// //         console.log(`⛔ Skipped room: ${room.roomId} (Not ended or left)`);
// //       }
// //     }

// //     res.json(history);
// //   } catch (err) {
// //     console.error('❌ Error fetching past rooms:', err);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // })
// // 
// // ;
// router.get('/history/:userId', async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const rooms = await Room.find({ "participants.user": userId })
//                            .populate('host', 'name')
//                            .populate('participants.user', 'name');
//     const history = rooms.filter(r => r.ended || r.participants.some(p => p.user._id.toString() === userId && p.leftAt))
//       .map(r => {
//         const part = r.participants.find(p => p.user._id.toString() === userId);
//         const joined = part?.joinedAt || r.createdAt;
//         const left = part?.leftAt || r.updatedAt;
//         return {
//           roomId: r.roomId,
//           host: r.host?.name || 'Unknown',
//           joinedAt: joined,
//           leftAt: left,
//           participants: r.participants.length
//         };
//       });
//     res.json(history);
//   } catch (err) {
//     console.error('❌ /history error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// // DELETE /api/rooms/history/:roomId/:userId
// // ✅ DELETE a user's room history (only their participation record)
// router.delete('/history/:roomId/:userId', async (req, res) => {
//   const { roomId, userId } = req.params;

//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room) return res.status(404).json({ error: 'Room not found' });

//     // Remove the participant's entry completely
//     room.participants = room.participants.filter(
//       (p) => p.user.toString() !== userId || !p.leftAt
//     );

//     await room.save();
//     res.json({ success: true });
//   } catch (err) {
//     console.error('❌ Error deleting room history:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// router.post('/:roomId/record', async (req, res) => {
//   const { roomId } = req.params;
//   const { userId, action } = req.body;
//   const room = await Room.findOne({ roomId });
//   if (!room || room.host.toString() !== userId) return res.status(403).send('Only host can start/stop recording');
//   room.isRecording = action === 'start';
//   await room.save();
//   res.json({ success: true, isRecording: room.isRecording });
// });

// // Participant asks to record
// router.post('/:roomId/request-record', async (req, res) => {
//   const { roomId } = req.params;
//   const { userId } = req.body;
//   const room = await Room.findOne({ roomId });
//   if (!room) return res.status(404).send('Room not found');
//   // Notify via Socket or set flag:
//   room.recordRequests = room.recordRequests || [];
//   room.recordRequests.push(userId);
//   await room.save();
//   // You should emit via Socket.IO HERE
//   res.json({ success: true });
// });


// module.exports = router;

// router.post('/create', async (req, res) => {
//   const { roomId, password, userId } = req.body;
//   if (!roomId || !password || !userId)
//     return res.status(400).json({ success: false, error: "Missing fields" });

//   try {
//     // ✅ Load all rooms where this user is still in (leftAt missing or null)
//     const activeRooms = await Room.find({
//       'participants.user': userId,
//       'participants.leftAt': { $in: [null, undefined] },
//       ended: false
//     });

//     for (const room of activeRooms) {
//       const participantIndex = room.participants.findIndex(
//         (p) => p.user.toString() === userId && !p.leftAt
//       );

//       if (participantIndex !== -1) {
//         // ✅ Mark the user as left
//         room.participants[participantIndex].leftAt = new Date();

//         // ✅ If user was host, mark room as ended
//         if (room.host.toString() === userId) {
//           room.ended = true;
//           room.endedAt = new Date();
//         }

//         await room.save();
//         console.log(`[AutoLeave] User ${userId} left previous room ${room.roomId}`);
//       }
//     }

//     // ✅ Create the new room
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const room = new Room({
//       roomId,
//       password: hashedPassword,
//       host: userId,
//       participants: [{ user: userId, joinedAt: new Date() }]
//     });

//     await room.save();
//     console.log(`[CreateRoom] New room created: ${roomId}`);
//     res.json({ success: true, roomId });
//   } catch (err) {
//     console.error('[CreateRoom Error]', err);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });


// router.post('/join', async (req, res) => {
//   const { roomId, password, userId } = req.body;

//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room) return res.status(404).json({ error: 'Room not found' });

//     const match = await bcrypt.compare(password, room.password);
//     if (!match) return res.status(401).json({ error: 'Incorrect password' });

//     const existing = room.participants.find(p => p.user?.toString() === userId);

//     if (!existing) {
//       room.participants.push({ user: userId, joinedAt: new Date() });
//       console.log('[join] Added new participant:', { roomId, userId });
//     } else if (existing.leftAt) {
//       existing.leftAt = null;
//       existing.joinedAt = new Date();
//       console.log('[join] Rejoined participant:', { roomId, userId });
//     } else {
//       console.log('[join] Participant already active:', { roomId, userId });
//     }

//     await room.save();
//     console.log('[join] Room updated, participants:', room.participants.map(p => ({
//       user: p.user.toString(),
//       leftAt: p.leftAt
//     })));
//     res.json({ success: true });
//   } catch (err) {
//     console.error('[join] Error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.post('/leave', async (req, res) => {
//   const { roomId, userId } = req.body;
//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room) return res.status(404).json({ error: 'Room not found' });

//     const part = room.participants.find(p => p.user.toString() === userId && !p.leftAt);
//     if (part) {
//       part.leftAt = new Date();
//       await room.save();
//       console.log('[leave] Updated participant leftAt:', { roomId, userId });
//     } else {
//       console.log('[leave] No active participant found, adding:', { roomId, userId });
//       room.participants.push({ user: userId, joinedAt: new Date(), leftAt: new Date() });
//       await room.save();
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error('[leave] Error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.get('/active', async (req, res) => {
//   const { userId } = req.query;
//   try {
//     const rooms = await Room.find({ "participants.user": userId });
//     const active = rooms.filter(r => {
//       const p = r.participants.find(p => p.user.toString() === userId);
//       return p && !p.leftAt && !r.ended;
//     }).map(r => ({
//       roomId: r.roomId,
//       host: r.host,
//       participants: r.participants.filter(p => !p.leftAt).length
//     }));
//     console.log('[active] Fetched active rooms for user:', { userId, active: active.map(r => ({
//       roomId: r.roomId,
//       ended: r.ended,
//       participants: r.participants
//     }))});
//     res.json(active);
//   } catch (err) {
//     console.error('[active] Error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.get('/history/:userId', async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const rooms = await Room.find({ "participants.user": userId })
//                            .populate('host', 'name')
//                            .populate('participants.user', 'name');
//     const history = rooms.filter(r => r.ended || r.participants.some(p => p.user._id.toString() === userId && p.leftAt))
//       .map(r => {
//         const part = r.participants.find(p => p.user._id.toString() === userId);
//         const joined = part?.joinedAt || r.createdAt;
//         const left = part?.leftAt || r.updatedAt;
//         return {
//           roomId: r.roomId,
//           host: r.host?.name || 'Unknown',
//           joinedAt: joined,
//           leftAt: left,
//           participants: r.participants.filter(p => !p.leftAt).length
//         };
//       });
//     console.log('[history] Fetched history for user:', { userId, history });
//     res.json(history);
//   } catch (err) {
//     console.error('[history] Error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.delete('/history/:roomId/:userId', async (req, res) => {
//   try {
//     const { roomId, userId } = req.params;
//     const room = await Room.findOne({ roomId });

//     if (!room) {
//       return res.status(404).json({ message: 'Room not found' });
//     }

//     // If user is the host, delete the entire room
//     if (room.host.toString() === userId) {
//       await Room.deleteOne({ roomId });
//       return res.json({ message: 'Room deleted successfully' });
//     }

//     // If user is a participant, remove their entry from participants
//     const participantIndex = room.participants.findIndex(
//       (p) => p.userId.toString() === userId
//     );
//     if (participantIndex === -1) {
//       return res.status(404).json({ message: 'User not found in room participants' });
//     }

//     room.participants.splice(participantIndex, 1);
//     room.totalParticipants -= 1;
//     await room.save();

//     res.json({ message: 'Room removed from user history' });
//   } catch (err) {
//     console.error('[Delete History] Error:', err);
//     res.status(500).json({ message: 'Error deleting room from history' });
//   }
// });
// router.post('/:roomId/record', async (req, res) => {
//   const { roomId } = req.params;
//   const { userId, action } = req.body;
//   const room = await Room.findOne({ roomId });
//   if (!room || room.host.toString() !== userId) return res.status(403).send('Only host can start/stop recording');
//   room.isRecording = action === 'start';
//   await room.save();
//   console.log('[record] Updated recording status:', { roomId, isRecording: room.isRecording });
//   res.json({ success: true, isRecording: room.isRecording });
// });

// router.post('/:roomId/request-record', async (req, res) => {
//   const { roomId } = req.params;
//   const { userId } = req.body;
//   const room = await Room.findOne({ roomId });
//   if (!room) return res.status(404).send('Room not found');
//   room.recordRequests = room.recordRequests || [];
//   room.recordRequests.push(userId);
//   await room.save();
//   console.log('[request-record] Added record request:', { roomId, userId });
//   res.json({ success: true });
// });
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Create Room
router.post('/create', async (req, res) => {
  const { name, password, userId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const room = new Room({
      name,
      password: hashedPassword,
      roomId: uuidv4(),
      host: new mongoose.Types.ObjectId(userId),
      participants: [{ user: new mongoose.Types.ObjectId(userId), joinedAt: new Date() }],
    });
    await room.save();
    console.log(`[rooms/create] Room ${room.roomId} created by user ${userId}`);
    res.status(201).json(room);
  } catch (err) {
    console.error('[rooms/create] Error:', err);
    res.status(500).json({ message: 'Error creating room' });
  }
});

// Join Room
router.post('/join', async (req, res) => {
  const { roomId, password, userId } = req.body;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log(`[rooms/join] Room ${roomId} not found`);
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMatch = await bcrypt.compare(password, room.password);
    if (!isMatch) {
      console.log(`[rooms/join] Invalid password for room ${roomId}`);
      return res.status(401).json({ message: 'Invalid password' });
    }

    room.participants.push({ user: new mongoose.Types.ObjectId(userId), joinedAt: new Date() });
    room.totalParticipants += 1;
    await room.save();
    console.log(`[rooms/join] User ${userId} joined room ${roomId}`);
    res.json(room);
  } catch (err) {
    console.error('[rooms/join] Error:', err);
    res.status(500).json({ message: 'Error joining room' });
  }
});

// End Room
router.post('/end', async (req, res) => {
  const { roomId, userId } = req.body;
  try {
    console.log(`[rooms/end] Attempting to end room ${roomId} by user ${userId}`);
    const room = await Room.findOne({ 
      roomId, 
      host: new mongoose.Types.ObjectId(userId) 
    });
    if (!room) {
      console.log(`[rooms/end] Room ${roomId} not found or user ${userId} is not host`);
      return res.status(403).json({ message: 'Only host can end the room' });
    }

    room.endedAt = new Date();
    await room.save();
    console.log(`[rooms/end] Room ${roomId} ended successfully`);
    res.json({ message: 'Room ended' });
  } catch (err) {
    console.error(`[rooms/end] Error ending room ${roomId}:`, err);
    res.status(500).json({ message: 'Error ending room' });
  }
});

// Leave Room
router.post('/leave', async (req, res) => {
  const { roomId, userId } = req.body;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log(`[rooms/leave] Room ${roomId} not found`);
      return res.status(404).json({ message: 'Room not found' });
    }

    const participant = room.participants.find((p) => p.user.toString() === userId);
    if (participant) {
      participant.leftAt = new Date();
      await room.save();
      console.log(`[rooms/leave] User ${userId} left room ${roomId}`);
    }
    res.json({ message: 'Left room' });
  } catch (err) {
    console.error('[rooms/leave] Error:', err);
    res.status(500).json({ message: 'Error leaving room' });
  }
});

// Get Past Rooms
router.get('/past/:userId', async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { host: new mongoose.Types.ObjectId(req.params.userId) },
        { 'participants.user': new mongoose.Types.ObjectId(req.params.userId) },
      ],
    }).populate('host', 'email');
    console.log(`[rooms/past] Fetched ${rooms.length} rooms for user ${req.params.userId}`);
    res.json(rooms);
  } catch (err) {
    console.error('[rooms/past] Error:', err);
    res.status(500).json({ message: 'Error fetching past rooms' });
  }
});

module.exports = router;