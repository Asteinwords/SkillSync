
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const Room = require('./models/Room');
const User = require('./models/User');
const Message = require('./models/Message');

const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const chatRoutes = require('./routes/chatRoutes');
const leaveRoomLogic = async (roomId, userId) => {
  console.log(`📩 [leaveRoomLogic] Called for room: ${roomId}, user: ${userId}`);
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log('⚠️ No room found');
      return;
    }

    const participant = room.participants.find(
      (p) => p.user.toString() === userId && !p.leftAt
    );

    if (participant) {
      participant.leftAt = new Date();
      await room.save();
      console.log(`✅ [leaveRoomLogic] Updated leftAt for ${userId}`);
    } else {
      console.log(`❌ [leaveRoomLogic] No active participant found`);
    }
  } catch (err) {
    console.error("❌ [leaveRoomLogic] Error:", err);
  }
};

dotenv.config();

const app = express();
const server = http.createServer(app);

// Map to track host socket per room
const hostSocketMap = new Map();

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// 🔐 Check if both users follow each other
const canChat = async (userA, userB) => {
  const a = await User.findById(userA);
  return a?.following.includes(userB) && a?.followers.includes(userB);
};

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', chatRoutes);
app.post('/api/rooms/leave', async (req, res) => {
  try {
    let body = req.body;

    // If body is empty (sendBeacon sends blob), parse it manually
    if (!body || Object.keys(body).length === 0) {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', async () => {
        const raw = Buffer.concat(chunks).toString();
        const { roomId, userId } = JSON.parse(raw);
        if (!roomId || !userId) return res.sendStatus(400);

        await leaveRoomLogic(roomId, userId); // your actual DB logic here
        return res.sendStatus(200);
      });
    } else {
      const { roomId, userId } = body;
      if (!roomId || !userId) return res.sendStatus(400);
      await leaveRoomLogic(roomId, userId);
      return res.sendStatus(200);
    }
  } catch (err) {
    console.error('Leave room failed:', err);
    return res.sendStatus(500);
  }
});


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
const socketUserMap = new Map(); // socket.id -> { userId, roomId }

io.on('connection', (socket) => {
  console.log('📲 New client connected:', socket.id);

  // ✅ User joins room
  socket.on('joinRoom', async ({ roomId, userId }) => {
    try {
      socket.join(roomId);
      socketUserMap.set(socket.id, { userId, roomId });

      const room = await Room.findOne({ roomId });
      if (room?.host.toString() === userId) {
        hostSocketMap.set(roomId, socket.id);
        console.log(`👑 Host (${userId}) joined room ${roomId}`);
      } else {
        console.log(`👤 Participant (${userId}) joined room ${roomId}`);
      }

      socket.to(roomId).emit('user-joined', { socketId: socket.id, userId });
    } catch (err) {
      console.error('❌ [joinRoom] Error:', err);
    }
  });

  // ✅ WebRTC signal handling
  socket.on('signal', ({ to, from, signal }) => {
    io.to(to).emit('signal', { from, signal });
  });

  // ✅ Whiteboard draw sync
  socket.on('draw', ({ roomId, data }) => {
    socket.to(roomId).emit('draw', data);
  });

  // ✅ Chat permission check
  socket.on('startChat', async ({ userA, userB }) => {
    try {
      const allowed = await canChat(userA, userB);
      if (!allowed) {
        socket.emit('error', '❌ You can only chat with mutual followers.');
        console.log(`🚫 Chat blocked: ${userA} ❌ ${userB}`);
      }
    } catch (err) {
      console.error('❌ [startChat] Error:', err);
    }
  });

  // ✅ Chat message
  socket.on('sendMessage', async ({ roomId, from, to, message, time }) => {
    try {
      const saved = await Message.create({ roomId, from, to, message, time });
      io.to(roomId).emit('receiveMessage', saved);
      console.log(`💬 ${from} -> ${to} in ${roomId}: ${message}`);
    } catch (err) {
      console.error('❌ [sendMessage] Error:', err);
    }
  });

  // ✅ Request recording
  socket.on('request-record', ({ roomId, userId }) => {
    console.log(`📹 Record request by ${userId} in ${roomId}`);
    io.to(roomId).emit('record-requested', { userId });
  });

  // ✅ Start/stop recording
  socket.on('record-action', ({ roomId, action }) => {
    console.log(`📼 Record ${action.toUpperCase()} in ${roomId}`);
    io.to(roomId).emit('record-action', { action });
  });

  // ✅ End room manually
  socket.on('end-room', async ({ roomId }) => {

    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      room.ended = true;
      const now = new Date();
      room.participants.forEach(p => { if (!p.leftAt) p.leftAt = now; });

      await room.save();
      io.to(roomId).emit('room-ended');
      io.in(roomId).socketsLeave(roomId);
      hostSocketMap.delete(roomId);

      console.log(`✅ Room ${roomId} ended and participants marked as left`);
    } catch (err) {
      console.error(`❌ [end-room] Error:`, err);
    }
  });

  // ✅ Handle disconnects
  socket.on('disconnect', async () => {
    const session = socketUserMap.get(socket.id);
    if (!session) return;

    const { roomId, userId } = session;
    const isHost = hostSocketMap.get(roomId) === socket.id;

    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      if (isHost) {
        console.log(`⚠️ Host ${userId} disconnected from ${roomId}`);
        room.ended = true;
        const now = new Date();
        room.participants.forEach(p => { if (!p.leftAt) p.leftAt = now; });
        await room.save();

        io.to(roomId).emit('room-ended');
        io.in(roomId).socketsLeave(roomId);
        hostSocketMap.delete(roomId);

        console.log(`✅ Room ${roomId} closed due to host disconnect`);
      } else {
        const p = room.participants.find(p => p.user.toString() === userId && !p.leftAt);
        if (p) {
          p.leftAt = new Date();
          await room.save();
          console.log(`👤 Participant ${userId} left room ${roomId}`);
        }
      }
    } catch (err) {
      console.error('❌ [disconnect] Error:', err);
    } finally {
      socketUserMap.delete(socket.id);
    }
  });
});
