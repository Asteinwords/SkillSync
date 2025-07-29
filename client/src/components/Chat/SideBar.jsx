import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Sidebar = ({ contacts, onUserSelect }) => {
  return (
    <div className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl m-4 h-[95%] overflow-y-auto z-10">
      <div className="text-xl font-bold p-4 border-b bg-gradient-to-r from-blue-600 to-pink-500 text-white rounded-t-3xl flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
        Chats
      </div>
      {contacts.map((user) => (
        <div
          key={user._id}
          onClick={() => onUserSelect(user)}
          className="flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-blue-100/40 transition duration-200"
        >
          <img
            src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-blue-300"
          />
          <p className="text-gray-800 font-medium">{user.name}</p>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
