import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, User } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
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

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
};

const Navbar = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messageNotifications, setMessageNotifications] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getStorageItem = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[${new Date().toISOString()}] localStorage unavailable:`, e.message);
      return null;
    }
  };

  useEffect(() => {
    const token = getStorageItem('token');
    if (!token) {
      setAuthenticated(false);
      setUserId(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      setAuthenticated(true);
      console.log(`[${new Date().toISOString()}] JWT decoded, userId: ${decoded.id}`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Error decoding JWT:`, err.message);
      setAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId || !getStorageItem('token')) {
      console.log(`[${new Date().toISOString()}] ⚠️ Missing userId or token, skipping socket registration`);
      return;
    }

    socket.connect();
    socket.emit('registerUser', { userId });

    socket.on('connect', () => {
      console.log(`[${new Date().toISOString()}] ✅ Socket connected for user ${userId}`);
    });

    socket.on('connect_error', (err) => {
      console.error(`[${new Date().toISOString()}] ❌ Socket connection error:`, err.message);
    });

    socket.on('error', (message) => {
      console.error(`[${new Date().toISOString()}] ❌ Socket server error:`, message);
    });

    const fetchNotifications = async () => {
      try {
        console.log(`[${new Date().toISOString()}] Fetching notifications for user ${userId}`);
        const { data } = await API.get('/users/follow-requests', {
          headers: { Authorization: `Bearer ${getStorageItem('token')}` },
        });
        setNotifications(data || []);
        console.log(`[${new Date().toISOString()}] Fetched ${data?.length || 0} notifications`);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] ❌ Error loading follow requests:`, err.response?.data?.message || err.message);
      }
    };
    fetchNotifications();

    socket.on('newMessageNotification', (notification) => {
      if (notification.to === userId) {
        console.log(`[${new Date().toISOString()}] ✅ Received notification from ${notification.from} for ${userId}`);
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
      console.log(`[${new Date().toISOString()}] ✅ Clearing notifications for sender ${senderId}`);
      setMessageNotifications((prev) => {
        const newNotifications = { ...prev };
        delete newNotifications[senderId];
        return newNotifications;
      });
    });

    return () => {
      console.log(`[${new Date().toISOString()}] Cleaning up socket listeners for user ${userId}`);
      socket.disconnect();
      socket.off('connect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('newMessageNotification');
      socket.off('messagesRead');
    };
  }, [userId]);

  const handleLogout = () => {
    console.log(`[${new Date().toISOString()}] Logging out user ${userId}`);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAuthenticated(false);
    setUserId(null);
    navigate('/');
  };

  const handleAccept = async (senderId) => {
    try {
      console.log(`[${new Date().toISOString()}] Accepting follow request from ${senderId}`);
      await API.post(
        '/users/accept-follow',
        { senderId },
        { headers: { Authorization: `Bearer ${getStorageItem('token')}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== senderId));
      console.log(`[${new Date().toISOString()}] Follow request from ${senderId} accepted`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Failed to accept follow request:`, err.response?.data?.message || err.message);
    }
  };

  const handleMessageClick = (from, senderName) => {
    console.log(`[${new Date().toISOString()}] Navigating to chat with ${senderName} (${from})`);
    navigate('/chat', {
      state: { receiverId: from, receiverName: senderName },
    });
    setMessageNotifications((prev) => {
      const newNotifications = { ...prev };
      delete newNotifications[from];
      return newNotifications;
    });
    setShowDropdown(false);
    setIsSidebarOpen(false);
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

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white p-2 focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Desktop Navigation */}
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
                  <Link to="/webpage" className="hover:text-blue-300 transition-colors">
                    Home
                  </Link>
                </motion.div>
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
                <motion.div variants={linkVariants}>
                  <Link to="/chat" className="hover:text-blue-300 transition-colors">
                    Chat
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Notification Bell and User Dropdown */}
          {authenticated && (
            <div className="flex items-center space-x-4">
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

              {/* User Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="bg-white/90 backdrop-blur-md text-blue-900 p-2 rounded-full shadow-lg hover:bg-blue-100 transition-all"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <User className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-blue-200/50 z-50 text-gray-900"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <motion.button
                        onClick={() => {
                          handleLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        variants={itemVariants}
                      >
                        Logout
                      </motion.button>
                      <motion.div variants={itemVariants}>
                        <Link
                          to="/delete"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Delete Account
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            >
              <motion.div
                className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white p-6 shadow-lg"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold">SkillSync</span>
                  <motion.button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <div className="flex flex-col space-y-4">
                  {!authenticated ? (
                    <>
                      <Link
                        to="/"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        to="/login"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Signup
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/webpage"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        to="/dashboard"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/community"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Community
                      </Link>
                      <Link
                        to="/leaderboard"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Leaderboard
                      </Link>
                      <Link
                        to="/matches"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Matches
                      </Link>
                      <Link
                        to="/schedule"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Schedule
                      </Link>
                      <Link
                        to="/chat"
                        className="text-lg hover:text-blue-300 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        Chat
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsSidebarOpen(false);
                        }}
                        className="text-lg hover:text-red-300 transition-colors text-left"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

export default Navbar;