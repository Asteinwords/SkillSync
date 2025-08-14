import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Sparkles, MessageCircle, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Stars from '../assets/stars.svg';
import moment from 'moment';

// Memoized PastRoomCard
const PastRoomCard = ({ session, index, myId }) => {
  const role = session.requester?._id === myId ? 'requester' : 'recipient';
  const userJoinTime = role === 'requester' ? session.pastRoom?.requesterJoinTime : session.pastRoom?.recipientJoinTime;
  const userLeaveTime = role === 'requester' ? session.pastRoom?.requesterLeaveTime : session.pastRoom?.recipientLeaveTime;

  if (!session.pastRoom || !session.pastRoom.hostName || !session.pastRoom.participantName) {
    console.warn(`[${moment().format('YYYY-MM-DD HH:mm:ss +05:30')}] Skipping past room due to missing data:`, { sessionId: session._id, pastRoom: session.pastRoom });
    return null;
  }

  return (
    <motion.div
      key={session._id}
      variants={itemVariants}
      className={`flex flex-col py-2 px-3 sm:py-3 sm:px-4 rounded-xl mb-3 transition-all duration-300 shadow-md bg-gradient-to-r from-teal-50/80 to-blue-50/80 border-l-4 border-teal-400 ${
        index === 0 ? 'from-teal-50/80 to-blue-50/80' :
        index === 1 ? 'from-blue-50/80 to-gray-50/80' :
        'from-purple-50/80 to-teal-50/80'
      }`}
      style={{ overflow: 'visible' }}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-teal-800 flex items-center gap-2 text-xs sm:text-sm">
          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-teal-200 flex items-center justify-center text-teal-600 font-bold">
            {session.pastRoom.hostName[0] || '?'}
          </span>
          With: {role === 'requester' ? session.pastRoom.participantName : session.pastRoom.hostName}
        </p>
        <span className="text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full font-medium">
          Done
        </span>
      </div>
      <p className="text-xs text-gray-600 mt-1 sm:mt-2">
        Join: {userJoinTime || 'Not joined'} | Leave: {userLeaveTime || 'Not marked'}
      </p>
    </motion.div>
  );
};

const badgeStyles = {
  Beginner: 'bg-blue-100 text-blue-700',
  Contributor: 'bg-purple-100 text-purple-700',
  Mentor: 'bg-pink-100 text-pink-700',
  Expert: 'bg-yellow-100 text-yellow-800',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'backOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 100, rotate: -10 },
  visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.8, ease: 'circOut' } },
};

const tipVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  exit: { opacity: 0, x: 50, transition: { duration: 0.5, ease: 'easeInOut' } },
};

const MainHome = () => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [communityStats, setCommunityStats] = useState({ totalPosts: 0, activeUsersToday: 0 });
  const [currentTips, setCurrentTips] = useState([]);
  const myId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const tips = useMemo(() => [
    'Complete your profile to attract more skill partners.',
    'Earn points by teaching or engaging in community activities.',
    'Schedule sessions via the Community Hub for better matches.',
    'Check your feedback to improve your SkillSync experience.',
    'Join discussions in the forum to share your expertise.',
    'Use clear, concise titles for your session requests.',
    'Be punctual for scheduled sessions to build trust.',
    'Provide constructive feedback after each session.',
    'Explore new skills to expand your learning opportunities.',
    'Connect with users who share your interests.',
    'Update your availability regularly for better scheduling.',
    'Celebrate milestones to stay motivated in your learning journey.'
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss +05:30')}] No token, redirecting to login`);
        navigate('/login');
        return;
      }
      try {
        const [userRes, leaderboardRes, sessionsRes, postsRes] = await Promise.all([
          API.get('/users/me', { headers: { Authorization: `Bearer ${token}` } }),
          API.get('/users/top-users'),
          API.get('/sessions', { headers: { Authorization: `Bearer ${token}` } }),
          API.get('/post/posts?page=1&limit=1', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(userRes.data);
        setUsers(leaderboardRes.data.slice(0, 3));
        setSessions(sessionsRes.data);
        setCommunityStats({
          totalPosts: postsRes.data.total || 0,
          activeUsersToday: sessionsRes.data.filter(s => s.status === 'active').length || 0,
        });
      } catch (err) {
        console.error(`[${moment().format('YYYY-MM-DD HH:mm:ss +05:30')}] Fetch Error:`, err.response?.data || err.message);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  useEffect(() => {
    const getRandomTips = () => {
      const shuffled = [...tips].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4);
    };
    setCurrentTips(getRandomTips());
    const tipInterval = setInterval(() => {
      setCurrentTips(getRandomTips());
    }, 5000);
    return () => clearInterval(tipInterval);
  }, [tips]);

  const feedbacks = useMemo(() => sessions
    .filter((s) => s.status === 'done' && (s.requesterFeedback || s.recipientFeedback))
    .flatMap((s) => [
      s.requesterFeedback && s.requester?._id !== myId ? { ...s.requesterFeedback, from: s.requester.name } : null,
      s.recipientFeedback && s.recipient?._id !== myId ? { ...s.recipientFeedback, from: s.recipient.name } : null,
    ])
    .filter(Boolean), [sessions, myId]);

  if (!user) {
    return <p className="text-center mt-20 text-2xl text-yellow-400 animate-pulse">Loading...</p>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-purple-900 to-indigo-900 text-white overflow-hidden p-4 sm:p-6">
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={Stars}
          alt="Starry Sky"
          className="w-full h-full object-cover opacity-50"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      <motion.div
        className="relative z-10 flex items-center justify-center sm:justify-start gap-6 py-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300"
          whileHover={{ rotate: 360, transition: { duration: 1 } }}
        >
          <Link to={`/users/${myId}/profile`}>
            <motion.img
              src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
              alt="Profile"
              className="w-20 sm:w-24 h-20 sm:h-24 rounded-full border-4 border-neon-blue-500 shadow-[0_0_15px_#00ffff] object-cover cursor-pointer"
              whileHover={{ scale: 1.2, boxShadow: '0 0 25px #00ffff' }}
              transition={{ duration: 0.3 }}
              onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=fallback-${myId}`; }}
            />
          </Link>
        </motion.div>
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neon-green-400 to-neon-pink-500 drop-shadow-[0_0_10px_#ff00ff]"
        >
          Welcome, {user.name}
        </motion.h2>
        <motion.h1
          variants={itemVariants}
          className="text-xl sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue-300 to-neon-purple-500 hidden sm:block"
        >
          SkillSync: Exchange skills, ignite growth!
        </motion.h1>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-br from-purple-800/80 to-indigo-900/80 rounded-2xl p-4 border-2 border-neon-blue-500 shadow-[0_0_20px_#00ffff] transform hover:scale-105 transition-transform duration-300 w-full mx-auto max-w-4xl mt-6"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-neon-green-400 mb-3">Top 3 Leaders</h2>
        {users.length === 0 ? (
          <motion.p className="text-center text-gray-300 text-sm sm:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            No users found.
          </motion.p>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <motion.div
                key={user._id}
                variants={itemVariants}
                className={`group relative flex flex-col sm:flex-row items-center justify-between py-2 px-3 rounded-xl bg-gradient-to-br from-purple-800/80 to-indigo-900/80 border-l-4 ${
                  index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-400' : 'border-orange-400'
                }`}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px #fff', zIndex: 10 }}
                style={{ overflow: 'visible' }}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl sm:text-2xl font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`}>
                    #{index + 1}
                  </span>
                  <motion.img
                    src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-neon-blue-500"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    loading="lazy"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=fallback-${user._id}`; }}
                  />
                  <div className="truncate">
                    <span className="font-semibold text-neon-blue-300 text-sm sm:text-base">{user.name}</span>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neon-green-400 text-sm sm:text-base">{user.points} pts</p>
                  <span className={`inline-block text-xs sm:text-sm px-2 py-1 rounded-full ${badgeStyles[user.badge] || 'bg-gray-700 text-gray-300'}`}>
                    {user.badge}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-6 mt-6">
        <motion.div
          variants={cardVariants}
          className="bg-gradient-to-br from-indigo-900/80 to-purple-800/80 rounded-2xl p-4 border-2 border-neon-pink-500 shadow-[0_0_20px_#ff00ff] transform hover:scale-105 transition-transform duration-300 w-full sm:w-1/2 mx-auto max-w-md"
          style={{ overflow: 'visible' }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-neon-pink-400 mb-3">Recent Sessions</h2>
          {sessions.filter((s) => s.status === 'done' && s.pastRoom).length === 0 ? (
            <motion.p className="text-center text-gray-300 text-sm sm:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              No past sessions found.
            </motion.p>
          ) : (
            <div className="space-y-4">
              {sessions
                .filter((s) => s.status === 'done' && s.pastRoom)
                .slice(0, 3)
                .map((s, index) => (
                  <PastRoomCard key={s._id} session={s} index={index} myId={myId} />
                ))}
            </div>
          )}
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-gradient-to-br from-teal-900/80 to-green-900/80 rounded-2xl p-4 border-2 border-neon-green-500 shadow-[0_0_20px_#00ff00] transform hover:scale-105 transition-transform duration-300 w-full sm:w-1/2 mx-auto max-w-md"
          style={{ overflow: 'visible' }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-neon-green-400 mb-3">Quick Tips</h2>
          <AnimatePresence>
            <div className="space-y-4">
              {currentTips.map((tip, index) => (
                <motion.div
                  key={`${tip}-${index}`}
                  variants={tipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-gradient-to-br from-green-800/80 to-teal-800/80 rounded-xl p-3 shadow-md"
                  style={{ overflow: 'visible' }}
                >
                  <p className="text-sm sm:text-base text-gray-200">{tip}</p>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-br from-blue-900/80 to-cyan-900/80 rounded-3xl p-6 border-4 border-neon-blue-500 shadow-[0_0_30px_#00ffff] transform hover:scale-110 transition-transform duration-300 w-full mx-auto max-w-4xl mt-6"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-neon-blue-400 mb-4">Community Highlights</h2>
        <motion.div
          variants={cardVariants}
          className="bg-gradient-to-br from-cyan-800/80 to-blue-800/80 rounded-2xl p-4"
        >
          <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
            <div className="text-center">
              <p className="text-lg sm:text-xl text-gray-300">Total Posts</p>
              <p className="text-2xl sm:text-3xl font-bold text-neon-blue-300">{communityStats.totalPosts}</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl text-gray-300">Active Users Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-neon-blue-300">{communityStats.activeUsersToday}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-br from-pink-900/80 to-red-900/80 rounded-2xl p-4 border-2 border-neon-pink-500 shadow-[0_0_20px_#ff00ff] transform hover:scale-105 transition-transform duration-300 w-full mx-auto max-w-4xl mt-6"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-neon-pink-400 mb-3">What People Say About You</h2>
        {feedbacks.length === 0 ? (
          <motion.p
            className="text-center text-gray-300 text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No feedback yet.
          </motion.p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gradient-to-br from-red-800/80 to-pink-800/80"
                style={{ overflow: 'visible' }}
              >
                <Star className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base text-neon-pink-300 font-semibold">
                    {fb.from}: Rating: {fb.rating} Star{fb.rating > 1 ? 's' : ''}, Feedback: "{fb.comment}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MainHome;