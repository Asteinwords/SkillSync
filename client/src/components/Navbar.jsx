import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import API from '../services/api';
import Stars from '../assets/stars.svg';

// Animation variants for Framer Motion
const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};
const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    setAuthenticated(!!token);
  }, [location]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const { data } = await API.get('/users/follow-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data);
      } catch (err) {
        console.error('Error loading follow requests', err);
      }
    };
    fetchNotifications();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    navigate('/');
  };

  const handleAccept = async (senderId) => {
    try {
      await API.post(
        '/users/accept-follow',
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== senderId));
    } catch (err) {
      alert('Failed to accept follow request');
    }
  };

  return (
    <header className="relative z-20 shadow-lg">
      {/* 🌌 Stars Background */}
      <div className="absolute inset-0 h-full w-full -z-10">
        <img
          src={Stars}
          alt="Stars Background"
          className="w-full h-full object-cover opacity-20 pointer-events-none animate-pulse"
        />
      </div>

      {/* Navbar */}
      <motion.nav
        className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white font-sans relative"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={authenticated ? '/dashboard' : '/'}
            className="text-2xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400 flex items-center gap-2"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              SkillSync
            </motion.span>
          </Link>

          {/* Navigation Links */}
          <motion.div
            className="hidden md:flex space-x-8 items-center text-sm"
            variants={navVariants}
          >
            {!authenticated ? (
              <>
                <motion.div variants={linkVariants}>
                  <Link to="/" className="hover:text-blue-300 transition-colors">
                    Home
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <Link to="/login" className="hover:text-blue-300 transition-colors">
                    Login
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <Link to="/register" className="hover:text-blue-300 transition-colors">
                    Signup
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={linkVariants}>
                  <Link to="/dashboard" className="hover:text-blue-300 transition-colors">
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <Link to="/leaderboard" className="hover:text-blue-300 transition-colors">
                    Leaderboard
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <Link to="/matches" className="hover:text-blue-300 transition-colors">
                    Matches
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <Link to="/schedule" className="hover:text-blue-300 transition-colors">
                    Schedule
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <Link to="/room" className="hover:text-blue-300 transition-colors">
                    Rooms
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <Link to="/chat" className="hover:text-blue-300 transition-colors">
                    Chat
                  </Link>
                </motion.div>
                <motion.div variants={linkVariants}>
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Notification Bell */}
          {authenticated && (
            <div className="relative">
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-white/90 backdrop-blur-md text-blue-900 p-2 rounded-full shadow-lg hover:bg-blue-100 transition-all relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-5 border border-blue-200/50 z-50 text-gray-900"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <h4 className="font-bold text-blue-600 mb-3">Follow Requests</h4>
                    {notifications.length === 0 ? (
                      <p className="text-gray-600 text-sm">No new requests</p>
                    ) : (
                      notifications.map((user) => (
                        <motion.div
                          key={user._id}
                          className="flex justify-between items-center mb-4 last:mb-0"
                          variants={itemVariants}
                        >
                          <div className="truncate">
                            <p className="font-semibold text-blue-700">{user.name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                          <motion.button
                            onClick={() => handleAccept(user._id)}
                            className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm hover:bg-emerald-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            Accept
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.nav>
    </header>
  );
};

export default Navbar;