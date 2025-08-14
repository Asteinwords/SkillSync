import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Sidebar = ({ contacts, onUserSelect, unreadCounts }) => {
  return (
    <div className="w-full bg-white shadow-2xl h-full overflow-y-auto sm:w-72 sm:bg-white/80 sm:backdrop-blur-xl sm:shadow-2xl sm:rounded-3xl sm:m-4 sm:h-[95%] sm:overflow-y-auto sm:z-10">
      <div className="text-xl font-bold p-4 border-b bg-gradient-to-r from-blue-600 to-pink-500 text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
        Chats
      </div>
      {contacts.map((user) => (
        <div
          key={user._id}
          onClick={() => onUserSelect(user)}
          className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-100 transition duration-200 sm:hover:bg-blue-100/40"
        >
          <div className="flex items-center gap-3">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border border-blue-300"
            />
            <p className="text-gray-800 font-medium">{user.name}</p>
          </div>
          {(unreadCounts[user._id] || 0) > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {unreadCounts[user._id]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;