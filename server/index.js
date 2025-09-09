
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const Room = require('./models/Room');
const User = require('./models/User');
const Message = require('./models/Message');
const postRoutes = require('./routes/postRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const chatRoutes = require('./routes/chatRoutes');
const eventRoutes = require('./routes/eventRoutes');
const setupChatSocket = require('./chatSocket');
require('./scheduler'); // node-schedule for autoMarkDone
const { startScheduler } = require('./schedulerr'); // node-cron for updateTrendingSkills

// Load .env file explicitly
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1); // Exit if .env fails to load
} else {
  console.log('Successfully loaded .env file:', result.parsed);
}

// Log environment variables for debugging
console.log('Environment Variables:', {
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? '[REDACTED]' : undefined,
  EMAIL_FROM: process.env.EMAIL_FROM,
  MONGO_URI: process.env.MONGO_URI ? '[REDACTED]' : undefined,
  JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : undefined,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? '[REDACTED]' : undefined,
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,
});

const app = express();
const server = http.createServer(app);

// Shared maps for socket tracking
const hostSocketMap = new Map();
const socketUserMap = new Map();

// Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://fancy-kitsune-3545b7.netlify.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log(`[${new Date().toISOString()}] CORS Origin Check:`, { origin });
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[${new Date().toISOString()}] CORS Blocked:`, { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log(`[${new Date().toISOString()}] Socket.IO CORS Origin Check:`, { origin });
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[${new Date().toISOString()}] Socket.IO CORS Blocked:`, { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach chat-related socket handlers
setupChatSocket(io, socketUserMap);

// Room leave logic
const leaveRoomLogic = async (roomId, userId) => {
  console.log(`📩 [leaveRoomLogic] Called for room: ${roomId}, user: ${userId}`);
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.log('⚠️ [leaveRoomLogic] No room found');
      return false;
    }

    console.log('[leaveRoomLogic] Participants:', room.participants.map(p => ({
      user: p.user.toString(),
      leftAt: p.leftAt
    })));

    const participant = room.participants.find(
      (p) => p.user.toString() === userId && !p.leftAt
    );

    if (participant) {
      participant.leftAt = new Date();
      await room.save();
      console.log(`✅ [leaveRoomLogic] Updated leftAt for ${userId}`);
      return true;
    } else {
      console.log(`⚠️ [leaveRoomLogic] No active participant found for ${userId}`);
      room.participants.push({ user: userId, joinedAt: new Date(), leftAt: new Date() });
      await room.save();
      console.log(`✅ [leaveRoomLogic] Added participant with leftAt for ${userId}`);
      return true;
    }
  } catch (err) {
    console.error("❌ [leaveRoomLogic] Error:", err);
    return false;
  }
};

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/post', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', require('./routes/contactRoutes'));
app.post('/api/rooms/leave', async (req, res) => {
  try {
    let body = req.body;

    if (!body || Object.keys(body).length === 0) {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const raw = Buffer.concat(chunks).toString();
          const { roomId, userId } = JSON.parse(raw);
          if (!roomId || !userId) return res.status(400).json({ error: 'Missing roomId or userId' });
          const success = await leaveRoomLogic(roomId, userId);
          console.log('[leave] sendBeacon processed:', { roomId, userId, success });
          res.json({ success });
        } catch (err) {
          console.error('[leave] sendBeacon parse error:', err);
          res.status(400).json({ error: 'Invalid request data' });
        }
      });
    } else {
      const { roomId, userId } = body;
      if (!roomId || !userId) return res.status(400).json({ error: 'Missing roomId or userId' });
      const success = await leaveRoomLogic(roomId, userId);
      console.log('[leave] API processed:', { roomId, userId, success });
      res.json({ success });
    }
  } catch (err) {
    console.error('[leave] Error:', err);
    res.status(500).json({ error: 'Server error' });
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
      startScheduler(); // Start the node-cron scheduler for trending skills
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Room-related Socket.IO handlers
io.on('connection', (socket) => {
  console.log('📲 New client connected:', socket.id);

  socket.on('join-room', async ({ roomId, userId }) => {
    try {
      socket.join(roomId);
      socketUserMap.set(socket.id, { userId, roomId });

      const room = await Room.findOne({ roomId });
      if (!room) {
        console.log(`⚠️ [join-room] Room ${roomId} not found`);
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.host.toString() === userId) {
        hostSocketMap.set(roomId, socket.id);
        console.log(`👑 Host (${userId}) joined room ${roomId}`);
      } else {
        console.log(`👤 Participant (${userId}) joined room ${roomId}`);
      }

      socket.emit('room-joined');
      socket.server.to(roomId).emit('user-connected', userId);
    } catch (err) {
      console.error('❌ [join-room] Error:', err);
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('signal', ({ userId, signal, type }) => {
    const socketData = socketUserMap.get(socket.id);
    if (!socketData) {
      console.error('[signal] No socket data for:', socket.id);
      return;
    }
    const { roomId } = socketData;
    socket.to(roomId).emit('signal', { from: socketData.userId, signal, type });
    console.log(`[signal] Relayed ${type} signal from:`, socketData.userId, 'to:', userId);
  });

  socket.on('screen-signal', ({ userId, signal }) => {
    const socketData = socketUserMap.get(socket.id);
    if (!socketData) {
      console.error('[screen-signal] No socket data for:', socket.id);
      return;
    }
    const { roomId } = socketData;
    socket.to(roomId).emit('screen-signal', { from: socketData.userId, signal });
    console.log('[screen-signal] Relayed signal from:', socketData.userId, 'to:', userId);
  });

  socket.on('screen-share', (streamId) => {
    const socketData = socketUserMap.get(socket.id);
    if (!socketData) {
      console.error('[screen-share] No socket data for:', socket.id);
      return;
    }
    const { roomId } = socketData;
    socket.to(roomId).emit('screen-share', streamId);
    console.log('[screen-share] Broadcasted streamId:', streamId, 'to room:', roomId);
  });

  socket.on('screen-sharing-started', async ({ roomId, userId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room.screenSharingUser && room.screenSharingUser.toString() !== userId) {
        socket.emit('error', 'Another user is already sharing their screen');
        console.log('[screen-sharing-started] Blocked: another user sharing');
        return;
      }
      room.screenSharingUser = userId;
      await room.save();
      io.to(roomId).emit('screen-sharing-started', { userId });
      console.log('[screen-sharing-started] Started by:', userId);
    } catch (err) {
      console.error('❌ [screen-sharing-started] Error:', err);
    }
  });

  socket.on('screen-sharing-stopped', async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId });
      room.screenSharingUser = null;
      await room.save();
      io.to(roomId).emit('screen-sharing-stopped');
      console.log('[screen-sharing-stopped] Stopped for room:', roomId);
    } catch (err) {
      console.error('❌ [screen-sharing-stopped] Error:', err);
    }
  });

  socket.on('draw', ({ roomId, data }) => {
    socket.to(roomId).emit('draw', data);
    console.log('[draw] Broadcasted draw event to room:', roomId, 'data size:', data.length);
  });

  socket.on('end-meeting', async (userId) => {
    try {
      const socketData = socketUserMap.get(socket.id);
      if (!socketData) {
        console.log(`⚠️ [end-meeting] No socket data for socket ${socket.id}`);
        socket.emit('end-meeting-error', 'Invalid session');
        return;
      }

      const { roomId } = socketData;
      console.log(`[end-meeting] Processing for room: ${roomId}, user: ${userId}`);
      const room = await Room.findOne({ roomId });
      if (!room) {
        console.log(`⚠️ [end-meeting] Room ${roomId} not found`);
        socket.emit('end-meeting-error', 'Room not found');
        return;
      }

      if (room.host.toString() !== userId) {
        console.log(`⚠️ [end-meeting] User ${userId} is not host of ${roomId}`);
        socket.emit('end-meeting-error', 'Only the host can end the meeting');
        return;
      }

      room.ended = true;
      const now = new Date();
      room.participants.forEach(p => { if (!p.leftAt) p.leftAt = now; });
      await room.save();
      console.log(`[end-meeting] Room ${roomId} saved with ended: ${room.ended}, participants:`, 
        room.participants.map(p => ({ user: p.user.toString(), leftAt: p.leftAt })));
      
      io.to(roomId).emit('meeting-ended');
      io.in(roomId).socketsLeave(roomId);
      hostSocketMap.delete(roomId);
      console.log(`✅ [end-meeting] Room ${roomId} ended and participants marked as left`);
    } catch (err) {
      console.error(`❌ [end-meeting] Error:`, err);
      socket.emit('end-meeting-error', 'Failed to end meeting');
    }
  });

  socket.on('leave-room', async ({ roomId, userId }) => {
    try {
      const success = await leaveRoomLogic(roomId, userId);
      if (success) {
        io.to(roomId).emit('user-disconnected', userId);
        console.log(`[leave-room] Emitted user-disconnected to room ${roomId} for user ${userId}`);
        socketUserMap.delete(socket.id);
      } else {
        console.log(`[leave-room] Failed to update room ${roomId} for user ${userId}`);
      }
    } catch (err) {
      console.error('❌ [leave-room] Error:', err);
    }
  });

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
        io.to(roomId).emit('meeting-ended');
        io.in(roomId).socketsLeave(roomId);
        hostSocketMap.delete(roomId);
        console.log(`✅ [end-meeting] Room ${roomId} closed due to host disconnect`);
      } else {
        const p = room.participants.find(p => p.user.toString() === userId && !p.leftAt);
        if (p) {
          p.leftAt = new Date();
          await room.save();
          io.to(roomId).emit('user-disconnected', userId);
          console.log(`👤 Participant ${userId} left room ${roomId}`);
        }
      }
    } catch (err) {
      console.error('❌ [disconnect] Error:', err);
    } finally {
      socketUserMap.delete(socket.id);
      console.log('[disconnect] Removed socket from socketUserMap:', socket.id);
    }
  });
});
