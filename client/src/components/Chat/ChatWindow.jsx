import React, { useEffect, useState, useRef } from 'react';
import socket from '../../services/socket';
import API from '../../services/api';

const ChatWindow = ({ activeUser }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const scrollRef = useRef();
  const roomIdRef = useRef('');

  // Fetch logged-in user
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

  // Join room and fetch messages
  useEffect(() => {
    if (!currentUser || !activeUser) return;

    const senderId = currentUser.user?._id;
    const receiverId = activeUser._id;
    if (!senderId || !receiverId) return;

    const roomId = [senderId, receiverId].sort().join('-');
    roomIdRef.current = roomId;

    socket.emit('joinRoom', { roomId });

    API.get(`/chat/${roomId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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

    return () => {
      socket.off('receiveMessage', receiveHandler);
    };
  }, [currentUser, activeUser]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!msg.trim()) return;

    const senderId = currentUser?.user?._id;
    const receiverId = activeUser?._id;

    if (!senderId || !receiverId) {
      console.error("❌ Cannot send message. User IDs are not loaded yet.");
      alert("User data is still loading.");
      return;
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

  if (!currentUser || !activeUser) {
    return <div className="flex-1 p-6 text-gray-600 text-lg">👈 Select a user to start chatting.</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-100 to-white">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white font-semibold text-lg shadow-sm">
        {activeUser.name}
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-white space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            ref={scrollRef}
            className={`flex ${m.from === currentUser.user._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-xl shadow-sm max-w-xs text-sm ${
                m.from === currentUser.user._id
                  ? 'bg-blue-500 text-white rounded-tr-sm'
                  : 'bg-gray-200 text-gray-800 rounded-tl-sm'
              }`}
            >
              <p>{m.message}</p>
              <p className="text-[10px] mt-1 text-right opacity-70">
                {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t shadow-inner flex gap-2 items-center">
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
