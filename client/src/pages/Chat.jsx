import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ChatWindow from '../components/Chat/ChatWindow';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { receiverId, receiverName } = location.state || {};
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    if (!receiverId) {
      console.warn('❌ No receiverId passed to Chat route');
      return navigate('/matches');
    }

    const fetchReceiver = async () => {
      try {
        const { data } = await API.get(`/users/${receiverId}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setActiveUser(data);
      } catch (err) {
        console.error('❌ Failed to fetch receiver profile:', err);
        navigate('/matches');
      }
    };

    fetchReceiver();
  }, [receiverId, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {activeUser ? (
        <ChatWindow activeUser={activeUser} />
      ) : (
        <div className="text-center text-gray-600">🔄 Loading chat with {receiverName || 'user'}...</div>
      )}
    </div>
  );
};

export default Chat;
