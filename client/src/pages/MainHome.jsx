import React, { useState, useEffect, Component } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, MessageCircle, Award } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-center text-red-600 p-4">Something went wrong. Please try refreshing.</div>;
    }
    return this.props.children;
  }
}

const MainHome = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch leaderboard
    setIsLoading(true);
    axios
      .get('/api/users/leaderboard')
      .then((res) => {
        console.log('✅ Leaderboard data:', res.data);
        // Ensure skillsOffered is an array for each user
        const sanitizedData = res.data.map((user) => ({
          ...user,
          skillsOffered: Array.isArray(user.skillsOffered) ? user.skillsOffered : [],
        }));
        setLeaderboard(sanitizedData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching leaderboard:', err.message);
        setError('Failed to load leaderboard');
        setIsLoading(false);
      });

    // Set theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleChatbotSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setChatbotMessages([...chatbotMessages, { text: userInput, sender: 'user' }]);
    try {
      const res = await axios.post('/api/chatbot', { message: userInput });
      setChatbotMessages([...chatbotMessages, { text: userInput, sender: 'user' }, { text: res.data.reply, sender: 'bot' }]);
    } catch (err) {
      setChatbotMessages([...chatbotMessages, { text: userInput, sender: 'user' }, { text: 'Sorry, something went wrong!', sender: 'bot' }]);
    }
    setUserInput('');
  };

  const nextSkill = () => setCurrentSkillIndex((prev) => (prev + 1) % (leaderboard.length || 1));
  const prevSkill = () => setCurrentSkillIndex((prev) => (prev - 1 + (leaderboard.length || 1)) % (leaderboard.length || 1));

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {/* Header */}
        <header className="p-4 flex justify-between items-center border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold">SkillSwap</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-6">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-4"
            >
              Connect, Learn, and Grow
            </motion.h2>
            <p className="text-lg mb-6">Swap skills with experts worldwide in real-time!</p>
            <a
              href="/chat"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Chatting
            </a>
          </section>

          {/* Interactive Skill Showcase */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-center">Featured Skills</h3>
            <div className="relative max-w-4xl mx-auto">
              {isLoading ? (
                <div className="text-center text-gray-600 dark:text-gray-300">Loading skills...</div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-300">No skills available</div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    key={currentSkillIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center"
                  >
                    <img
                      src={leaderboard[currentSkillIndex]?.profileImage || 'https://via.placeholder.com/64'}
                      alt="User avatar"
                      className="w-16 h-16 rounded-full mr-4"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/64')}
                    />
                    <div>
                      <h4 className="text-xl font-bold">{leaderboard[currentSkillIndex]?.name || 'Unknown User'}</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {leaderboard[currentSkillIndex]?.skillsOffered?.[0]?.skill || 'No skill listed'} -{' '}
                        {leaderboard[currentSkillIndex]?.points || 0} points
                      </p>
                      <a
                        href={`/chat?receiverId=${leaderboard[currentSkillIndex]?._id || ''}`}
                        className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Connect Now
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
              {leaderboard.length > 1 && (
                <>
                  <button
                    onClick={prevSkill}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                    aria-label="Previous skill"
                  >
                    &larr;
                  </button>
                  <button
                    onClick={nextSkill}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                    aria-label="Next skill"
                  >
                    &rarr;
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Leaderboard */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-center">Leaderboard</h3>
            {isLoading ? (
              <div className="text-center text-gray-600 dark:text-gray-300">Loading leaderboard...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-300">No users available</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                  >
                    <div className="flex items-center">
                      <Award className="mr-2 text-yellow-500" />
                      <img
                        src={user.profileImage || 'https://via.placeholder.com/40'}
                        alt="User avatar"
                        className="w-10 h-10 rounded-full mr-4"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                      />
                      <div>
                        <h4 className="font-bold">{user.name || 'Unknown'}</h4>
                        <p className="text-gray-600 dark:text-gray-300">{user.points || 0} points</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Chatbot Widget */}
        <AnimatePresence>
          {chatbotOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
            >
              <div className="h-64 overflow-y-auto mb-4">
                {chatbotMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 mb-2 rounded-lg ${
                      msg.sender === 'user' ? 'bg-blue-100 text-right dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatbotSubmit} className="flex">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-grow p-2 rounded-l-lg border dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Ask me anything..."
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                  aria-label="Send message"
                >
                  <MessageCircle size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
          aria-label="Toggle chatbot"
        >
          <MessageCircle size={24} />
        </button>

        {/* Footer */}
        <footer className="p-6 bg-gray-200 dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-4">
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Hey, want to swap skills? Try chatting with someone now!"
              </p>
              <div className="mt-2 flex space-x-4">
                <a href="/chat" className="text-blue-600 hover:underline">
                  Start a Chat
                </a>
                <a href="/leaderboard" className="text-blue-600 hover:underline">
                  View Leaderboard
                </a>
                <a href="/profile" className="text-blue-600 hover:underline">
                  Update Profile
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>&copy; 2025 SkillSwap. All rights reserved.</p>
              <div className="flex space-x-4">
                <a href="/about" className="text-blue-600 hover:underline">
                  About
                </a>
                <a href="/contact" className="text-blue-600 hover:underline">
                  Contact
                </a>
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default MainHome;