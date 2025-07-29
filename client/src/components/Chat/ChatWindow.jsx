import React, { useEffect, useState, useRef } from 'react';
import socket from '../../services/socket';
import API from '../../services/api';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ activeUser }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef();
  const roomIdRef = useRef('');

  useEffect(() => {
    const fetchUser = async () => {
      const id = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!id || !token) return;

      try {
        const { data } = await API.get(`/users/${id}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(data);
      } catch (err) {
        alert('Error fetching user. Please login again.');
        console.error('❌ Failed to fetch current user:', err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser || !activeUser) return;

    const senderId = currentUser.user?._id;
    const receiverId = activeUser._id;
    if (!senderId || !receiverId) return;

    const roomId = [senderId, receiverId].sort().join('-');
    roomIdRef.current = roomId;

    socket.emit('joinRoom', { roomId });

    API.get(`/chat/${roomId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => console.error('❌ Error loading chat:', err));

    const receiveHandler = (data) => {
      if (data.roomId === roomIdRef.current) {
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

    if (!senderId || !receiverId) return alert("User not ready");

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

  const deleteSelectedMessages = async () => {
    try {
      await API.delete('/chat/messages', {
        data: {
          messageIds: selectedMessages,
          userId: currentUser.user._id,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setMessages((prev) =>
        prev.map((m) =>
          selectedMessages.includes(m._id)
            ? { ...m, deletedBy: [...(m.deletedBy || []), currentUser.user._id] }
            : m
        )
      );
      setSelectedMessages([]);
    } catch (err) {
      console.error('❌ Error deleting messages:', err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMsg((prev) => prev + emojiData.emoji);
  };

  if (!currentUser || !activeUser) {
    return <div className="flex-1 p-6 text-gray-600 text-lg">👈 Select a user to start chatting.</div>;
  }

  return (
    <div className="mt-6 flex-1 flex flex-col bg-gradient-to-b from-slate-100 to-white">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white font-semibold text-lg shadow-sm flex justify-between items-center">
        <span>{activeUser.name}</span>
        {selectedMessages.length > 0 && (
          <button
            onClick={deleteSelectedMessages}
            className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
          >
            🗑 Delete ({selectedMessages.length})
          </button>
        )}
      </div>

      {/* Chat Messages */}
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
    onClick={() => m._id && toggleSelect(m._id)}
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

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-24 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Input Area */}
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
