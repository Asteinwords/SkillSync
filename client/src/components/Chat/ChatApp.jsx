import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import API from '../../services/api';
import socket from '../../services/socket';
import Stars from '../../assets/stars.svg';

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️ No token in localStorage, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchUserId = async () => {
      try {
        const { data } = await API.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(data._id);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error fetching user ID:', err.response?.data?.message || err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    };
    fetchUserId();
  }, [navigate]);

  useEffect(() => {
    if (!userId) {
      console.log('⚠️ Waiting for userId to proceed');
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
        const token = localStorage.getItem('token');
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
        console.error('❌ Error fetching data:', err.response?.data?.message || err.message);
      }
    };

    fetchData();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('error');
    };
  }, [location.state, userId]);

  useEffect(() => {
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

    socket.on('messagesRead', ({ userId: senderId }) => {
      console.log(`✅ Messages read for user ${senderId}`);
      setUnreadCounts((prev) => ({
        ...prev,
        [senderId]: 0,
      }));
    });

    return () => {
      socket.off('newMessageNotification');
      socket.off('messagesRead');
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600 text-lg">
        🔄 Loading...
      </div>
    );
  }

  return (
    <motion.div className="flex h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 relative overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />
      <div className="flex w-full h-full">
        <div
          className={`${
            activeUser ? 'hidden' : 'flex'
          } w-full sm:w-80 sm:flex h-full sm:border-r sm:border-gray-200 z-10`}
        >
          <Sidebar
            contacts={contacts}
            onUserSelect={setActiveUser}
            unreadCounts={unreadCounts}
          />
        </div>
        <div
          className={`${
            activeUser ? 'flex' : 'hidden sm:flex'
          } flex-1 h-full z-10`}
        >
          <ChatWindow
            activeUser={activeUser}
            userId={userId}
            setActiveUser={setActiveUser}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ChatApp;