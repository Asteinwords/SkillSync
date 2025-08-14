import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-hot-toast';

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
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Account</h2>
      <p className="text-red-600 mb-4">
        Warning: Deleting your account is permanent and cannot be undone. All your data, including sessions, followers, and follow requests, will be removed.
      </p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Delete My Account'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Account Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This will also delete all your sessions and remove you from other users' followers and follow requests.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDeletion;