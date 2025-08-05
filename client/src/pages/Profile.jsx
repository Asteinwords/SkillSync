import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Star, Users, UserPlus, HeartHandshake, Sparkles, Calendar, MessageCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import starsBg from '../assets/stars.svg';
import moment from 'moment';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      type: 'spring',
      damping: 10,
      stiffness: 100,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 120,
    },
  },
};

const getStreakDates = (streak) => {
  const dates = new Set();
  for (let i = 0; i < streak; i++) {
    dates.add(moment().subtract(i, 'days').format('YYYY-MM-DD'));
  }
  return dates;
};

const Heatmap = ({ streak }) => {
  const today = moment();
  const startDate = today.clone().subtract(11, 'months').startOf('month');
  const streakDates = getStreakDates(streak);

  const months = useMemo(() => {
    const monthsArray = [];
    let currentMonth = startDate.clone();

    while (currentMonth.isSameOrBefore(today, 'month')) {
      const daysInMonth = currentMonth.daysInMonth();
      const firstDayOfWeek = currentMonth.clone().startOf('month').day();

      const days = [];
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        days.push(currentMonth.clone().date(d));
      }

      monthsArray.push({
        name: currentMonth.format('MMM'),
        days,
      });

      currentMonth.add(1, 'month');
    }
    return monthsArray;
  }, [streak, today]);

  return (
    <div className="overflow-x-auto max-w-full px-2 sm:px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-sm scrollbar-none sm:scrollbar-none">
      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          .scrollbar-none {
            -ms-overflow-style: auto;
            scrollbar-width: auto;
          }
          .scrollbar-none::-webkit-scrollbar {
            display: block;
          }
        }
      `}</style>
      <div className="flex gap-2 sm:gap-4">
        {months.map((month, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="text-xs font-semibold mb-2 text-gray-600">{month.name}</div>
            <div className="grid grid-cols-7 gap-[2px] sm:gap-[3px]">
              {month.days.map((day, i) => {
                const dateStr = day ? day.format('YYYY-MM-DD') : '';
                const isStreak = streakDates.has(dateStr);
                return (
                  <motion.div
                    key={i}
                    className={`w-2 sm:w-3 h-2 sm:h-3 rounded-sm border relative group ${!day ? 'bg-transparent border-transparent' : isStreak ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500' : 'bg-gray-200 border-gray-300'}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {day && (
                      <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-8 -ml-4 z-10">
                        {dateStr}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [follows, setFollows] = useState({});
  const [mutuals, setMutuals] = useState({});
  const [streakData, setStreakData] = useState({ totalDays: 0, maxStreak: 0, currentStreak: 0, visitHistory: [] });
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const { data: profileData } = await API.get(`/users/${id}/profile`);
      console.log('API Response for user', id, ':', profileData);
      setProfile(profileData);

      const streak = profileData.streak || 0;
      const points = profileData.points || 0;
      const visits = profileData.visits || 0;
      console.log('Streak for user', id, ':', streak, 'Points:', points, 'Visits:', visits);

      const visitHistory = [];
      const today = moment().startOf('day');
      for (let i = 0; i < streak; i++) {
        visitHistory.push(today.clone().subtract(i, 'days').format('YYYY-MM-DD'));
      }
      setStreakData({
        totalDays: streak,
        maxStreak: Math.max(streak, streak || 0),
        currentStreak: streak,
        visitHistory,
      });
    } catch (err) {
      console.error('Error fetching profile for user', id, ':', err);
      alert('Failed to load profile');
    }
  };

  const updateVisit = async () => {
    if (token && loggedInUserId && loggedInUserId !== id) {
      try {
        await API.post(`/users/update-visit/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Visit updated for user', id);
      } catch (err) {
        console.error('Error updating visit for user', id, ':', err);
      }
    }
  };

  const fetchFollowStatus = async () => {
    if (token) {
      try {
        const { data } = await API.get('/users/follow-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Follow Status Response:', data);
        setFollows(data.follows);
        setMutuals(data.mutuals);
      } catch (err) {
        console.error('Error fetching follow status:', err);
        alert('Failed to fetch follow status');
      }
    }
  };

  fetchProfile();
  updateVisit();
  fetchFollowStatus();
}, [id, token, loggedInUserId]);

  const sendFollowRequest = async () => {
    if (!token) {
      alert('Please log in to follow users');
      return;
    }
    try {
      console.log('Sending follow request to:', id);
      await API.post(
        '/users/follow',
        { targetId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollows((prev) => ({ ...prev, [id]: true }));
      alert('✅ Follow request sent');
    } catch (err) {
      console.error('Error sending follow request:', err);
      alert('Failed to send follow request');
    }
  };

  const unfollowUser = async () => {
    if (!token) {
      alert('Please log in to unfollow users');
      return;
    }
    try {
      console.log('Unfollowing user:', id);
      await API.delete(`/users/unfollow/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedFollows = { ...follows };
      delete updatedFollows[id];
      setFollows(updatedFollows);
      const updatedMutuals = { ...mutuals };
      delete updatedMutuals[id];
      setMutuals(updatedMutuals);
      alert('👋 Unfollowed user');
    } catch (err) {
      console.error('Error unfollowing user:', err);
      alert('Failed to unfollow user');
    }
  };

  if (!profile) return <p className="text-center mt-20 text-2xl animate-pulse text-yellow-400">Loading...</p>;

  const { user, avgRating } = profile;
  console.log('Rendered Profile Data for user', id, ':', { user, avgRating, streakData });

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200 p-6 font-sans text-gray-800 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat', backgroundSize: '250px', backgroundPosition: 'center' }}
    >
      <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-300/20 via-purple-200/20 to-pink-300/20 opacity-50 animate-pulse-slow" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-pink-600 text-center mb-8 sm:mb-12 flex items-center justify-center gap-3"
          variants={itemVariants}
        >
          <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          {user.name}'s Profile
          <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
          variants={containerVariants}
        >
          {/* Profile Card */}
          <motion.div
            className="bg-white/95 backdrop-blur-2xl rounded-2xl p-6 shadow-lg border-[1px] border-indigo-300/50 hover:border-indigo-400 transition-all duration-300"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="w-48 h-48 rounded-full overflow-hidden shadow-xl border-4 border-indigo-300/50 glow">
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-indigo-600 border border-indigo-300 px-3 py-1.5 text-sm rounded-full font-extrabold shadow-md"
                  variants={itemVariants}
                  animate={{ rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 4 } }}
                >
                  {user.badge || 'Explorer'}
                </motion.div>
              </div>
              <motion.p className="text-gray-600 text-base mb-2" variants={itemVariants}>
                {user.email}
              </motion.p>
              <motion.p className="text-xs sm:text-sm text-gray-600 mb-4" variants={itemVariants}>
                <strong>Points:</strong> <span className="text-blue-600 font-semibold">{profile.points || 0}</span>
              </motion.p>
              <motion.p className="text-xs sm:text-sm text-gray-600 mb-4" variants={itemVariants}>
                <strong>Visits:</strong> <span className="text-blue-600 font-semibold">{profile.visits || 0}</span>
              </motion.p>
              <motion.div className="mb-6" variants={itemVariants}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">About Me</label>
                <p className="w-full bg-gray-100/50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-800 text-sm sm:text-base">
                  {user.aboutMe || 'No bio available'}
                </p>
              </motion.div>
              <div className="space-y-4">
                <motion.p className="flex items-center gap-3 text-lg text-indigo-700" variants={itemVariants}>
                  <Users className="w-6 h-6" /> {user.followers?.length || 0} Followers
                </motion.p>
                <motion.p className="flex items-center gap-3 text-lg text-indigo-700" variants={itemVariants}>
                  <UserPlus className="w-6 h-6" /> {user.following?.length || 0} Following
                </motion.p>
              </div>

              {loggedInUserId && user._id !== loggedInUserId && (
                <motion.div className="mt-6 space-y-3 w-full" variants={itemVariants}>
                  {mutuals[user._id] ? (
                    <motion.button
                      onClick={() => navigate('/chat', { state: { receiverId: user._id, receiverName: user.name } })}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageCircle className="w-5 h-5" /> Chat
                    </motion.button>
                  ) : follows[user._id] ? (
                    <motion.button
                      onClick={unfollowUser}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <XCircle className="w-5 h-5" /> Unfollow
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={sendFollowRequest}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserPlus className="w-5 h-5" /> Follow
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Activity Streak */}
          <motion.div
            className="bg-white/95 backdrop-blur-2xl rounded-2xl p-6 shadow-lg border-[1px] border-indigo-300/50 hover:border-indigo-400 transition-all duration-300"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-extrabold text-blue-700 mb-6 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-700" /> Activity Streak
            </h2>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-base text-gray-600 font-medium">
              <span>Visits: {streakData.totalDays}</span>
              <span>Max: {streakData.maxStreak} | Current: {streakData.currentStreak}</span>
            </div>
            {streakData.totalDays > 0 ? (
              <Heatmap streak={streakData.totalDays} />
            ) : (
              <p className="text-gray-500 text-center">No streak data available</p>
            )}
            <div className="text-sm text-gray-500 mt-4">
              {moment().subtract(1, 'year').format('MMM DD, YYYY')} - {moment().format('MMM DD, YYYY')}
            </div>
          </motion.div>
        </motion.div>

        {/* Skills Card */}
        <motion.div
          className="mt-6 sm:mt-8 bg-white/95 backdrop-blur-2xl rounded-2xl p-6 shadow-lg border-[1px] border-indigo-300/50 hover:border-indigo-400 transition-all duration-300"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-extrabold text-teal-600 mb-6 flex items-center gap-3">
            <HeartHandshake className="w-7 h-7 text-teal-600" /> Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Skills Offered */}
            <div>
              <h3 className="text-xl font-semibold text-teal-700 mb-4">Offered</h3>
              <ul className="ml-6 list-disc space-y-3 text-lg text-gray-800">
                {user.skillsOffered.length === 0 ? (
                  <p className="text-gray-500">No skills listed</p>
                ) : (
                  user.skillsOffered.map((s, i) => <li key={i} className="font-medium">{s.skill} ({s.level})</li>)
                )}
              </ul>
            </div>
            {/* Skills Wanted */}
            <div>
              <h3 className="text-xl font-semibold text-teal-700 mb-4">Wanted</h3>
              <ul className="ml-6 list-disc space-y-3 text-lg text-gray-800">
                {user.skillsWanted.length === 0 ? (
                  <p className="text-gray-500">No skills listed</p>
                ) : (
                  user.skillsWanted.map((s, i) => <li key={i} className="font-medium">{s.skill} ({s.level})</li>)
                )}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Education */}
        {user.education?.length > 0 && (
          <motion.div
            className="mt-6 sm:mt-8 bg-white/95 backdrop-blur-2xl rounded-2xl p-6 shadow-lg border-[1px] border-indigo-300/50 hover:border-indigo-400 transition-all duration-300"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 flex items-center gap-3">🎓 Education</h2>
            <ul className="space-y-4">
              {user.education.map((edu, i) => (
                <motion.li key={i} className="text-gray-800" variants={itemVariants}>
                  <p className="font-extrabold text-xl">{edu.degree}</p>
                  <p className="text-lg text-gray-600">{edu.institute} ({edu.year})</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Ratings Badge and Points */}
        <motion.div
          className="fixed bottom-6 right-6 bg-white/95 backdrop-blur-2xl rounded-full p-4 shadow-lg border-[1px] border-indigo-300/50 flex items-center gap-3"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold text-indigo-700">{avgRating || 'No Rating'}</span>
          </div>
          <span className="text-lg font-semibold text-teal-600">Points: {profile.points || 0}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;