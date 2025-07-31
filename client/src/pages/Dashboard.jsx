import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Stars from '../assets/stars.svg';
import moment from 'moment';

// Static anime avatar URLs for specific characters
const animeAvatars = [
  'https://wallpapercave.com/uwp/uwp3598593.jpeg', // Monkey D. Luffy (One Piece)
  'https://wallpapercave.com/uwp/uwp4621472.png', // Eren Yeager (Attack on Titan)
  'https://wallpapercave.com/uwp/uwp4772764.png', // Naruto Uzumaki (Naruto)
  'https://wallpapercave.com/uwp/uwp4658640.jpeg', // Goku (Dragon Ball)
  'https://wallpapercave.com/wp/wp3228031.jpg', // Ichigo Kurosaki (Bleach)
  'https://wallpapercave.com/wp/rGputFU.jpg',
  'https://wallpapercave.com/wp/wp13968902.jpg',
  'https://static1.srcdn.com/wordpress/wp-content/uploads/2021/02/He-Grew-Up-In-Squalor-And-Poverty-Cropped.jpg', // Light Yagami (Death Note)
];

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
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
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
        console.log('Profile Data:', profileData); // Debug followers/following data
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
        console.error('Fetch Error:', err);
      }
    };
    fetchProfileAndStreak();
  }, [token]);

  const handleChange = useCallback((type, index, field, value) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated[index][field] = value;
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  }, [skillsOffered, skillsWanted]);

  const addSkillRow = useCallback((type) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated.push({ skill: '', level: 'Beginner' });
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  }, [skillsOffered, skillsWanted]);

  const deleteSkillRow = useCallback((type, index) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated.splice(index, 1);
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  }, [skillsOffered, skillsWanted]);

  const handleSubmit = useCallback(async (e) => {
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
      console.error('Skills Update Error:', err);
    }
  }, [skillsOffered, skillsWanted, token]);

  const handleProfileInfoSubmit = useCallback(async (e) => {
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
      console.error('Profile Info Update Error:', err);
    }
  }, [aboutMe, education, token]);

  const handleImageUpload = useCallback(async (file) => {
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
        console.error('Image Upload Error');
      }
    };
    reader.readAsDataURL(file);
  }, [token]);

  const handleEducationChange = useCallback((index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  }, [education]);

  const addEducationRow = useCallback(() => {
    setEducation([...education, { degree: '', institute: '', year: '' }]);
  }, [education]);

  const deleteEducationRow = useCallback((index) => {
    const updated = [...education];
    updated.splice(index, 1);
    setEducation(updated);
  }, [education]);

  // Define avatar styles and their descriptions
  const avatarStyles = useMemo(() => [
    { style: 'thumbs', label: 'Thumbs (Simple Icons)' },
    { style: 'avataaars', label: 'Avataaars (Human-like)' },
    { style: 'bottts', label: 'Bottts (Robotic)' },
    { style: 'micah', label: 'Micah (Illustrated)' },
    { style: 'adventurer', label: 'Adventurer (Fantasy)' },
    { style: 'croodles', label: 'Croodles (Abstract)' },
    { style: 'open-peeps', label: 'Open Peeps (Cartoon)' },
    { style: 'notionists', label: 'Notionists (Modern Cartoon)' },
    { style: 'anime', label: 'Anime Characters', isStatic: true, avatars: animeAvatars },
  ], []);

  // Memoized avatar selection handler
  const handleAvatarSelect = useCallback(async (avatarUrl) => {
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
      console.error('Avatar Select Error:', avatarUrl);
    }
  }, [token]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-4 sm:px-6 py-12 sm:py-16 font-sans overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
        loading="lazy"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto z-10"
      >
        <motion.h1
          className="text-3xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center gap-3 mb-8 sm:mb-12"
          variants={itemVariants}
        >
          <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-400 animate-bounce" />
          Dashboard
          <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-400 animate-bounce" />
        </motion.h1>

        {/* Top Row: Profile Card and Calendar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8">
          {/* Profile Section */}
          {user && (
            <motion.section
              variants={itemVariants}
              className="sm:col-span-4 bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-blue-300/50"
            >
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <div className="relative group">
                  <motion.img
                    src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                    alt="Profile"
                    className="w-20 sm:w-24 h-20 sm:h-24 rounded-full object-cover border-4 border-blue-300/50 shadow-md group-hover:shadow-lg transition-all duration-200 mx-auto"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.15 }}
                    loading="lazy"
                  />
                  <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <label className="cursor-pointer text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 transition text-center">
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
                      className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                    >
                      Choose Avatar
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-semibold text-blue-700">{user.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600"><strong>Email:</strong> {user.email}</p>
                  <p className="text-xs sm:text-sm text-gray-600"><strong>Points:</strong> <span className="text-blue-600">{user.points}</span></p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Badge:</strong>{' '}
                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[user.badge] || 'bg-gray-100 text-gray-600'}`}>
                      {user.badge}
                    </span>
                  </p>
                </div>
                <div className="text-center w-full">
                  <h3 className="text-xs sm:text-sm font-medium text-blue-700 mb-2 sm:mb-3">Network</h3>
                  <div className="flex justify-center gap-6 sm:gap-8 text-xs sm:text-sm">
                    <motion.div
                      className="text-center cursor-pointer hover:text-blue-500 transition"
                      onClick={() => { setModalType('followers'); setIsModalOpen(true); }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{user.followers?.length || 0}</p>
                      <p>Followers</p>
                    </motion.div>
                    <motion.div
                      className="text-center cursor-pointer hover:text-blue-500 transition"
                      onClick={() => { setModalType('following'); setIsModalOpen(true); }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{user.following?.length || 0}</p>
                      <p>Following</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Streak Calendar Section */}
          {user && (
            <motion.section
              variants={itemVariants}
              className="sm:col-span-8 bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-blue-300/50"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3 sm:mb-4">Activity Streak</h2>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                <span>Visits in the past year: {streakData.totalDays}</span>
                <span>Total: {streakData.totalDays} | Max: {streakData.maxStreak} | Current: {streakData.currentStreak}</span>
              </div>
              <Heatmap streak={streakData.totalDays} />
              <div className="text-xs text-gray-500 mt-2 sm:mt-3">
                {moment().subtract(1, 'year').format('MMM DD, YYYY')} - {moment().format('MMM DD, YYYY')}
              </div>
            </motion.section>
          )}
        </div>

        {/* Bottom Row: About Me and Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* About Me Section */}
          <motion.form
            onSubmit={handleProfileInfoSubmit}
            variants={itemVariants}
            className="sm:col-span-6 bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-blue-300/50 space-y-4 sm:space-y-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-blue-700">About Me</h2>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bio</label>
              <textarea
                rows={4}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Write a short bio..."
                className="w-full bg-gray-100/50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Education</label>
              <AnimatePresence>
                {education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Degree"
                      className="bg-gray-100/50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Institute"
                      className="bg-gray-100/50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
                      value={edu.institute}
                      onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
                    />
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="text"
                        placeholder="Year of Grad"
                        className="bg-gray-100/50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                      />
                      <motion.button
                        type="button"
                        onClick={() => deleteEducationRow(index)}
                        className="text-red-500 text-base sm:text-lg hover:text-red-400 transition"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.15 }}
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
                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
              >
                + Add More
              </motion.button>
            </div>
            <div className="text-right">
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Save Profile
              </motion.button>
            </div>
          </motion.form>

          {/* Skills Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={itemVariants}
            className="sm:col-span-6 bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-blue-300/50 space-y-4 sm:space-y-6"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2 sm:mb-3">Skills You Can Teach</h2>
              <AnimatePresence>
                {skillsOffered.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2 sm:gap-4 mb-3 sm:mb-4 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Skill"
                      className="w-2/3 bg-gray-100/50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
                      value={item.skill}
                      onChange={(e) => handleChange('offered', index, 'skill', e.target.value)}
                      required
                    />
                    <select
                      className="w-1/3 bg-gray-100/50 border border-gray-200 px-2 sm:px-3 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
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
                      className="text-red-500 text-base sm:text-lg hover:text-red-400 transition"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.15 }}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                type="button"
                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                onClick={() => addSkillRow('offered')}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
              >
                + Add Skill
              </motion.button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2 sm:mb-3">Skills You Want to Learn</h2>
              <AnimatePresence>
                {skillsWanted.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2 sm:gap-4 mb-3 sm:mb-4 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Skill"
                      className="w-2/3 bg-gray-100/50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
                      value={item.skill}
                      onChange={(e) => handleChange('wanted', index, 'skill', e.target.value)}
                      required
                    />
                    <select
                      className="w-1/3 bg-gray-100/50 border border-gray-200 px-2 sm:px-3 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all duration-200 text-sm sm:text-base"
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
                      className="text-red-500 text-base sm:text-lg hover:text-red-400 transition"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.15 }}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button
                type="button"
                className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                onClick={() => addSkillRow('wanted')}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
              >
                + Add Skill
              </motion.button>
            </div>

            <div className="text-right">
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl w-full max-w-lg sm:max-w-3xl shadow-2xl border border-blue-300/50"
              >
                <h3 className="text-base sm:text-lg font-semibold text-blue-700 text-center mb-4 sm:mb-6">Choose an Avatar</h3>
                <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
                  {avatarStyles.map(({ style, label, isStatic, avatars }) => (
                    <div key={style}>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">{label}</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
                        {(isStatic ? avatars : Array.from({ length: 6 })).map((avatar, idx) => {
                          const seed = isStatic ? null : `${user?.name || 'User'}-${style}-${idx}`;
                          const avatarUrl = isStatic ? avatar : `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
                          console.log(`Rendering avatar: ${style}-${idx}, URL: ${avatarUrl}`); // Debug avatar URLs
                          return (
                            <motion.img
                              key={`${style}-${idx}`}
                              src={avatarUrl}
                              alt={`${style} avatar ${idx + 1}`}
                              onClick={() => handleAvatarSelect(avatarUrl)}
                              className="w-12 sm:w-16 h-12 sm:h-16 rounded-full cursor-pointer border-2 border-blue-300/50 hover:border-blue-400 transition-all duration-200 object-cover"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.15 }}
                              loading="lazy"
                              onError={(e) => {
                                console.error(`Failed to load avatar: ${avatarUrl}`);
                                e.target.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=fallback-${style}-${idx}`;
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <motion.button
                  className="mt-4 sm:mt-6 block mx-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  onClick={() => setShowAvatarPicker(false)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white/90 backdrop-blur-xl w-full max-w-sm p-6 sm:p-8 rounded-3xl shadow-2xl border border-blue-300/50"
              >
                <h2 className="text-base sm:text-lg font-semibold text-blue-700 mb-3 sm:mb-4">
                  {modalType === 'followers' ? 'Followers' : 'Following'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-lg transition"
                >
                  ×
                </button>
                <ul className="space-y-3 sm:space-y-4 max-h-64 overflow-y-auto pr-2">
                  {(modalType === 'followers' ? user.followers : user.following)?.map((u, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="border-b border-gray-200 pb-2 sm:pb-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <motion.img
                          src={u.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(u.name || u._id)}`}
                          alt={u.name || 'Unknown User'}
                          className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-blue-300/50"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.15 }}
                          loading="lazy"
                        />
                        <div>
                          <Link
                            to={`/users/${u._id}/profile`}
                            className="text-xs sm:text-sm font-medium !text-blue-600 hover:text-blue-500 transition"
                            onClick={() => setIsModalOpen(false)}
                          >
                            {u.name || 'Unknown User'}
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
                              toast.success(`Unfollowed ${u.name || 'user'}`);
                            } catch {
                              toast.error('Failed to unfollow');
                              console.error('Unfollow Error:', u._id);
                            }
                          }}
                          className="text-xs font-medium text-red-500 hover:text-red-400 transition"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.15 }}
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