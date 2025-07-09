import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { Star, Users, UserPlus } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await API.get(`/users/${id}/profile`);
      setProfile(data);
    };
    fetchProfile();
  }, [id]);

  if (!profile) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;

  const { user, feedbacks, avgRating } = profile;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 font-sans">
      {/* 🧑 Profile Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-700 mb-1">{user.name}</h1>
          <p className="text-gray-600 text-sm mb-2">{user.email}</p>

          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold shadow-sm">
              <Users className="w-4 h-4" />
              Followers: {user.followers?.length || 0}
            </div>
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold shadow-sm">
              <UserPlus className="w-4 h-4" />
              Following: {user.following?.length || 0}
            </div>
          </div>

          <div className="mt-3 text-yellow-600 font-medium">
            {avgRating ? (
              <>
                ⭐ <strong>Average Rating:</strong> {avgRating}
              </>
            ) : (
              <span className="text-gray-500">No ratings yet</span>
            )}
          </div>
        </div>
      </div>

      {/* 💼 Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-green-700 mb-3">✅ Skills Offered</h2>
          <ul className="list-disc list-inside space-y-1 text-green-800">
            {user.skillsOffered.map((s, i) => (
              <li key={i}>{s.skill} ({s.level})</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-red-500">
          <h2 className="text-xl font-semibold text-red-700 mb-3">🎯 Skills Wanted</h2>
          <ul className="list-disc list-inside space-y-1 text-red-800">
            {user.skillsWanted.map((s, i) => (
              <li key={i}>{s.skill} ({s.level})</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 💬 Feedback Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-5">💬 Feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((f, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded border-l-4 border-blue-300 shadow-sm">
                <p className="font-semibold text-blue-800">From: {f.from}</p>
                <p className="text-yellow-600">
                  Rating: {f.rating} <Star className="inline h-4 w-4 text-yellow-400" />
                </p>
                <p className="text-gray-800">{f.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
