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
  };

  const isDeleteForEveryoneDisabled = selectedMessages.some((id) => {
    const message = messages.find((m) => m._id === id);
    if (!message) return true;
    const isNotSender = message.from !== currentUser?.user?._id;
    const isOlderThan24Hours = new Date() - new Date(message.time) > 24 * 60 * 60 * 1000;
    return isNotSender || isOlderThan24Hours;
  });

  if (isLoading || !currentUser || !activeUser) {
    return <div className="flex-1 p-6 text-gray-600 text-lg sm:flex-1 sm:p-6 sm:text-gray-600 sm:text-lg">🔄 Loading chat...</div>;
  }

  return (
    <div className="mt-6 flex-1 flex flex-col bg-gradient-to-b from-slate-100 to-white sm:mt-6 sm:flex-1 sm:flex sm:flex-col sm:bg-gradient-to-b sm:from-slate-100 sm:to-white">
      <div className="p-4 bg-blue-600 text-white font-semibold text-lg shadow-sm flex justify-between items-center relative sm:p-4 sm:bg-blue-600 sm:text-white sm:font-semibold sm:text-lg sm:shadow-sm sm:flex sm:justify-between sm:items-center sm:relative">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveUser(null)}
            className="sm:hidden text-white p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span>{activeUser.name}</span>
        </div>
        {selectedMessages.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteOptions(!showDeleteOptions)}
              className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white sm:text-sm sm:bg-red-500 sm:hover:bg-red-600 sm:px-3 sm:py-1 sm:rounded sm:text-white"
            >
              🗑 Delete ({selectedMessages.length})
            </button>
            <AnimatePresence>
              {showDeleteOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50 sm:absolute sm:right-0 sm:mt-2 sm:w-48 sm:bg-white sm:shadow-lg sm:rounded-lg sm:border sm:border-gray-200 sm:z-50"
                >
                  <button
                    onClick={() => deleteMessages('forMe')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 sm:w-full sm:text-left sm:px-4 sm:py-2 sm:text-sm sm:text-gray-700 sm:hover:bg-gray-100"
                  >
                    Delete for Me
                  </button>
                  <button
                    onClick={() => deleteMessages('forEveryone')}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      isDeleteForEveryoneDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    } sm:w-full sm:text-left sm:px-4 sm:py-2 sm:text-sm sm:text-gray-700 sm:hover:bg-gray-100`}
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

      <div className="flex-1 p-4 overflow-y-auto bg-white space-y-3 sm:flex-1 sm:p-4 sm:overflow-y-auto sm:bg-white sm:space-y-3">
        {messages.map((m, i) => {
          const isFromCurrentUser = m.from === currentUser.user._id;
          const isDeletedForCurrentUser = m.deletedBy?.includes(currentUser.user._id);

          if (isDeletedForCurrentUser) return null;

          return (
            <div
              key={i}
              ref={scrollRef}
              onClick={() => m._id && toggleSelect(m._id)}
              className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} sm:flex sm:${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-xl shadow max-w-[70%] text-sm cursor-pointer
                  ${selectedMessages.includes(m._id) ? 'ring-2 ring-red-400' : ''}
                  ${
                    isFromCurrentUser
                      ? 'bg-blue-500 text-white rounded-tr-sm'
                      : 'bg-gray-200 text-gray-800 rounded-tl-sm'
                  } sm:px-4 sm:py-2 sm:rounded-xl sm:shadow sm:max-w-[70%] sm:text-sm sm:cursor-pointer sm:${selectedMessages.includes(m._id) ? 'ring-2 ring-red-400' : ''} sm:${
                    isFromCurrentUser
                      ? 'bg-blue-500 text-white sm:rounded-tr-sm'
                      : 'bg-gray-200 text-gray-800 sm:rounded-tl-sm'
                  }`}
              >
                <p className={m.isDeleted ? 'italic text-gray-400' : ''}>
                  {m.isDeleted ? 'Message deleted' : m.message}
                </p>
                <p className="text-[10px] mt-1 text-right opacity-70 sm:text-[10px] sm:mt-1 sm:text-right sm:opacity-70">
                  {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-24 left-4 z-50 sm:absolute sm:bottom-24 sm:left-4 sm:z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div className="p-2 bg-white border-t shadow-inner flex gap-2 items-center sticky bottom-0 sm:p-4 sm:bg-white sm:border-t sm:shadow-inner sm:flex sm:gap-2 sm:items-center sm:sticky sm:bottom-0">
        <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="text-2xl px-2 sm:text-2xl sm:px-2">
          😊
        </button>
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border border-blue-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-1 sm:border sm:border-blue-300 sm:rounded-lg sm:px-4 sm:py-2 sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition sm:bg-blue-600 sm:hover:bg-blue-700 sm:text-white sm:px-5 sm:py-2 sm:rounded-lg sm:transition"
        >
          <Send className="w-5 h-5 sm:hidden" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;