import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Human1 from '../assets/human-2.svg';
import Human2 from '../assets/human-3.svg';
import Stars from '../assets/stars.svg';

const Home = () => {
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

      {/* 👩 Top Right Character */}
     <motion.img
  src={Human1}
  alt="Top Character"
  className="absolute top-6 right-10 w-36 md:w-52 opacity-60 hue-rotate-[240deg] contrast-125 saturate-50 animate-float1"
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.5, duration: 1 }}
/>

      {/* 👨 Bottom Left Character */}
    <motion.img
  src={Human2}
  alt="Bottom Character"
  className="absolute bottom-0 left-8 w-44 md:w-60 opacity-60 hue-rotate-[240deg] contrast-125 saturate-50 animate-float2"
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.7, duration: 1.2 }}
/>


      {/* 🧠 Main Content */}
      <div className="z-10 max-w-3xl text-center md:text-left">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-white font-display mb-6"
        >
          Welcome to <span className="text-indigo-400">SkillSync </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300 text-lg md:text-xl mb-4"
        >
          A Peer-to-Peer Micro-Skill Barter Platform where you can{' '}
          <span className="text-indigo-300 font-semibold">exchange skills</span> instead of money.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 mb-8"
        >
          Want to learn Python? Offer your Photoshop skills in return. It's that simple.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center md:justify-start gap-4"
        >
          <Link
            to="/register"
            className="bg-gradient-to-r from-indigo-500 to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:opacity-90 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-transparent border border-indigo-500 text-indigo-300 px-6 py-2 rounded-full hover:bg-indigo-800 transition"
          >
            Login
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
