import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Stars from '../assets/stars.svg';
import moment from 'moment';

const badgeStyles = {
  Beginner: 'bg-blue-100 text-blue-700',
  Contributor: 'bg-purple-100 text-purple-700',
  Mentor: 'bg-pink-100 text-pink-700',
  Expert: 'bg-yellow-100 text-yellow-800',
};

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
    const firstDayOfWeek = currentMonth.clone().startOf('month').day();

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(currentMonth.clone().date(d));
    }

    months.push({
      name: currentMonth.format('MMM'),
      days,
    });

    currentMonth.add(1, 'month');
  }

  return (
    <div className="overflow-hidden max-w-full px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-sm">
      <div className="flex gap-4">
        {months.map((month, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="text-xs font-semibold mb-2 text-gray-600">{month.name}</div>
            <div className="grid grid-cols-7 gap-[3px]">
              {month.days.map((day, i) => {
                const dateStr = day ? day.format('YYYY-MM-DD') : '';
                const isStreak = streakDates.has(dateStr);
                return (
                  <motion.div
                    key={i}
                    className={`w-3 h-3 rounded-sm border relative group ${!day ? 'bg-transparent border-transparent' : isStreak ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500' : 'bg-gray-200 border-gray-300'}`}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-6 py-16 font-sans overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto z-10"
      >
        <motion.h1
          className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center gap-3 mb-12"
          variants={itemVariants}
        >
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          Dashboard
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
        </motion.h1>

        {/* Top Row: Profile Card (Left) and Calendar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Section - Slightly Left */}
          {user && (
            <motion.section
              variants={itemVariants}
              className="lg:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <motion.img
                    src={user?.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.name}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-300/50 shadow-md group-hover:shadow-lg transition-all duration-300 ml-12"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="mt-3 flex gap-3 justify-center">
                    <label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 transition">
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
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                    >
                      Choose Avatar
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-blue-700">{user.name}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {user.email}</p>
                  <p className="text-sm text-gray-600"><strong>Points:</strong> <span className="text-blue-600">{user.points}</span></p>
                  <p className="text-sm text-gray-600">
                    <strong>Badge:</strong>{' '}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[user.badge] || 'bg-gray-100 text-gray-600'}`}>
                      {user.badge}
                    </span>
                  </p>
                </div>
                <div className="text-center w-full">
                  <h3 className="text-sm font-medium text-blue-700 mb-3">Network</h3>
                  <div className="flex justify-center gap-8 text-sm">
                    <motion.div
                      className="text-center cursor-pointer hover:text-blue-500 transition"
                      onClick={() => { setModalType('followers'); setIsModalOpen(true); }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-2xl font-bold text-blue-600">{user.followers?.length || 0}</p>
                      <p>Followers</p>
                    </motion.div>
                    <motion.div
                      className="text-center cursor-pointer hover:text-blue-500 transition"
                      onClick={() => { setModalType('following'); setIsModalOpen(true); }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-2xl font-bold text-blue-600">{user.following?.length || 0}</p>
                      <p>Following</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Streak Calendar Section - Remaining Space */}
          {user && (
            <motion.section
              variants={itemVariants}
              className="lg:col-span-9 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Activity Streak</h2>
              <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                <span>Visits in the past year: {streakData.totalDays}</span>
                <span>Total: {streakData.totalDays} | Max: {streakData.maxStreak} | Current: {streakData.currentStreak}</span>
              </div>
              <Heatmap streak={streakData.totalDays} />
              <div className="text-xs text-gray-500 mt-3">
                {moment().subtract(1, 'year').format('MMM DD, YYYY')} - {moment().format('MMM DD, YYYY')}
              </div>
            </motion.section>
          )}
        </div>

        {/* Bottom Row: About Me (Left) and Skills (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* About Me Section */}
          <motion.form
            onSubmit={handleProfileInfoSubmit}
            variants={itemVariants}
            className="lg:col-span-6 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50 space-y-6"
          >
            <h2 className="text-xl font-semibold text-blue-700">About Me</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Write a short bio..."
                className="w-full bg-gray-100/50 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
              <AnimatePresence>
                {education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Degree"
                      className="bg-gray-100/50 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Institute"
                      className="bg-gray-100/50 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
                      value={edu.institute}
                      onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Year"
                        className="bg-gray-100/50 border border-gray-200 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                      />
                      <motion.button
                        type="button"
                        onClick={() => deleteEducationRow(index)}
                        className="text-red-500 text-lg hover:text-red-400 transition"
                        whileHover={{ scale: 1.1 }}
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
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                whileHover={{ scale: 1.05 }}
              >
                + Add More
              </motion.button>
            </div>
            <div className="text-right">
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Profile
              </motion.button>
            </div>
          </motion.form>

          {/* Skills Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={itemVariants}
            className="lg:col-span-6 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50 space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Skills You Can Teach</h2>
              <AnimatePresence>
                {skillsOffered.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4 mb-4 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Skill"
                      className="w-2/3 bg-gray-100/50 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
                      value={item.skill}
                      onChange={(e) => handleChange('offered', index, 'skill', e.target.value)}
                      required
                    />
                    <select
                      className="w-1/3 bg-gray-100/50 border border-gray-200 px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
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
                      className="text-red-500 text-lg hover:text-red-400 transition"
                      whileHover={{ scale: 1.1 }}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                onClick={() => addSkillRow('offered')}
                whileHover={{ scale: 1.05 }}
              >
                + Add Skill
              </motion.button>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Skills You Want to Learn</h2>
              <AnimatePresence>
                {skillsWanted.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4 mb-4 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Skill"
                      className="w-2/3 bg-gray-100/50 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
                      value={item.skill}
                      onChange={(e) => handleChange('wanted', index, 'skill', e.target.value)}
                      required
                    />
                    <select
                      className="w-1/3 bg-gray-100/50 border border-gray-200 px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200"
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
                      className="text-red-500 text-lg hover:text-red-400 transition"
                      whileHover={{ scale: 1.1 }}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                onClick={() => addSkillRow('wanted')}
                whileHover={{ scale: 1.05 }}
              >
                + Add Skill
              </motion.button>
            </div>

            <div className="text-right">
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Skills
              </motion.button>
            </div>
          </motion.form>
        </div>

        {/* Avatar Picker Modal */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl max-w-md w-full shadow-2xl border border-blue-300/50"
              >
                <h3 className="text-lg font-semibold text-blue-700 text-center mb-4">Choose an Avatar</h3>
                <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
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
                        className="w-16 h-16 rounded-full cursor-pointer border-2 border-blue-300/50 hover:border-blue-400 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                      />
                    );
                  })}
                </div>
                <motion.button
                  className="mt-4 block mx-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all duration-200"
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
              className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-xl w-full max-w-sm p-8 rounded-3xl shadow-2xl border border-blue-300/50"
              >
                <h2 className="text-lg font-semibold text-blue-700 mb-4">
                  {modalType === 'followers' ? 'Followers' : 'Following'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-lg transition"
                >
                  ×
                </button>
                <ul className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {(modalType === 'followers' ? user.followers : user.following)?.map((u, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-gray-200 pb-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <motion.img
                          src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-10 h-10 rounded-full border-2 border-blue-300/50"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div>
                          <Link
                            to={`/users/${u._id}/profile`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                            onClick={() => setIsModalOpen(false)}
                          >
                            {u.name}
                          </Link>
                          <p className="text-xs text-gray-600">{u.email}</p>
                        </div>
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
                          className="text-xs font-medium text-red-500 hover:text-red-400 transition"
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