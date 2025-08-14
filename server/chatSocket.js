const User = require('./models/User');
const Message = require('./models/Message');

const canChat = async (userA, userB) => {
  const a = await User.findById(userA);
  return a?.following.includes(userB) && a?.followers.includes(userB);
};

module.exports = (io, socketUserMap) => {
  io.on('connection', (socket) => {
    socket.on('registerUser', ({ userId }) => {
      if (!userId) {
        console.error(`[${new Date().toISOString()}] No userId provided for socket registration`);
        return socket.emit('error', 'Invalid user ID');
      }
      socketUserMap[socket.id] = userId;
      socket.join(userId);
      console.log(`✅ User ${userId} registered with socket ID: ${socket.id}`);
    });

    socket.on('startChat', async ({ userA, userB }) => {
      try {
        const allowed = await canChat(userA, userB);
        if (!allowed) {
          socket.emit('error', '❌ You can only chat with mutual followers.');
          console.log(`[${new Date().toISOString()}] Chat blocked: ${userA} ❌ ${userB}`);
        }
      } catch (err) {
        console.error(`[${new Date().toISOString()}] [startChat] Error:`, err.message, err.stack);
        socket.emit('error', 'Error starting chat');
      }
    });

    socket.on('sendMessage', async ({ roomId, from, to, message, time }) => {
      try {
        if (!roomId || !from || !to || !message || !time) {
          throw new Error('Invalid message data');
        }
        const saved = await Message.create({
          roomId,
          from,
          to,
          message,
          time,
          unreadBy: [to],
        });
        io.to(roomId).emit('receiveMessage', saved);
        const recipientSocket = Object.keys(socketUserMap).find(
          (key) => socketUserMap[key] === to
        );
        if (recipientSocket) {
          io.to(to).emit('newMessageNotification', {
            roomId,
            from,
            to,
            message: saved.message,
            time: saved.time,
            senderName: (await User.findById(from)).name,
          });
        } else {
          console.warn(`[${new Date().toISOString()}] Recipient ${to} not found in socketUserMap`);
        }
        console.log(`[${new Date().toISOString()}] 💬 ${from} -> ${to} in ${roomId}: ${message}`);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] [sendMessage] Error:`, err.message, err.stack);
        socket.emit('error', 'Error sending message');
      }
    });

    socket.on('joinRoom', ({ roomId, userId }) => {
      if (!userId || !roomId) {
        console.error(`[${new Date().toISOString()}] Invalid joinRoom data:`, { roomId, userId });
        return socket.emit('error', 'Invalid room or user ID');
      }
      socket.join(roomId);
      console.log(`[${new Date().toISOString()}] User ${userId} joined room ${roomId}`);
    });

    socket.on('messagesRead', ({ userId, readerId }) => {
      if (!userId || !readerId) {
        console.error(`[${new Date().toISOString()}] Invalid messagesRead data:`, { userId, readerId });
        return;
      }
      const recipientSocket = Object.keys(socketUserMap).find(
        (key) => socketUserMap[key] === readerId
      );
      if (recipientSocket) {
        io.to(readerId).emit('messagesRead', { userId });
      } else {
        console.warn(`[${new Date().toISOString()}] Recipient ${readerId} not found in socketUserMap`);
      }
    });

    socket.on('disconnect', () => {
      const userId = socketUserMap[socket.id];
      delete socketUserMap[socket.id];
      console.log(`[${new Date().toISOString()}] 🛑 User ${userId} disconnected`);
    });
  });
};