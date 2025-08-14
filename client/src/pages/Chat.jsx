import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ChatWindow from '../components/Chat/ChatWindow';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { receiverId, receiverName } = location.state || {};
  const [activeUser, setActiveUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!receiverId) {
      console.warn('❌ No receiverId passed to Chat route');
      navigate('/matches');
      return;
    }

    const fetchReceiver = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await API.get(`/users/${receiverId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActiveUser(data);
      } catch (err) {
        console.error('❌ Failed to fetch receiver profile:', err.response?.data?.message || err.message);
        navigate('/matches');
      }
    };

    fetchReceiver();
  }, [receiverId, navigate]);

  if (isLoading || !userId) {
    return <div className="text-center text-gray-600">🔄 Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {activeUser ? (
        <ChatWindow activeUser={activeUser} userId={userId} />
      ) : (
        <div className="text-center text-gray-600">🔄 Loading chat with {receiverName || 'user'}...</div>
      )}
    </div>
  );
};

export default Chat;