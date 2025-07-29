import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Star, Users, UserPlus, HeartHandshake, Sparkles, MessageCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import starsBg from '../assets/stars.svg';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [follows, setFollows] = useState({});
  const [mutuals, setMutuals] = useState({});
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await API.get(`/users/${id}/profile`);
      setProfile(data);
    };
    const fetchFollowStatus = async () => {
      const { data } = await API.get('/users/follow-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollows(data.follows);
      setMutuals(data.mutuals);
    };
    fetchProfile();
    fetchFollowStatus();
  }, [id]);

  const sendFollowRequest = async () => {
    await API.post(
      '/users/follow',
      { targetId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setFollows((prev) => ({ ...prev, [id]: true }));
    alert('✅ Follow request sent');
  };

  const unfollowUser = async () => {
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
  };

  if (!profile) return <p className="text-center mt-20 text-xl animate-pulse text-indigo-400">Loading...</p>;

  const { user, feedbacks, avgRating } = profile;

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 p-6 font-sans text-gray-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat', backgroundSize: '300px' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          className="flex flex-col md:flex-row gap-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Profile Card */}
          <motion.div
            className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-[300px] bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-blue-300/50"
            variants={itemVariants}
          >
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full overflow-hidden shadow-xl border-2 border-indigo-300">
                <img
                  src={user.profileImage || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(user.name)}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-indigo-600 border border-indigo-300 px-2 py-1 text-xs rounded-full font-semibold">
                {user.badge || 'Explorer'}
              </div>
            </div>
            <motion.h1
              className="text-3xl font-extrabold text-indigo-700 mb-2"
              variants={itemVariants}
            >
              {user.name}
            </motion.h1>
            <motion.p
              className="text-gray-600 text-sm mb-4"
              variants={itemVariants}
            >
              {user.email}
            </motion.p>

            <div className="space-y-2">
              <motion.p
                className="flex items-center gap-2 text-sm text-indigo-700"
                variants={itemVariants}
              >
                <Users className="w-4 h-4" /> {user.followers?.length || 0} Followers
              </motion.p>
              <motion.p
                className="flex items-center gap-2 text-sm text-indigo-700"
                variants={itemVariants}
              >
                <UserPlus className="w-4 h-4" /> {user.following?.length || 0} Following
              </motion.p>
              <motion.p
                className="flex items-center gap-2 text-sm text-yellow-600"
                variants={itemVariants}
              >
                <Star className="w-4 h-4" /> {avgRating || 'No Rating'}
              </motion.p>
            </div>

            {user._id !== loggedInUserId && (
              <motion.div
                className="mt-5 space-y-2 w-full"
                variants={itemVariants}
              >
                {mutuals[user._id] ? (
                  <motion.button
                    onClick={() => navigate('/chat', { state: { receiverId: user._id, receiverName: user.name } })}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageCircle className="w-4 h-4" /> Chat
                  </motion.button>
                ) : follows[user._id] ? (
                  <motion.button
                    onClick={unfollowUser}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <XCircle className="w-4 h-4" /> Unfollow
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={sendFollowRequest}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UserPlus className="w-4 h-4" /> Follow
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Vertical Divider */}
          <motion.div
            className="hidden md:block w-[1px] bg-gradient-to-b from-transparent via-gray-400 to-transparent"
            variants={itemVariants}
          ></motion.div>

          {/* Content Area */}
          <motion.div
            className="flex-1 space-y-8"
            variants={itemVariants}
          >
            {user.aboutMe && (
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-blue-300/50"
                variants={itemVariants}
              >
                <h2 className="text-2xl font-bold text-indigo-700 mb-2">🧠 About Me</h2>
                <p className="text-gray-700 text-base leading-relaxed">{user.aboutMe}</p>
              </motion.div>
            )}

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={itemVariants}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-blue-300/50"
                variants={itemVariants}
              >
                <h2 className="text-xl font-semibold text-teal-700 mb-3 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-teal-700" /> Skills Offered
                </h2>
                <ul className="ml-4 list-disc text-gray-800 space-y-1">
                  {user.skillsOffered.length === 0 ? (
                    <p className="text-gray-400">No skills listed</p>
                  ) : (
                    user.skillsOffered.map((s, i) => <li key={i}>{s.skill} ({s.level})</li>)
                  )}
                </ul>
              </motion.div>
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-blue-300/50"
                variants={itemVariants}
              >
                <h2 className="text-xl font-semibold text-teal-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-700" /> Skills Wanted
                </h2>
                <ul className="ml-4 list-disc text-gray-800 space-y-1">
                  {user.skillsWanted.length === 0 ? (
                    <p className="text-gray-400">No skills listed</p>
                  ) : (
                    user.skillsWanted.map((s, i) => <li key={i}>{s.skill} ({s.level})</li>)
                  )}
                </ul>
              </motion.div>
            </motion.div>

            {user.education?.length > 0 && (
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-blue-300/50"
                variants={itemVariants}
              >
                <h2 className="text-xl font-bold text-indigo-700 mb-3">🎓 Education</h2>
                <ul className="space-y-2">
                  {user.education.map((edu, i) => (
                    <li key={i} className="text-gray-800">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institute} ({edu.year})</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-blue-300/50"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-indigo-700 mb-4">💬 Feedback</h2>
              {feedbacks.length === 0 ? (
                <p className="text-gray-500">No feedback yet.</p>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((f, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4 bg-white/70 p-4 rounded-lg shadow-md border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(f.from)}`}
                        alt={f.from}
                        className="w-10 h-10 rounded-full border"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{f.from}</p>
                        <p className="text-yellow-600 flex items-center gap-1 text-sm">
                          Rating: {f.rating} <Star className="w-4 h-4 text-yellow-500" />
                        </p>
                        <p className="text-gray-700">{f.comment}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;