const User = require('./models/User');
const Message = require('./models/Message');

const canChat = async (userA, userB) => {
  const a = await User.findById(userA);
  return a?.following.includes(userB) && a?.followers.includes(userB);
};

module.exports = (io, socketUserMap) => {
  io.on('connection', (socket) => {
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

    socket.on('sendMessage', async ({ roomId, from, to, message, time }) => {
      try {
        const saved = await Message.create({ roomId, from, to, message, time });
        io.to(roomId).emit('receiveMessage', saved);
        console.log(`💬 ${from} -> ${to} in ${roomId}: ${message}`);
      } catch (err) {
        console.error('❌ [sendMessage] Error:', err);
      }
    });
  });
};