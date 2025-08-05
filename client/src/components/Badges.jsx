import React from 'react';
import {
  FaTrophy,
  FaMedal,
  FaUserGraduate,
  FaUserTie,
  FaChalkboardTeacher,
  FaStar,
  FaCalendarCheck,
  FaRocket,
  FaShieldAlt,
  FaBolt,
  FaCheckCircle,
  FaBook,
  FaUsers,
  FaCrown,
} from 'react-icons/fa';
import { GiLaurelCrown, GiAchievement, GiSkills } from 'react-icons/gi';
import { motion } from 'framer-motion';

const badges = [
  { title: '7-Day Streak', description: 'Consistent daily login', icon: <FaCalendarCheck />, color: 'bg-slate-100 text-slate-800' },
  { title: '100 XP Achiever', description: 'Crossed 100 XP milestone', icon: <FaStar />, color: 'bg-yellow-100 text-yellow-800' },
  { title: 'First Skill Learned', description: 'Completed a skill path', icon: <FaCheckCircle />, color: 'bg-green-100 text-green-800' },
  { title: 'First Session Hosted', description: 'Conducted a live session', icon: <FaChalkboardTeacher />, color: 'bg-indigo-100 text-indigo-800' },
  { title: '500 XP Badge', description: 'Mid-level user recognition', icon: <FaMedal />, color: 'bg-amber-100 text-amber-800' },
  { title: 'Top 10 Leaderboard', description: 'Among the top 10 users', icon: <GiLaurelCrown />, color: 'bg-purple-100 text-purple-800' },
  { title: 'Completed 5 Skills', description: 'Learning path finisher', icon: <FaBook />, color: 'bg-blue-100 text-blue-800' },
  { title: '10 Sessions Badge', description: 'Frequent contributor', icon: <FaUsers />, color: 'bg-sky-100 text-sky-800' },
  { title: '1k XP Master', description: 'Achieved 1000 XP', icon: <FaTrophy />, color: 'bg-orange-100 text-orange-800' },
  { title: 'Platform Power User', description: 'Used all platform tools', icon: <GiSkills />, color: 'bg-stone-100 text-stone-700' },
  { title: 'Fast Learner', description: 'Finished skill in <2 days', icon: <FaBolt />, color: 'bg-lime-100 text-lime-800' },
  { title: 'Verified Mentor', description: 'Taught skills to others', icon: <FaUserTie />, color: 'bg-rose-100 text-rose-800' },
  { title: 'Top Mentor', description: 'Highly rated mentor sessions', icon: <FaCrown />, color: 'bg-emerald-100 text-emerald-800' },
  { title: 'Security Contributor', description: 'Reported a vulnerability', icon: <FaShieldAlt />, color: 'bg-gray-100 text-gray-800' },
  { title: '5 Star Rated', description: 'Earned 5 star average', icon: <FaStar />, color: 'bg-yellow-50 text-yellow-700' },
  { title: '50 Collaborations', description: 'Worked with 50 peers', icon: <FaUsers />, color: 'bg-cyan-100 text-cyan-800' },
  { title: 'Streak King', description: '30-day streak badge', icon: <FaCalendarCheck />, color: 'bg-zinc-100 text-zinc-700' },
  { title: '100 Sessions', description: 'Elite session contributor', icon: <FaChalkboardTeacher />, color: 'bg-pink-100 text-pink-800' },
  { title: 'Skill Certification', description: 'Passed skill quiz', icon: <FaUserGraduate />, color: 'bg-violet-100 text-violet-800' },
  { title: 'Elite Contributor', description: 'Contributed to platform growth', icon: <GiAchievement />, color: 'bg-fuchsia-100 text-fuchsia-800' },
  { title: '2500 XP Badge', description: 'XP expert level achieved', icon: <FaTrophy />, color: 'bg-teal-100 text-teal-800' },
  { title: '50 Feedbacks Given', description: 'Active reviewer', icon: <FaCheckCircle />, color: 'bg-rose-50 text-rose-700' },
  { title: 'Growth Champion', description: '300 XP/week growth', icon: <FaRocket />, color: 'bg-green-50 text-green-700' },
  { title: 'UI Bug Hunter', description: 'Reported 3+ UI bugs', icon: <FaShieldAlt />, color: 'bg-neutral-100 text-neutral-800' },
  { title: 'Skill Portfolio Complete', description: '10+ skills listed', icon: <GiSkills />, color: 'bg-amber-50 text-amber-800' },
  { title: 'Early Adopter', description: 'Joined in Beta phase', icon: <FaMedal />, color: 'bg-stone-50 text-stone-700' },
  { title: 'Verified Learner', description: 'Completed onboarding quiz', icon: <FaCheckCircle />, color: 'bg-slate-200 text-slate-800' },
  { title: 'Top 1% Badge', description: 'Among elite platform users', icon: <FaCrown />, color: 'bg-indigo-50 text-indigo-700' },
  { title: '5x Skill Mentor', description: 'Mentored in 5+ skills', icon: <FaUserTie />, color: 'bg-yellow-200 text-yellow-900' },
  { title: 'Trusted Peer', description: 'Highly rated in peer feedback', icon: <FaUsers />, color: 'bg-gray-200 text-gray-900' },
];

const skillTags = [
  { title: 'Trainee', points: '0–49', style: 'bg-slate-100 text-slate-800' },
  { title: 'Apprentice', points: '50–149', style: 'bg-blue-100 text-blue-800' },
  { title: 'Associate', points: '150–299', style: 'bg-sky-100 text-sky-800' },
  { title: 'Proficient', points: '300–499', style: 'bg-indigo-100 text-indigo-800' },
  { title: 'Specialist', points: '500–749', style: 'bg-purple-100 text-purple-800' },
  { title: 'Expert', points: '750–999', style: 'bg-rose-100 text-rose-800' },
  { title: 'Champion', points: '1000–1249', style: 'bg-emerald-100 text-emerald-800' },
  { title: 'Elite', points: '1250–1499', style: 'bg-yellow-100 text-yellow-800' },
  { title: 'Master', points: '1500–1999', style: 'bg-orange-100 text-orange-800' },
  { title: 'Legend', points: '2000+', style: 'bg-red-100 text-red-800' },
];

const Badges = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🏅 Professional Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {badges.map((badge, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.04 }}
            className={`flex items-start space-x-4 p-4 rounded-lg shadow-sm border ${badge.color}`}
          >
            <div className="text-2xl mt-1">{badge.icon}</div>
            <div>
              <h3 className="font-semibold">{badge.title}</h3>
              <p className="text-sm text-gray-700">{badge.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <h2 className="text-3xl font-bold mt-12 mb-4">🏷️ Skill Level Tags</h2>
      <div className="flex flex-wrap gap-4">
        {skillTags.map((tag, index) => (
          <div
            key={index}
            className={`px-4 py-2 rounded-full font-medium shadow-sm text-sm ${tag.style}`}
          >
            {tag.title} <span className="text-xs ml-2">({tag.points})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Badges;
