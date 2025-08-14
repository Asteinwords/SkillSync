import React, { useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await API.post('/users/login', form);

    const { token, refreshToken, _id } = data;
    if (!token || !refreshToken || !_id) {
      throw new Error('Invalid login response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', _id); // Store userId
    toast.success('🎉 Login successful');
    navigate('/webpage');
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed. Try again.';
    toast.error(`❌ ${msg}`);
    console.error('Login error:', err);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen grid md:grid-cols-2 font-body">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-display font-bold text-indigo-300 mb-4">SkillSync</h1>
        <p className="text-lg text-gray-300 italic max-w-md">
          "Exchange what you know for what you want to learn. Your skills are your currency."
        </p>
      </div>
      <div className="flex items-center justify-center bg-slate-100 px-4">
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-center text-slate-800 font-display">
            Login to SkillSync
          </h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
            value={form.password}
            onChange={handleChange}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-sm text-gray-600">
            New here?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;