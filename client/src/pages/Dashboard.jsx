import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Stars from '../assets/stars.svg';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [skillsOffered, setSkillsOffered] = useState([{ skill: '', level: 'Beginner' }]);
  const [skillsWanted, setSkillsWanted] = useState([{ skill: '', level: 'Beginner' }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        if (data.skillsOffered?.length) setSkillsOffered(data.skillsOffered);
        if (data.skillsWanted?.length) setSkillsWanted(data.skillsWanted);
      } catch (err) {
        console.error('Failed to fetch user profile', err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (type, index, field, value) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated[index][field] = value;
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  };

  const addSkillRow = (type) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated.push({ skill: '', level: 'Beginner' });
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(
        '/users/skills',
        { skillsOffered, skillsWanted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Skills updated!');
    } catch (err) {
      alert('Failed to update skills');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-slate-100 px-4 py-10 pt-24 font-body text-slate-800">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none animate-pulse"
      />

      <div className="relative max-w-5xl mx-auto z-10 space-y-10">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 font-display drop-shadow-md">
          🌐 My Dashboard
        </h1>

        {/* 👤 Profile Section */}
        {user && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-indigo-100">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">👤 Profile</h2>
            <div className="grid md:grid-cols-2 gap-4 text-base">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Points:</strong> <span className="font-bold text-green-600">{user.points}</span></p>
              <p>
                <strong>Badge:</strong>{' '}
                <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm font-semibold">
                  {user.badge}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 🔗 Network Section */}
        {user && (
          <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl p-6 shadow-xl border border-indigo-100">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">🔗 My Network</h2>
            <div className="flex items-center justify-around text-lg font-medium text-slate-700">
              <div
                className="text-center cursor-pointer hover:underline"
                onClick={() => openModal('followers')}
              >
                <p className="text-indigo-600 text-2xl font-bold">{user.followers?.length || 0}</p>
                <p>Followers</p>
              </div>
              <div
                className="text-center cursor-pointer hover:underline"
                onClick={() => openModal('following')}
              >
                <p className="text-indigo-600 text-2xl font-bold">{user.following?.length || 0}</p>
                <p>Following</p>
              </div>
            </div>
          </div>
        )}

        {/* 🛠️ Skills Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-6 space-y-8 border border-indigo-100"
        >
          {/* Offered Skills */}
          <div>
            <h2 className="text-xl font-bold text-indigo-700 mb-2">💡 Skills You Can Teach</h2>
            {skillsOffered.map((item, index) => (
              <div key={index} className="flex gap-3 mb-2">
                <input
                  type="text"
                  placeholder="Skill"
                  className="w-2/3 border px-4 py-2 rounded-md focus:outline-indigo-400"
                  value={item.skill}
                  onChange={(e) => handleChange('offered', index, 'skill', e.target.value)}
                />
                <select
                  className="w-1/3 border px-2 py-2 rounded-md focus:outline-indigo-400"
                  value={item.level}
                  onChange={(e) => handleChange('offered', index, 'level', e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-indigo-600 underline hover:text-indigo-800"
              onClick={() => addSkillRow('offered')}
            >
              + Add Another Skill
            </button>
          </div>

          {/* Wanted Skills */}
          <div>
            <h2 className="text-xl font-bold text-indigo-700 mb-2">🔍 Skills You Want to Learn</h2>
            {skillsWanted.map((item, index) => (
              <div key={index} className="flex gap-3 mb-2">
                <input
                  type="text"
                  placeholder="Skill"
                  className="w-2/3 border px-4 py-2 rounded-md focus:outline-indigo-400"
                  value={item.skill}
                  onChange={(e) => handleChange('wanted', index, 'skill', e.target.value)}
                />
                <select
                  className="w-1/3 border px-2 py-2 rounded-md focus:outline-indigo-400"
                  value={item.level}
                  onChange={(e) => handleChange('wanted', index, 'level', e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-indigo-600 underline hover:text-indigo-800"
              onClick={() => addSkillRow('wanted')}
            >
              + Add Another Skill
            </button>
          </div>

          {/* Save Button */}
          <div className="text-right">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition font-semibold"
            >
              Save Skills
            </button>
          </div>
        </form>
      </div>

      {/* 🪟 Modal for Followers / Following */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl relative">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              {modalType === 'followers' ? '👥 Your Followers' : '➡️ You’re Following'}
            </h2>
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              ×
            </button>

            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {(modalType === 'followers' ? user.followers : user.following)?.map((u, idx) => (
                <li key={idx} className="border-b pb-2 flex justify-between items-center">
                  <div>
                    <Link
                      to={`/users/${u._id}/profile`}
                      className="font-medium text-indigo-600 hover:underline"
                      onClick={closeModal}
                    >
                      {u.name}
                    </Link>
                    <p className="text-sm text-slate-500">{u.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
