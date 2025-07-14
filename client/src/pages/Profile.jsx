import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Star, Users, UserPlus, HeartHandshake, Sparkles, MessageCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
  }),
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

  if (!profile) return <p className="text-center mt-20 text-xl animate-pulse text-blue-400">Loading...</p>;

  const { user, feedbacks, avgRating } = profile;

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#f3f4f6] via-[#e0f7fa] to-[#ede7f6] text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          className="flex flex-col md:flex-row gap-10"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0.1}
        >
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-[300px]">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-[#4dd0e1]">
                <img
                  src={user.profileImage || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(user.name)}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-[#4dd0e1] border border-[#4dd0e1] px-3 py-1 text-xs rounded-full font-bold shadow">
                {user.badge || 'Explorer'}
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-[#3949ab] mb-2">{user.name}</h1>
            <p className="text-[#616161] text-sm mb-4">{user.email}</p>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm"><Users className="w-4 h-4" /> {user.followers?.length || 0} Followers</p>
              <p className="flex items-center gap-2 text-sm"><UserPlus className="w-4 h-4" /> {user.following?.length || 0} Following</p>
              <p className="flex items-center gap-2 text-sm text-yellow-600"><Star className="w-4 h-4" /> {avgRating || 'No Rating'}</p>
            </div>

            {user._id !== loggedInUserId && (
              <div className="mt-5 space-y-2 w-full">
                {mutuals[user._id] ? (
                  <button
                    onClick={() => navigate('/chat', { state: { receiverId: user._id, receiverName: user.name } })}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat
                  </button>
                ) : follows[user._id] ? (
                  <button
                    onClick={unfollowUser}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Unfollow
                  </button>
                ) : (
                  <button
                    onClick={sendFollowRequest}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Follow
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block w-[1px] bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>

          <div className="flex-1 space-y-12">
            {user.aboutMe && (
              <motion.div variants={fadeInUp} custom={0.2}>
                <h2 className="text-2xl font-bold text-[#7b1fa2] mb-2">🧠 About Me</h2>
                <p className="text-gray-700 text-base leading-relaxed">{user.aboutMe}</p>
              </motion.div>
            )}

            <motion.div variants={fadeInUp} custom={0.3} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-xl font-semibold text-[#00796b] mb-3 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-[#00796b]" /> Skills Offered
                </h2>
                <ul className="ml-4 list-disc text-gray-800 space-y-1">
                  {user.skillsOffered.length === 0 ? (
                    <p className="text-gray-400">No skills listed</p>
                  ) : (
                    user.skillsOffered.map((s, i) => <li key={i}>{s.skill} ({s.level})</li>)
                  )}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#c2185b] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c2185b]" /> Skills Wanted
                </h2>
                <ul className="ml-4 list-disc text-gray-800 space-y-1">
                  {user.skillsWanted.length === 0 ? (
                    <p className="text-gray-400">No skills listed</p>
                  ) : (
                    user.skillsWanted.map((s, i) => <li key={i}>{s.skill} ({s.level})</li>)
                  )}
                </ul>
              </div>
            </motion.div>

            {user.education?.length > 0 && (
              <motion.div variants={fadeInUp} custom={0.4}>
                <h2 className="text-xl font-bold text-[#0288d1] mb-3">🎓 Education</h2>
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

            <motion.div variants={fadeInUp} custom={0.5}>
              <h2 className="text-xl font-bold text-[#1e88e5] mb-4">💬 Feedback</h2>
              {feedbacks.length === 0 ? (
                <p className="text-gray-500">No feedback yet.</p>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((f, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4 bg-white/70 backdrop-blur-md p-4 rounded-lg shadow-md border border-gray-200"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;