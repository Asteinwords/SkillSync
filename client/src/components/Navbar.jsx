import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import API from '../services/api';
import socket from '../services/socket';
import Stars from '../assets/stars.svg';

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const linkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messageNotifications, setMessageNotifications] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    setAuthenticated(!!token && !!userId);
  }, [location, token, userId]);

  useEffect(() => {
    if (!userId || !token) {
      console.error('⚠️ Missing userId or token in localStorage');
      return;
    }

    socket.emit('registerUser', { userId });

    socket.on('connect', () => {
      console.log(`✅ Socket connected for user ${userId}`);
      socket.emit('registerUser', { userId });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('error', (message) => {
      console.error('❌ Socket server error:', message);
    });

    const fetchNotifications = async () => {
      try {
        const { data } = await API.get('/users/follow-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data || []);
      } catch (err) {
        console.error('❌ Error loading follow requests:', err.message);
      }
    };
    fetchNotifications();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('error');
    };
  }, [token, userId]);

  useEffect(() => {
    if (!userId) return;

    socket.on('newMessageNotification', (notification) => {
      if (notification.to === userId) {
        console.log(`✅ Received notification from ${notification.from} for ${userId}`);
        setMessageNotifications((prev) => {
          const existing = prev[notification.from] || {
            messages: [],
            senderName: notification.senderName,
            from: notification.from,
          };
          const newMessage = {
            id: `${notification.from}-${notification.time}`,
            message: notification.message,
          };
          return {
            ...prev,
            [notification.from]: {
              ...existing,
              messages: [...existing.messages, newMessage],
            },
          };
        });
      }
    });

    socket.on('messagesRead', ({ userId: senderId }) => {
      console.log(`✅ Clearing notifications for sender ${senderId}`);
      setMessageNotifications((prev) => {
        const newNotifications = { ...prev };
        delete newNotifications[senderId];
        return newNotifications;
      });
    });

    return () => {
      socket.off('newMessageNotification');
      socket.off('messagesRead');
    };
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
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
      console.error('❌ Failed to accept follow request:', err.message);
    }
  };

  const handleMessageClick = (from, senderName) => {
    navigate('/chat', {
      state: { receiverId: from, receiverName: senderName },
    });
    setMessageNotifications((prev) => {
      const newNotifications = { ...prev };
      delete newNotifications[from];
      return newNotifications;
    });
    setShowDropdown(false);
  };

  const notificationCount = notifications.length + Object.values(messageNotifications).reduce(
    (sum, n) => sum + n.messages.length,
    0
  );

  return (
    <header className="relative z-20 shadow-lg">
      <div className="absolute inset-0 h-full w-full -z-10">
        <img
          src={Stars}
          alt="Stars Background"
          className="w-full h-full object-cover opacity-20 pointer-events-none animate-pulse"
        />
      </div>

      <motion.nav
        className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white font-sans relative"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
                  <Link to="/community" className="hover:text-blue-300 transition-colors">
                    Community
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
                {/* <motion.div variants={linkVariants}>
                  <Link to="/room" className="hover:text-blue-300 transition-colors">
                    Rooms
                  </Link>
                </motion.div> */}
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

          {authenticated && (
            <div className="relative">
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-white/90 backdrop-blur-md text-blue-900 p-2 rounded-full shadow-lg hover:bg-blue-100 transition-all relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {notificationCount}
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
                    <h4 className="font-bold text-blue-600 mb-3">Notifications</h4>
                    {notificationCount === 0 ? (
                      <p className="text-gray-600 text-sm">No new notifications</p>
                    ) : (
                      <>
                        {notifications.map((user) => (
                          <motion.div
                            key={user._id}
                            className="flex justify-between items-center mb-4 last:mb-0"
                            variants={itemVariants}
                          >
                            <div className="truncate">
                              <p className="font-semibold text-blue-700">{user.name}</p>
                              <p className="text-sm text-gray-500 truncate">Follow request</p>
                            </div>
                            <motion.button
                              onClick={() => handleAccept(user._id)}
                              className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm hover:bg-emerald-600 transition-colors"
                              whileHover={{ scale: 1.05 }}
                            >
                              Accept
                            </motion.button>
                          </motion.div>
                        ))}
                        {Object.values(messageNotifications).map((notification) => (
                          <motion.div
                            key={notification.from}
                            className="flex justify-between items-center mb-4 last:mb-0 cursor-pointer"
                            variants={itemVariants}
                            onClick={() => handleMessageClick(notification.from, notification.senderName)}
                          >
                            <div className="truncate">
                              <p className="font-semibold text-blue-700">{notification.senderName}</p>
                              <p className="text-sm text-gray-500 truncate">
                                {notification.messages.map((m) => m.message).join(' and ')}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </>
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