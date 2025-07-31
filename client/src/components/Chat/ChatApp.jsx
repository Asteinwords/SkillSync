import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './SideBar';
import ChatWindow from './ChatWindow';
import API from '../../services/api';
import socket from '../../services/socket';
import Stars from '../../assets/stars.svg';

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      console.error('⚠️ Missing userId or token in localStorage');
      return;
    }

    socket.emit('registerUser', { userId });

    socket.on('connect', () => {
      console.log(`✅ Socket connected for user ${userId}`);
      socket.emit('registerUser', { userId });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('error', (message) => {
      console.error('❌ Socket server error:', message);
    });

    const fetchData = async () => {
      try {
        const [contactsRes, unreadRes] = await Promise.all([
          API.get('/users/mutual-followers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get('/chat/unread-count', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setContacts(contactsRes.data || []);
        setUnreadCounts(unreadRes.data.unreadCounts || {});
        if (location.state?.receiverId) {
          const preselected = contactsRes.data.find(
            (u) => u._id === location.state.receiverId
          );
          if (preselected) setActiveUser(preselected);
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err.message);
      }
    };

    fetchData();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('error');
    };
  }, [location.state]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    socket.on('newMessageNotification', ({ from, to }) => {
      if (to === userId) {
        console.log(`✅ Received new message notification from ${from} for ${userId}`);
        setUnreadCounts((prev) => ({
          ...prev,
          [from]: (prev[from] || 0) + 1,
        }));
      }
    });

    socket.on('messagesRead', ({ userId }) => {
      console.log(`✅ Messages read for user ${userId}`);
      setUnreadCounts((prev) => ({
        ...prev,
        [userId]: 0,
      }));
    });

    return () => {
      socket.off('newMessageNotification');
      socket.off('messagesRead');
    };
  }, []);

  return (
    <motion.div className="flex h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 relative">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-20 z-0 pointer-events-none"
      />
      <Sidebar contacts={contacts} onUserSelect={setActiveUser} unreadCounts={unreadCounts} />
      <ChatWindow activeUser={activeUser} />
    </motion.div>
  );
};

export default ChatApp;