import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Stars from '../assets/stars.svg';
import trophyImage from '../assets/Trophy.jpg'; // Transparent PNG

const badgeStyles = {
  Beginner: 'bg-blue-100 text-blue-700',
  Contributor: 'bg-purple-100 text-purple-700',
  Mentor: 'bg-pink-100 text-pink-700',
  Expert: 'bg-yellow-100 text-yellow-800',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get('/users/top-users');
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-6 py-16 font-sans overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
      />
      {/* Trophy Images */}
      {/* <motion.img
        initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
        animate={{ opacity: 0.5, rotate: -10, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        src={trophyImage}
        alt="trophy"
        className="absolute top-0 left-0 w-48 -translate-x-12 -translate-y-12 pointer-events-none"
      />
      <motion.img
        initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
        animate={{ opacity: 0.5, rotate: 10, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        src={trophyImage}
        alt="trophy"
        className="absolute bottom-0 right-0 w-48 translate-x-12 translate-y-12 pointer-events-none"
      /> */}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative max-w-4xl mx-auto z-10"
      >
        <motion.h1
          className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 mb-12 flex items-center justify-center gap-3"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          Leaderboard
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
        </motion.h1>

        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-300/50"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {users.length === 0 ? (
            <motion.p
              className="text-center text-gray-600 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No users found.
            </motion.p>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  variants={itemVariants}
                  className={`flex items-center justify-between py-4 px-6 rounded-2xl mb-4 transition-all duration-300 ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 shadow-lg border-l-4 border-yellow-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 shadow-md border-l-4 border-gray-400'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-100 to-orange-50 shadow-md border-l-4 border-orange-400'
                      : 'bg-white/50 hover:bg-blue-50 hover:shadow-md border-l-4 border-blue-200'
                  }`}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="flex items-center gap-6">
                    <span
                      className={`text-2xl font-bold ${
                        index === 0
                          ? 'text-yellow-600'
                          : index === 1
                          ? 'text-gray-600'
                          : index === 2
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      } w-10`}
                    >
                      #{index + 1}
                    </span>
                    <motion.img
                      src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-blue-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="truncate max-w-xs">
                      <Link
                        to={`/users/${user._id}/profile`}
                        className="font-semibold text-blue-600 hover:text-blue-800 transition"
                      >
                        {user.name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500 text-lg">{user.points} pts</p>
                    <span
                      className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
                        badgeStyles[user.badge] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;