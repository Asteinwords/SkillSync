import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, MessageCircle, Video, ChevronRight } from 'lucide-react';
import API from '../services/api';
import Stars from '../assets/stars.svg';
import { toast } from 'react-hot-toast';

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

const faqs = [
  { question: "What is SkillSync?", answer: "SkillSync is a peer-to-peer platform where you can exchange micro-skills with others." },
  { question: "How do I start?", answer: "Sign up, list your skills, and find matches to trade skills." },
  { question: "Is it free?", answer: "Yes, SkillSync is free to use with optional premium features." },
  { question: "How are matches made?", answer: "We match based on skills you offer and want to learn." },
  { question: "Can I chat with matches?", answer: "Yes, you can chat with mutual followers." },
  { question: "What are points?", answer: "Points are earned through activity and skill exchanges." },
  { question: "How do badges work?", answer: "Badges reflect your experience level on the platform." },
  { question: "Can I schedule meetings?", answer: "Yes, schedule Google Meet sessions with matches." },
  { question: "Is my data safe?", answer: "We prioritize your privacy with secure data handling." },
  { question: "How do I contact support?", answer: "Reach out via our Contact page or email." },
];

const MainHome = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top users
        const { data: users } = await API.get('/users/top-users');
        setTopUsers(users.slice(0, 3));

        // Fetch recent chats
        if (token && userId) {
          setIsLoadingChats(true);
          const response = await API.get('/chat/recent', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Recent chats response:', response.data); // Debug log
          setRecentChats(response.data.slice(0, 3));
          setChatError(null);
        } else {
          console.log('No token or userId, skipping recent chats fetch');
          setChatError('Please log in to view recent chats');
        }
      } catch (err) {
        console.error('Fetch Error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          toast.error('Please log in to view recent chats');
          setChatError('Please log in to view recent chats');
        } else {
          toast.error('Failed to load data');
          setChatError(`Failed to load recent chats: ${err.message}`);
        }
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchData();
  }, [token, userId]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/.+\@.+\..+/.test(newsletterEmail)) {
      toast.error('Please enter a valid email');
      return;
    }
    setIsSubmittingNewsletter(true);
    try {
      await API.post('/users/newsletter', { email: newsletterEmail });
      toast.success('Thank you for subscribing! Check your email for confirmation.');
      setNewsletterEmail('');
    } catch (err) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 font-sans overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none animate-pulse"
        loading="lazy"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 z-10"
      >
        {/* Hero Section */}
        <motion.section
          variants={itemVariants}
          className="text-center mb-16 sm:mb-24"
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 mb-6">
            Learn, Teach, and Grow Together
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            SkillSync is a peer-to-peer micro-skill exchange platform. Trade what you know for what you want to learn.
          </p>
          <Link
            to="/matches"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200"
          >
            Explore Skills
          </Link>
        </motion.section>

        {/* How It Works */}
        <motion.section
          variants={itemVariants}
          className="mb-16 sm:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg"
            >
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Offer a Skill</h3>
              <p className="text-gray-600">List what you're good at</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg"
            >
              <MessageCircle className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Match & Chat</h3>
              <p className="text-gray-600">Find someone who wants your skill and offers what you want</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg"
            >
              <Video className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Sync & Meet</h3>
              <p className="text-gray-600">Schedule a session on Google Meet</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Live Leaderboard Snapshot */}
        <motion.section
          variants={itemVariants}
          className="mb-16 sm:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-12">
            Top Skill Traders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {topUsers.map((user, index) => (
              <motion.div
                key={user._id}
                variants={itemVariants}
                className={`p-6 rounded-xl shadow-lg bg-white/90 backdrop-blur-sm border-l-4 ${
                  index === 0
                    ? 'border-yellow-400'
                    : index === 1
                    ? 'border-gray-400'
                    : 'border-orange-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <motion.img
                    src={user.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-blue-600">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.points} Points</p>
                    <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${badgeStyles[user.badge]}`}>
                      {user.badge}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Skills Exchanged: {user.skillsOffered?.length + user.skillsWanted?.length || 0}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/leaderboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-semibold"
            >
              View Full Leaderboard <ChevronRight className="ml-2" />
            </Link>
          </div>
        </motion.section>

        {/* Recent Chats */}
        {token && userId && (
          <motion.section
            variants={itemVariants}
            className="mb-16 sm:mb-24"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-12">
              Recent Chats
            </h2>
            {isLoadingChats ? (
              <div className="text-center text-gray-600">Loading recent chats...</div>
            ) : chatError ? (
              <div className="text-center text-red-600">{chatError}</div>
            ) : recentChats.length === 0 ? (
              <div className="text-center text-gray-600">No recent chats available. Start a conversation!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {recentChats.map((chat) => (
                  <motion.div
                    key={chat._id}
                    variants={itemVariants}
                    className="p-6 rounded-xl shadow-lg bg-white/90 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={chat.user?.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(chat.user?.name || 'Unknown')}`}
                        alt={chat.user?.name || 'Unknown'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
                      />
                      <div>
                        <p className="font-semibold text-blue-600">{chat.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600 truncate">{chat.lastMessage || 'No messages yet'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Floating Chatbot */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <AnimatePresence>
            {showChatbot && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-16 right-0 w-80 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-4 max-h-[70vh] overflow-y-auto"
              >
                <h3 className="text-lg font-semibold text-blue-700 mb-4">SkillSync Chatbot</h3>
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-4"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left font-medium text-blue-600 hover:text-blue-500"
                    >
                      {faq.question}
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-gray-600 mt-2"
                        >
                          {faq.answer}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="mt-16 sm:mt-24 pt-12 border-t border-blue-200/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">SkillSync</h3>
              <p className="text-sm text-gray-600">
                Trade skills, connect with others, and grow your expertise.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-blue-600 hover:text-blue-500">About</Link></li>
                <li><Link to="/faq" className="text-blue-600 hover:text-blue-500">FAQ</Link></li>
                <li><Link to="/contact" className="text-blue-600 hover:text-blue-500">Contact</Link></li>
                <li><Link to="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="https://github.com" className="text-blue-600 hover:text-blue-500">GitHub</a>
                <a href="https://twitter.com" className="text-blue-600 hover:text-blue-500">Twitter</a>
                <a href="https://linkedin.com" className="text-blue-600 hover:text-blue-500">LinkedIn</a>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="mt-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-2">Newsletter</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isSubmittingNewsletter}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-white ${
                      isSubmittingNewsletter ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isSubmittingNewsletter}
                  >
                    {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-12">
            &copy; {new Date().getFullYear()} SkillSync. All rights reserved.
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default MainHome;