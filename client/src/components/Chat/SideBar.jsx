import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Sidebar = ({ contacts, onUserSelect, unreadCounts }) => {
  return (
    <div className="w-full bg-white h-full overflow-y-auto sm:w-80 sm:bg-white/80 sm:backdrop-blur-xl sm:shadow-md sm:rounded-r-lg sm:h-full">
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-pink-500 text-white text-lg font-semibold border-b">
        <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
        Chats
      </div>
      {contacts.map((user) => (
        <motion.div
          key={user._id}
          onClick={() => onUserSelect(user)}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 sm:hover:bg-blue-100/40 transition duration-200"
        >
          <div className="flex items-center gap-3">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <div>
              <p className="text-gray-800 font-medium text-sm truncate">{user.name}</p>
            </div>
          </div>
          {(unreadCounts[user._id] || 0) > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {unreadCounts[user._id]}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Sidebar;