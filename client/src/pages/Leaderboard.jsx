import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Stars from '../assets/stars.svg';

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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-4 sm:px-6 py-16 font-sans overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
        loading="lazy"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative max-w-4xl mx-auto z-10"
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 mb-12 flex items-center justify-center gap-3"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          Leaderboard
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
        </motion.h1>

        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-300/50"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {users.length === 0 ? (
            <motion.p
              className="text-center text-gray-600 text-base sm:text-lg"
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
                  className={`group relative flex flex-col sm:flex-row items-center justify-between py-4 px-4 sm:px-6 rounded-2xl mb-4 transition-all duration-300 ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 shadow-lg border-l-4 border-yellow-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 shadow-md border-l-4 border-gray-400'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-100 to-orange-50 shadow-md border-l-4 border-orange-400'
                      : 'bg-white/50 hover:bg-blue-50 hover:shadow-md border-l-4 border-blue-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <span
                      className={`text-xl sm:text-2xl font-bold ${
                        index === 0
                          ? 'text-yellow-600'
                          : index === 1
                          ? 'text-gray-600'
                          : index === 2
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      } w-8 sm:w-10`}
                    >
                      #{index + 1}
                    </span>

                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                      <motion.img
                        src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover border-2 border-blue-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=fallback-${user._id}`;
                        }}
                      />
                    </div>

                    <div className="truncate flex-1">
                      <Link
                        to={`/users/${user._id}/profile`}
                        className="font-semibold text-blue-600 hover:text-blue-800 transition text-sm sm:text-base outline-none"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right mt-4 sm:mt-0">
                    <p className="font-semibold text-green-500 text-base sm:text-lg">{user.points} pts</p>
                    <span
                      className={`inline-block mt-2 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
                        badgeStyles[user.badge] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.badge}
                    </span>
                  </div>

                  {/* Tooltip Appears Above */}
                  <div className="absolute z-50 left-8 sm:left-16 bottom-full mb-3 w-48 p-3 rounded-xl bg-gray-800/90 text-white text-sm shadow-xl 
                      opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible 
                      transition-all duration-300 pointer-events-none">
                    <div className="text-xs font-medium">
                      <span className={`inline-block mb-1 px-2 py-1 rounded-full ${badgeStyles[user.badge] || 'bg-gray-100 text-gray-600'}`}>
                        {user.badge || 'Unknown'}
                      </span>
                      <p>{user.points || 0} Points</p>
                    </div>
                    <div className="absolute -bottom-1 left-6 w-3 h-3 bg-gray-800/90 transform rotate-45"></div>
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
