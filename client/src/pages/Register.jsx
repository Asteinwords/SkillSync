import React, { useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/register', form);
      alert('Registered successfully');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering user');
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 font-body">
      {/* Left Branding */}
      <div className="bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-display font-bold text-indigo-300 mb-4">SkillSync</h1>
        <p className="text-lg text-slate-300 italic max-w-md">
          "Learn what you love. Teach what you know. SkillSync is your barter buddy."
        </p>
      </div>

      {/* Form */}
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
          <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
            Register
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
