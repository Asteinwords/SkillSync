const Message = require('../models/Message');
const User = require('../models/User');

exports.getHistory = async (req, res) => {
  try {
    const msgs = await Message.find({ roomId: req.params.roomId })
      .sort({ time: 1 });
    console.log(`✅ Fetched ${msgs.length} messages for room ${req.params.roomId}`);
    res.json(msgs);
  } catch (err) {
    console.error('❌ Error fetching chat history:', err.message);
    res.status(500).json({ message: 'Error loading chat history' });
  }
};

exports.postMessage = async (req, res) => {
  const { roomId, from, to, message, time } = req.body;
  try {
    if (!roomId || !from || !to || !message || !time) {
      return res.status(400).json({ error: 'Invalid message data' });
    }
    const saved = await Message.create({ roomId, from, to, message, time, unreadBy: [to] });
    console.log(`✅ Saved message in room ${roomId} from ${from} to ${to}`);
    res.json(saved);
  } catch (err) {
    console.error('❌ Error saving message:', err.message);
    res.status(500).json({ message: 'Error saving message' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({ unreadBy: userId });
    const unreadCounts = {};

    messages.forEach((msg) => {
      const otherUser = msg.from === userId ? msg.to : msg.from;
      unreadCounts[otherUser] = (unreadCounts[otherUser] || 0) + 1;
    });

    console.log(`✅ Unread counts for user ${userId}:`, unreadCounts);
    res.json({ unreadCounts, total: messages.length });
  } catch (err) {
    console.error('❌ Error fetching unread counts:', err.message);
    res.status(500).json({ message: 'Error fetching unread counts' });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    if (!roomId || !userId) {
      return res.status(400).json({ error: 'Room ID and user ID required' });
    }
    const updated = await Message.updateMany(
      { roomId, unreadBy: userId },
      { $pull: { unreadBy: userId } }
    );
    console.log(`✅ Marked ${updated.nModified} messages as read in room ${roomId} for ${userId}`);
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('❌ Error marking messages as read:', err.message);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

exports.deleteForMe = async (req, res) => {
  try {
    const { messageIds, userId } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0 || !userId) {
      return res.status(400).json({ error: 'Invalid message IDs or user ID' });
    }

    const messages = await Message.find({
      _id: { $in: messageIds },
      $or: [{ from: userId }, { to: userId }],
    });

    if (messages.length !== messageIds.length) {
      return res.status(403).json({ error: 'Unauthorized to delete some messages' });
    }

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { deletedBy: userId } }
    );

    console.log(`✅ Messages ${messageIds} marked as deleted for user ${userId}`);
    res.json({ message: 'Messages deleted for current user' });
  } catch (err) {
    console.error('❌ Error in deleteForMe:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteForEveryone = async (req, res) => {
  try {
    const { messageIds, userId } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0 || !userId) {
      return res.status(400).json({ error: 'Invalid message IDs or user ID' });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const messages = await Message.find({
      _id: { $in: messageIds },
      from: userId,
      time: { $gte: oneDayAgo },
    });

    if (messages.length !== messageIds.length) {
      return res.status(403).json({ error: 'Only the sender can delete messages within 24 hours' });
    }

    await Message.deleteMany({ _id: { $in: messageIds } });

    console.log(`✅ Messages ${messageIds} permanently deleted by user ${userId}`);
    res.json({ message: 'Messages deleted for everyone' });
  } catch (err) {
    console.error('❌ Error in deleteForEveryone:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔍 Fetching recent chats for user: ${userId}, token: ${req.headers.authorization}`);

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch messages
    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }],
      deletedBy: { $ne: userId },
    })
      .sort({ time: -1 })
      .populate('from', 'name profileImage')
      .populate('to', 'name profileImage')
      .limit(10);

    console.log(`✅ Found ${messages.length} messages for user ${userId}:`, 
      messages.map(m => ({
        _id: m._id,
        roomId: m.roomId,
        from: m.from?._id,
        to: m.to?._id,
        fromName: m.from?.name,
        toName: m.to?.name,
        message: m.message,
        time: m.time
      })));

    if (!messages.length) {
      console.log('⚠️ No messages found, returning empty array');
      return res.json([]);
    }

    // Group by other user
    const chatMap = new Map();
    messages.forEach((msg) => {
      const otherUserId = msg.from.toString() === userId ? msg.to._id.toString() : msg.from._id.toString();
      const otherUser = msg.from.toString() === userId ? msg.to : msg.from;
      if (!otherUser || !otherUser._id) {
        console.warn(`⚠️ Skipping message ${msg._id} with missing user data`);
        return;
      }
      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          _id: otherUserId,
          user: {
            name: otherUser.name || 'Unknown',
            profileImage: otherUser.profileImage || null,
          },
          lastMessage: msg.message || 'No message content',
          time: msg.time,
          direction: msg.from.toString() === userId ? 'sent' : 'received',
        });
      }
    });

    const recentChats = Array.from(chatMap.values())
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 3);

    console.log(`✅ Returning ${recentChats.length} recent chats:`, JSON.stringify(recentChats, null, 2));
    res.json(recentChats);
  } catch (err) {
    console.error('❌ Error fetching recent chats:', err.message, err.stack);
    res.status(500).json({ message: 'Error fetching recent chats', error: err.message });
  }
};

// ... (other endpoints unchanged)