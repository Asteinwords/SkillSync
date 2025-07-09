const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');




const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const chatRoutes = require('./routes/chatRoutes'); // ✅ Missing route import

const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);

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

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', chatRoutes); // ✅ Register chatRoutes for chat history

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

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('📲 New client connected:', socket.id);

  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`👥 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('signal', ({ to, from, signal }) => {
    io.to(to).emit('signal', { from, signal });
  });

  socket.on('startChat', async ({ userA, userB }) => {
    const allowed = await canChat(userA, userB);
    if (!allowed) {
      socket.emit('error', '❌ You can only chat with mutual followers.');
    }
  });

  socket.on('draw', ({ roomId, data }) => {
    socket.to(roomId).emit('draw', data);
  });

  socket.on('end-room', ({ roomId }) => {
    io.to(roomId).emit('room-ended');
    io.in(roomId).socketsLeave(roomId);
    console.log(`❗ Room ${roomId} ended by host.`);
  });

//   socket.on('sendMessage', async ({ roomId, sender, receiver, message, time }) => {
//   const msg = { roomId, sender, receiver, message, time };
//   socket.to(roomId).emit('receiveMessage', msg); // ✅ Only to others

//   try {
//     await Message.create({ roomId, from: sender, to: receiver, message, time });
//     console.log('✅ Message saved');
//   } catch (err) {
//     console.error('❌ DB Error:', err);
//   }
// });
// Inside io.on('connection') in server.js
// Inside io.on('connection')
// Inside io.on('connection', ...) block:
socket.on('sendMessage', async ({ roomId, from, to, message, time }) => {
  console.log("📨 Message received from:", from, "to:", to);
  try {
    const saved = await Message.create({ roomId, from, to, message, time });
    console.log("✅ Message saved in DB:", saved);
    io.to(roomId).emit('receiveMessage', saved);
  } catch (err) {
    console.error('❌ Save error:', err);
  }
});

  socket.on('disconnect', () => {
    console.log('👋 Client disconnected:', socket.id);
  });
});
