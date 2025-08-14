import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { UserPlus, MessageCircle, Eye, Sparkles } from 'lucide-react';
import Stars from '../assets/stars.svg';

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

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [follows, setFollows] = useState({});
  const [mutuals, setMutuals] = useState({});
  const [skill, setSkill] = useState('');
  const [type, setType] = useState('offered');
  const [level, setLevel] = useState('');
  const [badge, setBadge] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log('⚠️ No token in localStorage, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchUserId = async () => {
      try {
        const { data } = await API.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSenderId(data._id);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error fetching user ID:', err.response?.data?.message || err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    };

    fetchUserId();
  }, [navigate, token]);

  useEffect(() => {
    if (!senderId && !isLoading) {
      console.log('⚠️ Waiting for senderId to proceed');
      return;
    }

    const fetchMatches = async () => {
      try {
        const { data } = await API.get('/users/matches', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(data);

        const res = await API.get('/users/follow-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollows(res.data.follows);
        setMutuals(res.data.mutuals);
      } catch (err) {
        console.error('Error fetching matches or follow status:', err);
      }
    };
    fetchMatches();
  }, [token, senderId, isLoading]);

  const sendFollowRequest = async (targetId) => {
    try {
      await API.post('/users/follow', { targetId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Follow request sent!');
      setFollows((prev) => ({ ...prev, [targetId]: true }));
    } catch {
      alert('Failed to send follow request');
    }
  };
  const search = async () => {
    setError(null);
    if (!skill.trim()) return setError('Please enter a skill to search.');
    setLoading(true);
    setResults([]);

    try {
      const { data } = await API.get('/users/search', {
        params: {
          skill: skill.trim(),
          type,
          level: level || undefined,
          badge: badge || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !senderId) {
    return <p className="text-center mt-20 text-2xl animate-pulse text-yellow-400">Loading...</p>;
  }

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 p-6 font-sans"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Stars Background */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <img
          src={Stars}
          alt="Stars"
          className="w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
        />
      </div>

      {/* Matches Section */}
      <section className="mb-12">
        <motion.h1
          className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-center mb-6 flex items-center justify-center gap-2"
          variants={itemVariants}
        >
          <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
          Mutual Skill Matches
        </motion.h1>
        {matches.length === 0 ? (
          <motion.p
            className="text-gray-600 text-center bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
            variants={itemVariants}
          >
            No mutual matches found yet. Add more skills!
          </motion.p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {matches.map((user) => (
              <motion.div
                key={user._id}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-5 border border-blue-300/50 hover:shadow-xl transition"
                variants={itemVariants}
              >
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-indigo-700">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <div className="mt-3 mb-2">
                  <h3 className="font-semibold text-green-700 text-sm mb-1">🎓 Can Teach</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        {s.skill} ({s.level})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 mb-4">
                  <h3 className="font-semibold text-red-700 text-sm mb-1">📚 Wants to Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        {s.skill} ({s.level})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 gap-3">
                  {mutuals[user._id] ? (
                    <motion.button
                      onClick={() =>
                        navigate('/chat', {
                          state: { senderId, receiverId: user._id, receiverName: user.name },
                        })
                      }
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageCircle size={16} /> Chat
                    </motion.button>
                  ) : follows[user._id] ? (
                    <motion.button
                      disabled
                      className="bg-yellow-400 text-black px-4 py-2 text-sm rounded-md cursor-not-allowed"
                      variants={itemVariants}
                    >
                      Request Sent
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => sendFollowRequest(user._id)}
                      className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserPlus size={16} /> Follow
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => navigate(`/users/${user._id}/profile`)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Eye size={16} /> Profile
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Search Section */}
      <section>
        <motion.h2
          className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-6 flex items-center justify-center gap-2"
          variants={itemVariants}
        >
          <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
          Find Skill Partners
        </motion.h2>

        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-2xl border border-blue-300/50"
          variants={itemVariants}
        >
          <input
            type="text"
            placeholder="Skill..."
            className="p-2 border border-blue-300/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 border border-blue-300/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="offered">Offering</option>
            <option value="wanted">Looking For</option>
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="p-2 border border-blue-300/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>
          <select
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="p-2 border border-blue-300/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Badge</option>
            <option>Beginner</option>
            <option>Contributor</option>
            <option>Mentor</option>
            <option>Expert</option>
          </select>
        </motion.div>

        {error && (
          <motion.p
            className="text-red-500 mb-4 bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-blue-300/50"
            variants={itemVariants}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={search}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center w-full md:w-auto"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          variants={itemVariants}
        >
          🔍 Search
        </motion.button>

        {loading && (
          <motion.p
            className="text-center text-gray-600 bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-blue-300/50"
            variants={itemVariants}
          >
            Loading...
          </motion.p>
        )}

        <motion.ul
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
          variants={containerVariants}
        >
          {results.length > 0 ? (
            results.map((user) => (
              <motion.li
                key={user._id}
                className="bg-white/90 backdrop-blur-xl border border-blue-300/50 rounded-3xl p-5 shadow-2xl hover:shadow-xl transition"
                variants={itemVariants}
              >
                <div
                  onClick={() => navigate(`/users/${user._id}/profile`)}
                  className="text-xl font-semibold text-indigo-700 hover:underline cursor-pointer"
                >
                  {user.name}
                </div>
                <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                <div className="mb-3">
                  <p className="text-sm font-medium text-green-600 mb-1">✅ Skills Offered:</p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                    {user.skillsOffered?.length > 0 ? (
                      user.skillsOffered.map((s, i) => (
                        <span key={i} className="bg-green-100 px-2 py-1 rounded">{s.skill} ({s.level})</span>
                      ))
                    ) : (
                      <span>None</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-red-600 mb-1">🎯 Skills Wanted:</p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                    {user.skillsWanted?.length > 0 ? (
                      user.skillsWanted.map((s, i) => (
                        <span key={i} className="bg-red-100 px-2 py-1 rounded">{s.skill} ({s.level})</span>
                      ))
                    ) : (
                      <span>None</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {mutuals[user._id] ? (
                    <motion.button
                      onClick={() =>
                        navigate('/chat', {
                          state: { senderId, receiverId: user._id, receiverName: user.name },
                        })
                      }
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageCircle size={16} /> Chat
                    </motion.button>
                  ) : follows[user._id] ? (
                    <motion.button
                      disabled
                      className="bg-yellow-400 text-black px-4 py-2 text-sm rounded cursor-not-allowed"
                      variants={itemVariants}
                    >
                      Request Sent
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => sendFollowRequest(user._id)}
                      className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserPlus size={16} /> Follow
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => navigate(`/users/${user._id}/profile`)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Eye size={16} /> View Profile
                  </motion.button>
                </div>
              </motion.li>
            ))
          ) : (
            !loading && (
              <motion.li
                className="text-gray-600 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
                variants={itemVariants}
              >
                No users found.
              </motion.li>
            )
          )}
        </motion.ul>
      </section>
    </motion.div>
  );
};

export default Matches;