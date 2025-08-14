import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import Stars from '../assets/stars.svg';

const AccountDeletion = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug token
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { data } = await API.delete('/users/delete', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response data:', data); // Debug response
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      toast.success('🎉 Account deleted successfully');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          const { data } = await API.post('/users/refresh', { refreshToken });
          localStorage.setItem('token', data.token);
          // Retry the delete request with the new token
          const retryResponse = await API.delete('/users/delete', {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          });
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          toast.success('🎉 Account deleted successfully');
          navigate('/login');
          return;
        } catch (refreshErr) {
          const msg = refreshErr.response?.data?.message || 'Session expired. Please log in again.';
          setError(msg);
          toast.error(`❌ ${msg}`);
          navigate('/login');
        }
      } else {
        const msg = err.response?.data?.message || 'Failed to delete account';
        console.error('Delete error:', err);
        setError(msg);
        toast.error(`❌ ${msg}`);
      }
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden flex items-center justify-center px-6 font-body text-white">
      {/* ✨ Background Stars Layer */}
      <motion.img
        src={Stars}
        alt="Stars Background"
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none animate-slow-float"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
      />

      {/* 🧠 Main Content */}
      <div className="z-10 max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-white font-display mb-6"
        >
          We’ll Miss You, <span className="text-indigo-400">SkillSync Friend</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300 text-lg md:text-xl mb-4"
        >
          We’re sad to see you go. Deleting your account is permanent and will remove all your data, including sessions, followers, and follow requests.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 mb-8"
        >
          If you’re sure, click below to proceed. We hope to see you back someday!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Delete My Account'}
          </button>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-red-600 mt-4"
          >
            {error}
          </motion.p>
        )}

        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Account Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This will permanently remove all your data from SkillSync.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AccountDeletion;