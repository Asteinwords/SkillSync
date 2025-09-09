import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Stars from '../assets/stars.svg';
import API from '../services/api';
import moment from "moment";
import { Badge, Gift, Code, Smartphone, Shirt } from 'lucide-react';

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

const PointsStore = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [storeItems, setStoreItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('No token found. Please login.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: userData } = await API.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserPoints(userData.points || 0);

        // Updated store items with SVGs sized for the card layout
        const mockItems = [
          // Badges
          { id: 1, name: 'Bronze Badge', cost: 50, category: 'badges', image: 'https://www.svgrepo.com/show/422996/medal-bronze-prize.svg', description: 'Unlock the Bronze Badge for your first 50 points!' },
          { id: 2, name: 'Silver Badge', cost: 100, category: 'badges', image: 'https://www.svgrepo.com/show/422997/medal-silver-badge.svg', description: 'Earn the Silver Badge and show your expertise.' },
          { id: 3, name: 'Gold Badge', cost: 200, category: 'badges', image: 'https://www.svgrepo.com/show/422998/medal-gold-winner-2.svg', description: 'The prestigious Gold Badge for top performers.' },

          // Icons
          { id: 4, name: 'Custom Icon Pack', cost: 75, category: 'icons', image: 'https://www.svgrepo.com/show/517348/lawnicons.svg', description: 'A pack of unique icons for your profile.' },
          { id: 5, name: 'Premium Icon', cost: 150, category: 'icons', image: 'https://www.svgrepo.com/show/530063/widget.svg', description: 'Exclusive premium icons to stand out.' },

          // Redeem Codes
          { id: 6, name: '10% Discount Code', cost: 50, category: 'codes', image: 'https://www.svgrepo.com/show/535313/code-block.svg', description: 'Get 10% off on your next purchase.' },
          { id: 7, name: 'Free Shipping Code', cost: 100, category: 'codes', image: 'https://www.svgrepo.com/show/535313/code-block.svg', description: 'Redeem for free shipping on merchandise.' },

          // Gadgets
          { id: 8, name: 'Wireless Earbuds', cost: 300, category: 'gadgets', image: 'https://www.svgrepo.com/show/530242/earphone.svg', description: 'High-quality wireless earbuds for your daily use.' },
          { id: 9, name: 'Smart Watch', cost: 500, category: 'gadgets', image: 'https://www.svgrepo.com/show/533166/watch-alt-2.svg', description: 'A smart watch with fitness tracking features.' },

          // Merchandise
          { id: 10, name: 'SkillSync T-Shirt', cost: 200, category: 'merch', image: 'https://www.svgrepo.com/show/505500/shirt.svg', description: 'Comfortable T-Shirt with SkillSync logo.' },
          { id: 11, name: 'SkillSync Hoodie', cost: 400, category: 'merch', image: 'https://www.svgrepo.com/show/474309/shirt.svg', description: 'Cozy Hoodie for the winter season.' },
          { id: 12, name: 'SkillSync Mug', cost: 100, category: 'merch', image: 'https://www.svgrepo.com/show/425793/coffee-mug.svg', description: 'A mug to sip your coffee while learning.' },
        ];
        setStoreItems(mockItems);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch store data:', err);
        setError('Failed to load store. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleRedeem = (item) => {
    toast.info('Points store is in development');
    // Future: Implement redemption logic
  };

  if (isLoading) {
    return <div className="text-center mt-20 text-2xl text-blue-600">Loading Store...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-2xl text-red-600">{error}</div>;
  }

  const categories = ['badges', 'icons', 'codes', 'gadgets', 'merch'];
  const categoryIcons = {
    badges: Badge,
    icons: Gift,
    codes: Code,
    gadgets: Smartphone,
    merch: Shirt,
  };
  const categoryTitles = {
    badges: 'Badges',
    icons: 'Icons',
    codes: 'Redeem Codes',
    gadgets: 'Gadgets',
    merch: 'Merchandise',
  };
  const categoryDescriptions = {
    badges: 'Earn badges to show your achievements!',
    icons: 'Customize your profile with unique icons.',
    codes: 'Redeem codes for discounts and offers.',
    gadgets: 'Exchange points for cool gadgets.',
    merch: 'Get branded merchandise with your points.',
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-4 sm:px-6 py-16 font-sans overflow-hidden">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
        loading="lazy"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative max-w-4xl mx-auto z-10"
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 mb-12 flex items-center justify-center gap-3"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          Points Store
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
        </motion.h1>

        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-300/50 text-center mb-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">Your Points:</p>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600">{userPoints}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Last updated: {moment().format('hh:mm A z, MMMM DD, YYYY')}
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <motion.h2
                className="text-2xl sm:text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 mb-6 flex items-center justify-center gap-2"
                variants={itemVariants}
              >
                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
                {categoryTitles[category]}
              </motion.h2>
              <p className="text-center text-gray-600 mb-4 bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-blue-300/50">
                {categoryDescriptions[category]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <motion.div
                      key={item.id}
                      className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-5 border border-blue-300/50 hover:shadow-xl transition"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center justify-center mb-4">
                        {React.createElement(categoryIcons[category], { className: 'w-10 h-10 text-blue-600' })}
                      </div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-contain rounded-md mb-2 mx-auto"
                        onError={(e) => console.error(`Failed to load image for ${item.name}: ${item.image}`)}
                      />
                      <h3 className="text-lg font-semibold text-blue-700">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-sm text-gray-800 font-medium">Cost: {item.cost} points</p>
                      <button
                        onClick={() => handleRedeem(item)}
                        className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Redeem
                      </button>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
      <ToastContainer />
    </div>
  );
};

export default PointsStore;