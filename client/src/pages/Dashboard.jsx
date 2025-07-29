import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Stars from '../assets/stars.svg';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

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

  const months = [];
  let currentMonth = startDate.clone();

  while (currentMonth.isSameOrBefore(today, 'month')) {
    const daysInMonth = currentMonth.daysInMonth();
    const firstDayOfWeek = currentMonth.clone().startOf('month').day(); // Sunday=0

    const days = [];

    // Add leading empty slots for alignment (before 1st of the month)
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(currentMonth.clone().date(d));
    }

    months.push({
      name: currentMonth.format('MMMM'),
      days,
    });

    currentMonth.add(1, 'month');
  }

  return (
    <div className="overflow-auto max-w-full px-2 py-4">
      <div className="flex gap-6 flex-wrap">
        {months.map((month, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="text-xs font-semibold mb-1 text-gray-600">
              {month.name}
            </div>
            <div className="grid grid-cols-7 gap-[2px]">
              {month.days.map((day, i) => {
                const dateStr = day ? day.format('YYYY-MM-DD') : '';
                const isStreak = streakDates.has(dateStr);
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${
                      !day
                        ? 'bg-transparent'
                        : isStreak
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [skillsOffered, setSkillsOffered] = useState([{ skill: '', level: 'Beginner' }]);
  const [skillsWanted, setSkillsWanted] = useState([{ skill: '', level: 'Beginner' }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [aboutMe, setAboutMe] = useState('');
  const [education, setEducation] = useState([{ degree: '', institute: '', year: '' }]);
  const [streakData, setStreakData] = useState({ totalDays: 0, maxStreak: 0, currentStreak: 0, visitHistory: [] });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfileAndStreak = async () => {
      try {
        const { data: profileData } = await API.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profileData);
        if (profileData.skillsOffered?.length) setSkillsOffered(profileData.skillsOffered);
        if (profileData.skillsWanted?.length) setSkillsWanted(profileData.skillsWanted);
        setAboutMe(profileData.aboutMe || '');
        if (profileData.education?.length) setEducation(profileData.education);

        const { data: streakData } = await API.post('/users/update-streak', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(prev => ({ ...prev, streak: streakData.streak, points: streakData.points }));

        const visitHistory = [];
        const today = moment().startOf('day');
        for (let i = 0; i < streakData.streak; i++) {
          visitHistory.push(today.clone().subtract(i, 'days').format('YYYY-MM-DD'));
        }
        setStreakData({
          totalDays: streakData.streak,
          maxStreak: Math.max(streakData.streak, streakData.streak || 0),
          currentStreak: streakData.streak,
          visitHistory,
        });
      } catch (err) {
        toast.error('Failed to fetch profile or update streak');
        console.error(err);
      }
    };
    fetchProfileAndStreak();
  }, [token]);

  const handleChange = (type, index, field, value) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated[index][field] = value;
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  };

  const addSkillRow = (type) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated.push({ skill: '', level: 'Beginner' });
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  };

  const deleteSkillRow = (type, index) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated.splice(index, 1);
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = [...skillsOffered, ...skillsWanted].every(item => item.skill.trim() !== '');
    if (!isValid) {
      toast.error('Please fill all skill names before saving');
      return;
    }

    try {
      await API.put(
        '/users/skills',
        { skillsOffered, skillsWanted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ Skills updated successfully!');
    } catch (err) {
      toast.error('❌ Failed to update skills');
      console.error(err);
    }
  };

  const handleProfileInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(
        '/users/profile-info',
        { aboutMe, education },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('🎉 Profile info updated!');
    } catch (err) {
      toast.error('❌ Failed to update profile info');
      console.error(err);
    }
  };

  const handleImageUpload = async (file) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await API.put(
          '/users/profile-image',
          { image: reader.result },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(data);
        toast.success('Profile image updated!');
      } catch {
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const addEducationRow = () => {
    setEducation([...education, { degree: '', institute: '', year: '' }]);
  };

  const deleteEducationRow = (index) => {
    const updated = [...education];
    updated.splice(index, 1);
    setEducation(updated);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-6 py-12 font-sans overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative max-w-6xl mx-auto z-10 space-y-12"
      >
        <h1 className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 font-display drop-shadow-lg">
          🌟 My Dashboard
        </h1>

        {/* Profile Section with Streak Calendar */}
        {user && (
          <motion.section
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-800"
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="relative group">
                <motion.img
                  src={user?.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.name}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-blue-400 group-hover:scale-105 transition-transform duration-300"
                  whileHover={{ rotate: 10 }}
                />
                <div className="mt-4 flex gap-4 justify-center">
                  <label className="cursor-pointer text-sm text-blue-500 hover:text-blue-700 transition">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                    />
                  </label>
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="text-sm text-blue-500 hover:text-blue-700 transition"
                  >
                    Choose Avatar
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white mb-4">
                  <p className="text-xl font-semibold">{user.name}'s Profile</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Points:</strong> <span className="text-green-500">{user.points}</span></p>
                  <p><strong>Badge:</strong> <span className="text-blue-300">{user.badge}</span></p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 text-sm">Visits in the past year: {streakData.totalDays}</span>
                    <span className="text-gray-300 text-sm">
                      Total active days: {streakData.totalDays} | Max streak: {streakData.maxStreak} | Current: {streakData.currentStreak}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="overflow-auto p-2">
                      <Heatmap streak={streakData.totalDays} />
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                      {moment().subtract(1, 'year').format('MMM DD, YYYY')} - {moment().format('MMM DD, YYYY')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Network Section */}
        {user && (
          <motion.section
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-300/50"
          >
            <h2 className="text-3xl font-bold text-blue-600 mb-6"> My Network</h2>
            <div className="flex justify-around text-lg font-medium">
              <motion.div
                className="text-center cursor-pointer hover:text-blue-500 transition"
                onClick={() => { setModalType('followers'); setIsModalOpen(true); }}
                whileHover={{ scale: 1.1 }}
              >
                <p className="text-4xl font-bold text-blue-500">{user.followers?.length || 0}</p>
                <p>Followers</p>
              </motion.div>
              <motion.div
                className="text-center cursor-pointer hover:text-blue-500 transition"
                onClick={() => { setModalType('following'); setIsModalOpen(true); }}
                whileHover={{ scale: 1.1 }}
              >
                <p className="text-4xl font-bold text-blue-500">{user.following?.length || 0}</p>
                <p>Following</p>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Profile Info Form */}
        <motion.form
          onSubmit={handleProfileInfoSubmit}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-300/50 space-y-8"
        >
          <h2 className="text-3xl font-bold text-blue-600"> About Me & Education</h2>
          <div>
            <label className="block text-blue-600 font-medium mb-2">About Me</label>
            <textarea
              rows={4}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Write a short bio about your skills, goals or interests..."
              className="w-full bg-gray-100/50 border border-blue-300/50 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-blue-600 font-medium mb-2">Education</label>
            <AnimatePresence>
              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center"
                >
                  <input
                    type="text"
                    placeholder="Degree"
                    className="bg-gray-100/50 border border-blue-300/50 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Institute"
                    className="bg-gray-100/50 border border-blue-300/50 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    value={edu.institute}
                    onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Year"
                      className="bg-gray-100/50 border border-blue-300/50 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    />
                    <motion.button
                      type="button"
                      onClick={() => deleteEducationRow(index)}
                      className="text-red-500 text-xl font-bold hover:text-red-600"
                      whileHover={{ scale: 1.2 }}
                    >
                      ×
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={addEducationRow}
              className="text-sm text-blue-500 hover:text-blue-700"
              whileHover={{ scale: 1.05 }}
            >
              + Add More
            </motion.button>
          </div>
          <div className="text-right">
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-8 rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Profile Info
            </motion.button>
          </div>
        </motion.form>

        {/* Skills Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-300/50 space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4"> Skills You Can Teach</h2>
            <AnimatePresence>
              {skillsOffered.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4 mb-4 items-center"
                >
                  <input
                    type="text"
                    placeholder="Skill"
                    className="w-2/3 bg-gray-100/50 border border-blue-300/50 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    value={item.skill}
                    onChange={(e) => handleChange('offered', index, 'skill', e.target.value)}
                    required
                  />
                  <select
                    className="w-1/3 bg-gray-100/50 border border-blue-300/50 px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    value={item.level}
                    onChange={(e) => handleChange('offered', index, 'level', e.target.value)}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                  <motion.button
                    type="button"
                    onClick={() => deleteSkillRow('offered', index)}
                    className="text-red-500 text-xl font-bold hover:text-red-600"
                    whileHover={{ scale: 1.2 }}
                  >
                    ×
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.button
              type="button"
              className="text-sm text-blue-500 hover:text-blue-700"
              onClick={() => addSkillRow('offered')}
              whileHover={{ scale: 1.05 }}
            >
              + Add Another Skill
            </motion.button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Skills You Want to Learn</h2>
            <AnimatePresence>
              {skillsWanted.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4 mb-4 items-center"
                >
                  <input
                    type="text"
                    placeholder="Skill"
                    className="w-2/3 bg-gray-100/50 border border-blue-300/50 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    value={item.skill}
                    onChange={(e) => handleChange('wanted', index, 'skill', e.target.value)}
                    required
                  />
                  <select
                    className="w-1/3 bg-gray-100/50 border border-blue-300/50 px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    value={item.level}
                    onChange={(e) => handleChange('wanted', index, 'level', e.target.value)}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                  <motion.button
                    type="button"
                    onClick={() => deleteSkillRow('wanted', index)}
                    className="text-red-500 text-xl font-bold hover:text-red-600"
                    whileHover={{ scale: 1.2 }}
                  >
                    ×
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.button
              type="button"
              className="text-sm text-blue-500 hover:text-blue-700"
              onClick={() => addSkillRow('wanted')}
              whileHover={{ scale: 1.05 }}
            >
              + Add Another Skill
            </motion.button>
          </div>

          <div className="text-right">
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-8 rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Skills
            </motion.button>
          </div>
        </motion.form>

        {/* Avatar Picker Modal */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-2xl"
              >
                <h3 className="text-xl font-semibold text-blue-600 text-center mb-6">Choose an Avatar</h3>
                <div className="grid grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=Avatar${idx}`;
                    return (
                      <motion.img
                        key={idx}
                        src={avatarUrl}
                        alt="avatar"
                        onClick={async () => {
                          try {
                            const { data } = await API.put(
                              '/users/profile-image',
                              { image: avatarUrl },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setUser(data);
                            toast.success('Avatar selected!');
                            setShowAvatarPicker(false);
                          } catch {
                            toast.error('Failed to select avatar');
                          }
                        }}
                        className="w-16 h-16 rounded-full cursor-pointer border-2 border-blue-300/50 hover:border-blue-400 transition"
                        whileHover={{ scale: 1.1 }}
                      />
                    );
                  })}
                </div>
                <motion.button
                  className="mt-6 block mx-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                  onClick={() => setShowAvatarPicker(false)}
                  whileHover={{ scale: 1.05 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Followers/Following Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl relative"
              >
                <h2 className="text-xl font-semibold text-blue-600 mb-6">
                  {modalType === 'followers' ? '👥 Your Followers' : '➡️ You’re Following'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl font-bold"
                >
                  ×
                </button>
                <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {(modalType === 'followers' ? user.followers : user.following)?.map((u, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-gray-200 pb-3 flex justify-between items-center"
                    >
                      <div>
                        <Link
                          to={`/users/${u._id}/profile`}
                          className="font-medium text-blue-500 hover:text-blue-700 transition"
                          onClick={() => setIsModalOpen(false)}
                        >
                          {u.name}
                        </Link>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                      {modalType === 'following' && (
                        <motion.button
                          onClick={async () => {
                            try {
                              await API.delete(`/users/unfollow/${u._id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              const updatedFollowing = user.following.filter(f => f._id !== u._id);
                              setUser(prev => ({ ...prev, following: updatedFollowing }));
                              toast.success(`Unfollowed ${u.name}`);
                            } catch {
                              toast.error('Failed to unfollow');
                            }
                          }}
                          className="text-sm text-red-500 hover:text-red-600 font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          Unfollow
                        </motion.button>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Dashboard;