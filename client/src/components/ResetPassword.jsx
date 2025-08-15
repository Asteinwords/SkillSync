// New frontend/src/components/ResetPassword.js (add this file and route it in App.js as /reset-password/:token)
import React, { useState } from 'react';
import API from '../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      await API.post(`/users/reset-password/${token}`, { password });
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.';
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-extrabold text-center text-slate-800 font-display">
          Reset Password
        </h2>
        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-2 rounded-md hover:opacity-90 transition flex items-center justify-center"
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white mr-2"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          )}
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <p className="text-center text-sm text-gray-600">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default ResetPassword;