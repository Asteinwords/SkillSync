import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import API from '../../services/api';
import Stars from '../../assets/stars.svg';

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await API.get('/users/mutual-followers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setContacts(res.data);

        if (location.state?.receiverId) {
          const preselected = res.data.find(u => u._id === location.state.receiverId);
          if (preselected) setActiveUser(preselected);
        }
      } catch (err) {
        console.error('Error fetching mutual followers:', err);
      }
    };

    fetchContacts();
  }, [location.state]);

  return (
    <motion.div className="flex h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 relative">
      {/* Stars BG */}
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-20 z-0 pointer-events-none"
      />

      <Sidebar contacts={contacts} onUserSelect={setActiveUser} />
      <ChatWindow activeUser={activeUser} />
    </motion.div>
  );
};

export default ChatApp;
