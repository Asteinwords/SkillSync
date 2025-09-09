import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Sparkles, Star, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Stars from '../assets/stars.svg';
import moment from 'moment';
import Guide from '../components/Guide';

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
      className="flex flex-col py-3 px-4 rounded-2xl mb-4 shadow-md bg-gray-50/90 backdrop-blur-sm border-l-4 border-gradient-to-r from-green-300 to-blue-300 hover:shadow-lg hover:scale-102 transition-all duration-300"
      whileHover={{ y: -3, boxShadow: '0 8px 16px rgba(134, 239, 172, 0.2)' }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="font-medium text-green-700 flex items-center gap-2 text-sm">
          <span className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold animate-gentle-pulse">
            {session.pastRoom.hostName[0] || '?'}
          </span>
          With: {role === 'requester' ? session.pastRoom.participantName : session.pastRoom.hostName}
        </p>
        <span className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium animate-soft-bounce">
          Done
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Join: {userJoinTime || 'Not joined'} | Leave: {userLeaveTime || 'Not marked'}
      </p>
    </motion.div>
  );
};

const badgeStyles = {
  Beginner: 'bg-blue-50 text-blue-600',
  Contributor: 'bg-purple-50 text-purple-600',
  Mentor: 'bg-pink-50 text-pink-600',
  Expert: 'bg-yellow-50 text-yellow-700',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, type: 'spring', bounce: 0.35 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotate: 2 },
  visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.9, type: 'spring', bounce: 0.25 } },
};

const leaderboardVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1.2, type: 'spring', stiffness: 120, damping: 15 } },
};

const tipVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const MainHome = () => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [communityStats, setCommunityStats] = useState({ totalPosts: 0, activeUsersToday: 0 });
  const [currentTips, setCurrentTips] = useState([]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
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

        let updatedUser = { ...userRes.data };
        let newBadge = 'Beginner';
        if (userRes.data.points > 100) newBadge = 'Expert';
        else if (userRes.data.points > 50) newBadge = 'Mentor';
        else if (userRes.data.points > 20) newBadge = 'Contributor';
        if (newBadge !== userRes.data.badge) {
          console.warn(`Badge mismatch for current user ${userRes.data._id}: API returned ${userRes.data.badge}, calculated ${newBadge} (points: ${userRes.data.points})`);
          const { data: updatedProfile } = await API.put(
            '/users/profile-info',
            { badge: newBadge },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updatedUser = { ...updatedProfile, badge: newBadge };
        }
        setUser(updatedUser);
        console.log('Current User Data:', updatedUser);

        const updatedLeaderboardUsers = leaderboardRes.data.slice(0, 3).map(user => {
          let newBadge = 'Beginner';
          if (user.points > 100) newBadge = 'Expert';
          else if (user.points > 50) newBadge = 'Mentor';
          else if (user.points > 20) newBadge = 'Contributor';
          if (newBadge !== user.badge) {
            console.warn(`Badge mismatch for leaderboard user ${user._id}: API returned ${user.badge}, calculated ${newBadge} (points: ${user.points})`);
            return { ...user, badge: newBadge };
          }
          return user;
        });
        setUsers(updatedLeaderboardUsers);
        console.log('Leaderboard Users:', updatedLeaderboardUsers);

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
    const interval = setInterval(fetchData, 60000);
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
    }, 10000);
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
    return <p className="text-center mt-20 text-xl sm:text-2xl text-blue-400 animate-pulse">Loading...</p>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 text-gray-800 overflow-hidden p-4 sm:p-8">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .animate-gentle-pulse {
            animation: gentle-pulse 2s ease-in-out infinite;
          }
          .animate-soft-bounce {
            animation: soft-bounce 1.5s ease-in-out infinite;
          }
          @keyframes gentle-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes soft-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}
      </style>
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={Stars}
          alt="Starry Sky"
          className="w-full h-full object-cover opacity-10 pointer-events-none"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1], rotate: [0, 3, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.header
          className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-lg mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Link to={`/users/${myId}/profile`} className="flex-shrink-0">
                <motion.img
                  src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                  alt="Profile"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gradient-to-r from-green-300 to-blue-300 shadow-md object-cover cursor-pointer"
                  whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(134, 239, 172, 0.4)' }}
                  transition={{ duration: 0.4 }}
                  loading="lazy"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=fallback-${myId}`; }}
                />
              </Link>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
                  Welcome, {user.name}
                </h2>
                <span className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-semibold ${badgeStyles[user.badge] || 'bg-gray-50 text-gray-500'}`}>
                  {user.badge}
                </span>
              </div>
            </div>
            <h1 className="text-lg sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400 text-center">
              SkillSync: Exchange skills, ignite growth!
            </h1>
          </div>
        </motion.header>

        {/* Guide Animation */}
        <motion.div
          className="relative z-10 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
        >
          <svg width="100%" height="70" className="inline-block max-w-[400px]">
            <motion.path
              d="M 10 35 Q 70 20 130 35 T 230 35 T 330 35"
              fill="none"
              stroke="url(#guideGradientLight)"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, repeat: 2, repeatType: 'reverse', ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="guideGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#86efac' }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
              </linearGradient>
            </defs>
          </svg>
          <motion.button
            onClick={() => setIsGuideOpen(true)}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-base sm:text-xl font-bold text-green-500 hover:text-green-600 transition-colors"
            style={{ whiteSpace: 'nowrap' }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            Got a doubt? Refer to our guide
            <HelpCircle className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </motion.button>
        </motion.div>

        {/* Guide Modal */}
        <Guide isOpen={isGuideOpen} setIsOpen={setIsGuideOpen} />

        {/* Main Grid Sections */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          {/* Leaderboard Card */}
          <motion.section
            className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-lg overflow-hidden"
            variants={leaderboardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(134, 239, 172, 0.3)' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-green-600 mb-6">Top 3 Leaders</h2>
            {users.length === 0 ? (
              <motion.p className="text-center text-gray-500 text-sm sm:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                No users found.
              </motion.p>
            ) : (
              <div className="space-y-6 overflow-y-auto max-h-96 scrollbar-hide">
                {users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    variants={itemVariants}
                    className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-4 sm:px-6 rounded-2xl bg-gray-50/50 border-l-4 ${
                      index === 0 ? 'border-yellow-300' : index === 1 ? 'border-gray-300' : 'border-orange-300'
                    } transition-all duration-300`}
                    whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(134, 239, 172, 0.3)', zIndex: 10 }}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xl sm:text-2xl font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : 'text-orange-500'}`}>
                        #{index + 1}
                      </span>
                      <motion.img
                        src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 object-cover border-green-200/50"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ duration: 0.4 }}
                        loading="lazy"
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=fallback-${user._id}`; }}
                      />
                      <div className="truncate">
                        <span className="font-semibold text-gray-800 text-base sm:text-lg">{user.name}</span>
                        <p className="text-sm sm:text-base text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">{user.points} pts</p>
                      <span className={`inline-block text-sm px-4 py-1 rounded-full ${badgeStyles[user.badge] || 'bg-gray-50 text-gray-500'} animate-gentle-pulse`}>
                        {user.badge}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Sessions Card */}
          <motion.section
            className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-lg relative overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(134, 239, 172, 0.3)' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-green-600 mb-6">Recent Sessions</h2>
            <div className="space-y-4 overflow-y-auto max-h-80 scrollbar-hide">
              {sessions.filter((s) => s.status === 'done' && s.pastRoom).length === 0 ? (
                <motion.p className="text-center text-gray-500 text-sm sm:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                  No past sessions found.
                </motion.p>
              ) : (
                sessions
                  .filter((s) => s.status === 'done' && s.pastRoom)
                  .slice(0, 3)
                  .map((s, index) => (
                    <PastRoomCard key={s._id} session={s} index={index} myId={myId} />
                  ))
              )}
            </div>
          </motion.section>

          {/* Tips Card */}
          <motion.section
            className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-lg relative overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(134, 239, 172, 0.3)' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-6">Quick Tips</h2>
            <div className="space-y-4 overflow-y-auto max-h-80 scrollbar-hide">
              <AnimatePresence>
                {currentTips.map((tip, index) => (
                  <motion.div
                    key={`${tip}-${index}`}
                    variants={tipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="bg-gray-50/50 rounded-2xl p-4 shadow-sm hover:bg-gray-100/50 transition-colors duration-300"
                  >
                    <p className="text-sm sm:text-base text-gray-700">{tip}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Feedback Card */}
          <motion.section
            className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-lg overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(134, 239, 172, 0.3)' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-6">What People Say About You</h2>
            <div className="space-y-4 overflow-y-auto max-h-80 scrollbar-hide">
              {feedbacks.length === 0 ? (
                <motion.p
                  className="text-center text-gray-500 text-sm sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  No feedback yet.
                </motion.p>
              ) : (
                feedbacks.map((fb, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-4 py-3 px-4 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-300"
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current animate-gentle-pulse" />
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-gray-700 font-medium">
                        {fb.from}: Rating: {fb.rating} Star{fb.rating > 1 ? 's' : ''}, Feedback: "{fb.comment}"
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          {/* Community Highlights Card */}
          <motion.section
            className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-4 shadow-lg"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(134, 239, 172, 0.3)' }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-4">Community Highlights</h2>
            <motion.div
              variants={itemVariants}
              className="bg-gray-50/50 rounded-2xl p-3"
            >
              <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
                <div className="text-center">
                  <p className="text-sm sm:text-base text-gray-600">Total Posts</p>
                  <p className="text-lg sm:text-xl font-bold text-green-500">{communityStats.totalPosts}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm sm:text-base text-gray-600">Active Users Today</p>
                  <p className="text-lg sm:text-xl font-bold text-green-500">{communityStats.activeUsersToday}</p>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MainHome);