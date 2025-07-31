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
        console.error('⚠️ No userId provided for socket registration');
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
          console.log(`🚫 Chat blocked: ${userA} ❌ ${userB}`);
        }
      } catch (err) {
        console.error('❌ [startChat] Error:', err.message);
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
          console.warn(`⚠️ Recipient ${to} not found in socketUserMap`);
        }
        console.log(`💬 ${from} -> ${to} in ${roomId}: ${message}`);
      } catch (err) {
        console.error('❌ [sendMessage] Error:', err.message);
        socket.emit('error', 'Error sending message');
      }
    });

    socket.on('joinRoom', ({ roomId, userId }) => {
      if (!userId || !roomId) {
        console.error('⚠️ Invalid joinRoom data:', { roomId, userId });
        return socket.emit('error', 'Invalid room or user ID');
      }
      socket.join(roomId);
      console.log(`✅ User ${userId} joined room ${roomId}`);
    });

    socket.on('messagesRead', ({ userId, readerId }) => {
      if (!userId || !readerId) {
        console.error('⚠️ Invalid messagesRead data:', { userId, readerId });
        return;
      }
      const recipientSocket = Object.keys(socketUserMap).find(
        (key) => socketUserMap[key] === readerId
      );
      if (recipientSocket) {
        io.to(readerId).emit('messagesRead', { userId });
      } else {
        console.warn(`⚠️ Recipient ${readerId} not found in socketUserMap`);
      }
    });

    socket.on('disconnect', () => {
      const userId = socketUserMap[socket.id];
      delete socketUserMap[socket.id];
      console.log(`🛑 User ${userId} disconnected`);
    });
  });
};