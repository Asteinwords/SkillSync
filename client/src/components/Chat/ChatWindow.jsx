import React, { useEffect, useState, useRef } from 'react';
import socket from '../../services/socket';
import API from '../../services/api';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = ({ activeUser }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const scrollRef = useRef();
  const roomIdRef = useRef('');

  useEffect(() => {
    const fetchUser = async () => {
      const id = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!id || !token) {
        console.error('⚠️ Missing userId or token in localStorage');
        return;
      }

      try {
        const { data } = await API.get(`/users/${id}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(data);
      } catch (err) {
        console.error('❌ Failed to fetch current user:', err.message);
        alert('Error fetching user. Please login again.');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser || !activeUser) return;

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
      .catch((err) => console.error('❌ Error loading chat:', err.message));

    API.post(
      '/chat/mark-read',
      { roomId, userId: senderId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )
      .then(() => {
        console.log(`✅ Messages marked as read for room ${roomId} by ${senderId}`);
        socket.emit('messagesRead', { userId: receiverId, readerId: senderId });
      })
      .catch((err) => console.error('❌ Error marking messages as read:', err.message));

    const receiveHandler = (data) => {
      if (data.roomId === roomIdRef.current) {
        console.log(`✅ Received message in room ${roomId}`);
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on('receiveMessage', receiveHandler);
    return () => socket.off('receiveMessage', receiveHandler);
  }, [currentUser, activeUser]);

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

    const userId = currentUser?.user?._id;
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      console.error('⚠️ Missing userId or token for deletion');
      return alert('Authentication error. Please login again.');
    }

    try {
      const endpoint = type === 'forMe' ? '/chat/messages/delete-for-me' : '/chat/messages/delete-for-everyone';
      const response = await API.delete(endpoint, {
        data: { messageIds: selectedMessages, userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        if (type === 'forMe') {
          setMessages((prev) =>
            prev.map((m) =>
              selectedMessages.includes(m._id)
                ? { ...m, deletedBy: [...(m.deletedBy || []), userId] }
                : m
            )
          );
          console.log(`✅ Messages ${selectedMessages} deleted for user ${userId}`);
        } else {
          setMessages((prev) => prev.filter((m) => !selectedMessages.includes(m._id)));
          console.log(`✅ Messages ${selectedMessages} deleted for everyone by user ${userId}`);
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

  // Check if any selected message is older than 24 hours or not sent by the current user
  const isDeleteForEveryoneDisabled = selectedMessages.some((id) => {
    const message = messages.find((m) => m._id === id);
    if (!message) return true;
    const isNotSender = message.from !== currentUser.user._id;
    const isOlderThan24Hours = new Date() - new Date(message.time) > 24 * 60 * 60 * 1000;
    return isNotSender || isOlderThan24Hours;
  });

  if (!currentUser || !activeUser) {
    return <div className="flex-1 p-6 text-gray-600 text-lg">👈 Select a user to start chatting.</div>;
  }

  return (
    <div className="mt-6 flex-1 flex flex-col bg-gradient-to-b from-slate-100 to-white">
      <div className="p-4 bg-blue-600 text-white font-semibold text-lg shadow-sm flex justify-between items-center relative">
        <span>{activeUser.name}</span>
        {selectedMessages.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteOptions(!showDeleteOptions)}
              className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
            >
              🗑 Delete ({selectedMessages.length})
            </button>
            <AnimatePresence>
              {showDeleteOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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

      <div className="flex-1 p-4 overflow-y-auto bg-white space-y-3">
        {messages.map((m, i) => {
          const isFromCurrentUser = m.from === currentUser.user._id;
          const isDeletedForCurrentUser = m.deletedBy?.includes(currentUser.user._id);

          if (isDeletedForCurrentUser) return null;

          return (
            <div
              key={i}
              ref={scrollRef}
              onClick={() => m._id && toggleSelect(m._id)}
              className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-xl shadow max-w-[70%] text-sm cursor-pointer
                  ${selectedMessages.includes(m._id) ? 'ring-2 ring-red-400' : ''}
                  ${
                    isFromCurrentUser
                      ? 'bg-blue-500 text-white rounded-tr-sm'
                      : 'bg-gray-200 text-gray-800 rounded-tl-sm'
                  }`}
              >
                <p className={m.isDeleted ? 'italic text-gray-400' : ''}>
                  {m.isDeleted ? 'Message deleted' : m.message}
                </p>
                <p className="text-[10px] mt-1 text-right opacity-70">
                  {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-24 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div className="p-4 bg-white border-t shadow-inner flex gap-2 items-center sticky bottom-0">
        <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="text-2xl px-2">
          😊
        </button>
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;