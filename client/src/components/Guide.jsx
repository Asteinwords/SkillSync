import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'backOut' } },
};

const Guide = ({ isOpen, setIsOpen }) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flipping, setFlipping] = useState(null); // 'next' or 'prev'

  const instructions = useMemo(() => [
    {
      title: "Navigation",
      content: [
        "Tap the three-bar icon in the navbar to explore.",
        "Access all sections of SkillSync seamlessly."
      ]
    },
    {
      title: "Dashboard",
      content: [
        "Update skills you offer and seek for perfect matches.",
        "Visit daily to earn 2 points and maintain your streak."
      ]
    },
    {
      title: "Matches",
      content: [
        "Search users by skills or find auto-matched partners.",
        "Follow profiles, chat, and schedule skill sessions."
      ]
    },
    {
      title: "Scheduling",
      content: [
        "Select a mutual follower and set session details.",
        "Add a Google Meet link; recipient must accept.",
        "Join on time and mark done to log session time.",
        "Provide feedback in past rooms to enhance quality."
      ]
    },
    {
      title: "Chat",
      content: [
        "Connect only with mutual followers for secure chats.",
        "Select text to delete for all or just yourself."
      ]
    }
  ], []);

  const spreads = useMemo(() => {
    const p = [...instructions];
    if (p.length % 2 !== 0) p.push({ title: '', content: [] });
    const s = [];
    for (let i = 0; i < p.length; i += 2) {
      s.push({ left: p[i], right: p[i + 1] });
    }
    return s;
  }, [instructions]);

  const handleNext = () => {
    if (currentSpread < spreads.length - 1 && !flipping) {
      setFlipping('next');
    }
  };

  const handlePrev = () => {
    if (currentSpread > 0 && !flipping) {
      setFlipping('prev');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-brown-800 rounded-2xl shadow-2xl p-6 max-w-4xl w-full md:max-w-4xl"
            style={{ perspective: '2000px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-center text-white mb-6">SkillSync Guide</h2>
            <div className="book relative flex w-full h-96 md:h-[500px] bg-brown-900 shadow-2xl rounded-lg overflow-hidden border-4 border-brown-600">
              <motion.div
                className="left-page w-1/2 p-6 bg-white shadow-inner overflow-y-auto"
                style={{ transformOrigin: 'right', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                animate={flipping === 'prev' ? { rotateY: 180 } : { rotateY: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                onAnimationComplete={() => {
                  if (flipping === 'prev') {
                    setCurrentSpread(currentSpread - 1);
                    setFlipping(null);
                  }
                }}
              >
                <div className="front absolute inset-0 p-6 bg-white" style={{ backfaceVisibility: 'hidden' }}>
                  <h3 className="text-xl font-bold text-blue-700 mb-4">{spreads[currentSpread].left.title}</h3>
                  <ul className="list-disc pl-5 text-gray-800 text-sm md:text-base">
                    {spreads[currentSpread].left.content.map((point, index) => (
                      <li key={index} className="mb-2">{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="back absolute inset-0 p-6 bg-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <h3 className="text-xl font-bold text-blue-700 mb-4">{flipping === 'prev' ? spreads[currentSpread - 1]?.right.title || '' : ''}</h3>
                  <ul className="list-disc pl-5 text-gray-800 text-sm md:text-base">
                    {flipping === 'prev' ? spreads[currentSpread - 1]?.right.content.map((point, index) => (
                      <li key={index} className="mb-2">{point}</li>
                    )) : []}
                  </ul>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                  Page {currentSpread * 2 + 1}
                </div>
              </motion.div>
              <motion.div
                className="right-page w-1/2 p-6 bg-white shadow-inner overflow-y-auto"
                style={{ transformOrigin: 'left', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                animate={flipping === 'next' ? { rotateY: -180 } : { rotateY: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                onAnimationComplete={() => {
                  if (flipping === 'next') {
                    setCurrentSpread(currentSpread + 1);
                    setFlipping(null);
                  }
                }}
              >
                <div className="front absolute inset-0 p-6 bg-white" style={{ backfaceVisibility: 'hidden' }}>
                  <h3 className="text-xl font-bold text-blue-700 mb-4">{spreads[currentSpread].right.title}</h3>
                  <ul className="list-disc pl-5 text-gray-800 text-sm md:text-base">
                    {spreads[currentSpread].right.content.map((point, index) => (
                      <li key={index} className="mb-2">{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="back absolute inset-0 p-6 bg-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <h3 className="text-xl font-bold text-blue-700 mb-4">{flipping === 'next' ? spreads[currentSpread + 1]?.left.title || '' : ''}</h3>
                  <ul className="list-disc pl-5 text-gray-800 text-sm md:text-base">
                    {flipping === 'next' ? spreads[currentSpread + 1]?.left.content.map((point, index) => (
                      <li key={index} className="mb-2">{point}</li>
                    )) : []}
                  </ul>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                  Page {currentSpread * 2 + 2}
                </div>
              </motion.div>
            </div>
            <div className="flex justify-between mt-4">
              <motion.button
                onClick={handlePrev}
                disabled={currentSpread === 0 || flipping}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-600"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Previous
              </motion.button>
              <motion.button
                onClick={handleNext}
                disabled={currentSpread === spreads.length - 1 || flipping}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-600"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Guide;