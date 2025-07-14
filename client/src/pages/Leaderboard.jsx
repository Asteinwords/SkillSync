import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import backgroundImg from '../assets/Success.jpg';
import trophyImage from '../assets/Trophy.jpg'; // transparent PNG
import { motion, AnimatePresence } from 'framer-motion';

const badgeStyles = {
  Beginner: 'bg-gray-200 text-gray-700',
  Contributor: 'bg-blue-200 text-blue-700',
  Mentor: 'bg-purple-200 text-purple-700',
  Expert: 'bg-yellow-200 text-yellow-800',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
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
    <div
      className="min-h-screen bg-cover bg-center py-16 px-4 relative"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      {/* Trophy Images */}
      <motion.img
        initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
        animate={{ opacity: 0.4, rotate: -15, scale: 1 }}
        transition={{ duration: 1.2 }}
        src={trophyImage}
        alt="trophy"
        className="absolute top-0 left-0 w-52 -translate-x-16 -translate-y-16 pointer-events-none"
      />
      {/* <motion.img
        initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
        animate={{ opacity: 0.4, rotate: 15, scale: 1 }}
        transition={{ duration: 1.2 }}
        src={trophyImage}
        alt="trophy"
        className="absolute bottom-0 right-0 w-52 translate-x-16 translate-y-16 pointer-events-none"
      /> */}

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-indigo-200"
        >
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
            Leaderboard
          </h1>

          {users.length === 0 ? (
            <p className="text-center text-gray-500">No users found.</p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  variants={itemVariants}
                  className={`flex items-center justify-between py-3 px-3 rounded-lg mb-3 ${
                    index === 0
                      ? 'bg-yellow-50 shadow-md'
                      : index === 1
                      ? 'bg-gray-50'
                      : index === 2
                      ? 'bg-orange-50'
                      : 'hover:bg-indigo-50 transition'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-indigo-700 w-8">#{index + 1}</span>
                    <div className="truncate">
                      <Link
                        to={`/users/${user._id}/profile`}
                        className="font-semibold text-blue-700 hover:underline block"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{user.points} pts</p>
                    <span
                      className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full ${
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
      </div>
    </div>
  );
};

export default Leaderboard;
