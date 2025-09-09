import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../services/socket';
import API from '../../services/api';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';

const ChatWindow = ({ activeUser, userId, setActiveUser }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef();
  const roomIdRef = useRef('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userId) {
      console.error('⚠️ Missing token or userId, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser({ user: { _id: data._id, name: data.name, email: data.email } });
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch current user:', err.response?.data?.message || err.message);
        alert('Error fetching user. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    };

    fetchUser();
  }, [userId, navigate]);

  useEffect(() => {
    if (!currentUser || !activeUser || !userId) return;

    const senderId = currentUser.user?._id;
    const receiverId = activeUser._id;
    if (!senderId || !receiverId) {
      console.error('⚠️ Missing senderId or receiverId');
      return;
    }

    const roomId = [senderId, receiverId].sort().join('-');
    roomIdRef.current = roomId;

    socket.emit('joinRoom', { roomId, userId: senderId });

    API.get(`/chat/${roomId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => {
        setMessages(res.data || []);
      })
      .catch((err) => console.error('❌ Error loading chat:', err.response?.data?.message || err.message));

    API.post(
      '/chat/mark-read',
      { roomId, userId: senderId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )
      .then(() => {
        console.log(`✅ Messages marked as read for room ${roomId} by ${senderId}`);
        socket.emit('messagesRead', { userId: receiverId, readerId: senderId });
      })
      .catch((err) => console.error('❌ Error marking messages as read:', err.response?.data?.message || err.message));

    const receiveHandler = (data) => {
      if (data.roomId === roomIdRef.current) {
        console.log(`✅ Received message in room ${roomId}`);
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on('receiveMessage', receiveHandler);
    return () => socket.off('receiveMessage', receiveHandler);
  }, [currentUser, activeUser, userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleSelect = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const sendMessage = () => {
    if (!msg.trim()) return;

    const senderId = currentUser?.user?._id;
    const receiverId = activeUser?._id;

    if (!senderId || !receiverId) {
      console.error('⚠️ User not ready for sending message');
      return alert('User not ready');
    }

    const roomId = [senderId, receiverId].sort().join('-');
    roomIdRef.current = roomId;

    const newMsg = {
      roomId,
      from: senderId,
      to: receiverId,
      message: msg,
      time: new Date(),
    };

    socket.emit('sendMessage', newMsg);
    setMsg('');
  };

  const deleteMessages = async (type) => {
    if (!selectedMessages.length) {
      console.warn('⚠️ No messages selected for deletion');
      return alert('No messages selected');
    }

    const senderId = currentUser?.user?._id;
    const token = localStorage.getItem('token');
    if (!senderId || !token) {
      console.error('⚠️ Missing userId or token for deletion');
      return alert('Authentication error. Please login again.');
    }

    try {
      const endpoint = type === 'forMe' ? '/chat/messages/delete-for-me' : '/chat/messages/delete-for-everyone';
      const response = await API.delete(endpoint, {
        data: { messageIds: selectedMessages, userId: senderId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        if (type === 'forMe') {
          setMessages((prev) =>
            prev.map((m) =>
              selectedMessages.includes(m._id)
                ? { ...m, deletedBy: [...(m.deletedBy || []), senderId] }
                : m
            )
          );
          console.log(`✅ Messages ${selectedMessages} deleted for user ${senderId}`);
        } else {
          setMessages((prev) => prev.filter((m) => !selectedMessages.includes(m._id)));
          console.log(`✅ Messages ${selectedMessages} deleted for everyone by user ${senderId}`);
        }
        setSelectedMessages([]);
        setShowDeleteOptions(false);
      }
    } catch (err) {
      console.error(`❌ Error deleting messages (${type}):`, err.response?.data?.error || err.message);
      alert(`Failed to delete messages: ${err.response?.data?.error || 'Please try again.'}`);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMsg((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const isDeleteForEveryoneDisabled = selectedMessages.some((id) => {
    const message = messages.find((m) => m._id === id);
    if (!message) return true;
    const isNotSender = message.from !== currentUser?.user?._id;
    const isOlderThan24Hours = new Date() - new Date(message.time) > 24 * 60 * 60 * 1000;
    return isNotSender || isOlderThan24Hours;
  });

  if (isLoading || !currentUser || !activeUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-lg">
        🔄 Loading chat...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-100 to-white">
      <div className="flex items-center justify-between p-3 bg-blue-600 text-white shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveUser(null)}
            className="p-2 sm:hidden"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img
            src={activeUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${activeUser.name}`}
            alt={activeUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-lg font-semibold truncate">{activeUser.name}</span>
        </div>
        {selectedMessages.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteOptions(!showDeleteOptions)}
              className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full"
            >
              🗑 ({selectedMessages.length})
            </button>
            <AnimatePresence>
              {showDeleteOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50"
                >
                  <button
                    onClick={() => deleteMessages('forMe')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Delete for Me
                  </button>
                  <button
                    onClick={() => deleteMessages('forEveryone')}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      isDeleteForEveryoneDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    disabled={isDeleteForEveryoneDisabled}
                  >
                    Delete for Everyone
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-[url('/path/to/whatsapp-bg.png')] bg-repeat bg-[length:300px] space-y-3">
        {messages.map((m, i) => {
          const isFromCurrentUser = m.from === currentUser.user._id;
          const isDeletedForCurrentUser = m.deletedBy?.includes(currentUser.user._id);

          if (isDeletedForCurrentUser) return null;

          return (
            <div
              key={i}
              ref={scrollRef}
              onClick={() => m._id && toggleSelect(m._id)}
              className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`relative px-4 py-2 rounded-lg max-w-[75%] text-sm cursor-pointer
                  ${selectedMessages.includes(m._id) ? 'ring-2 ring-red-400' : ''}
                  ${
                    isFromCurrentUser
                      ? 'bg-blue-500 text-white rounded-tr-sm'
                      : 'bg-gray-200 text-gray-800 rounded-tl-sm'
                  } shadow-sm`}
              >
                <p className={m.isDeleted ? 'italic text-gray-400' : ''}>
                  {m.isDeleted ? 'Message deleted' : m.message}
                </p>
                <p className="text-[10px] mt-1 text-right opacity-70">
                  {new Date(m.time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <div
                  className={`absolute bottom-0 ${
                    isFromCurrentUser ? '-right-2' : '-left-2'
                  } w-0 h-0 border-t-8 border-t-transparent ${
                    isFromCurrentUser
                      ? 'border-l-8 border-l-blue-500'
                      : 'border-r-8 border-r-gray-200'
                  } border-b-8 border-b-transparent`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-2 z-50 w-[90%] max-w-xs sm:max-w-sm"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              height={350}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-2 bg-white border-t shadow-inner flex items-center gap-2 sticky bottom-0">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-xl p-2 text-gray-600 hover:text-gray-800"
        >
          😊
        </button>
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border border-blue-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;