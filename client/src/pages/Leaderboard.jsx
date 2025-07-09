import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const badgeStyles = {
  Beginner: 'bg-gray-200 text-gray-700',
  Contributor: 'bg-blue-200 text-blue-700',
  Mentor: 'bg-purple-200 text-purple-700',
  Expert: 'bg-yellow-200 text-yellow-800',
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get('/users/top-users');
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 flex items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
        Leaderboard
      </h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 border border-indigo-100">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          users.map((user, index) => (
            <div
              key={user._id}
              className={`flex items-center justify-between py-3 px-2 rounded-lg mb-2 ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 shadow-lg'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-100 to-white'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-100 to-white'
                  : 'hover:bg-indigo-50 transition'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-indigo-700 w-8">#{index + 1}</span>
                <div className="truncate">
                  <Link
                    to={`/users/${user._id}/profile`}
                    className="font-semibold text-blue-700 hover:underline block"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-green-600">{user.points} pts</p>
                <span
                  className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    badgeStyles[user.badge] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {user.badge}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
