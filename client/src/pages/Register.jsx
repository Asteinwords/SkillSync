// Updated frontend/src/components/Register.js
import React, { useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/users/register', form);
      toast.success('🎉 Registered successfully. Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error registering user';
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 font-body">
      <div className="bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-display font-bold text-indigo-300 mb-4">SkillSync</h1>
        <p className="text-lg text-slate-300 italic max-w-md">
          "Learn what you love. Teach what you know. SkillSync is your barter buddy."
        </p>
      </div>
      <div className="flex items-center justify-center bg-slate-100 px-4">
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-center text-slate-800 font-display">
            Create your SkillSync Account
          </h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300 outline-none"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300 outline-none"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300 outline-none"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Login here
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Register;