// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import API from '../services/api';
// import Stars from '../assets/stars.svg';
// import toast from 'react-hot-toast';

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const [skillsOffered, setSkillsOffered] = useState([{ skill: '', level: 'Beginner' }]);
//   const [skillsWanted, setSkillsWanted] = useState([{ skill: '', level: 'Beginner' }]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const { data } = await API.get('/users/me', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser(data);
//         if (data.skillsOffered?.length) setSkillsOffered(data.skillsOffered);
//         if (data.skillsWanted?.length) setSkillsWanted(data.skillsWanted);
//       } catch (err) {
//         toast.error('Failed to fetch profile');
//         console.error(err);
//       }
//     };
//     fetchProfile();
//   }, [token]);

//   const handleChange = (type, index, field, value) => {
//     const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
//     updated[index][field] = value;
//     type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
//   };

//   const addSkillRow = (type) => {
//     const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
//     updated.push({ skill: '', level: 'Beginner' });
//     type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
//   };

//   const deleteSkillRow = (type, index) => {
//     const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
//     updated.splice(index, 1);
//     type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const isValid = [...skillsOffered, ...skillsWanted].every(item => item.skill.trim() !== '');
//     if (!isValid) {
//       toast.error('Please fill all skill names before saving');
//       return;
//     }

//     try {
//       await API.put(
//         '/users/skills',
//         { skillsOffered, skillsWanted },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success('✅ Skills updated successfully!');
//     } catch (err) {
//       toast.error('❌ Failed to update skills');
//       console.error(err);
//     }
//   };

//   const openModal = (type) => {
//     setModalType(type);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setModalType('');
//   };

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-slate-100 px-4 py-10 pt-24 font-body text-slate-800">
//       <img
//         src={Stars}
//         alt="Stars"
//         className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none animate-pulse"
//       />

//       <div className="relative max-w-5xl mx-auto z-10 space-y-10">
//         <h1 className="text-4xl font-extrabold text-center text-indigo-700 font-display drop-shadow-md">
//           🌐 My Dashboard
//         </h1>

//         {/* 👤 Profile */}
//         {user && (
//           <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-indigo-100">
//             <h2 className="text-2xl font-semibold text-indigo-700 mb-4">👤 Profile</h2>
//             <div className="grid md:grid-cols-2 gap-4 text-base">
//               <p><strong>Name:</strong> {user.name}</p>
//               <p><strong>Email:</strong> {user.email}</p>
//               <p><strong>Points:</strong> <span className="font-bold text-green-600">{user.points}</span></p>
//               <p>
//                 <strong>Badge:</strong>{' '}
//                 <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm font-semibold">
//                   {user.badge}
//                 </span>
//               </p>
//             </div>
//           </div>
//         )}

//         {/* 🔗 My Network */}
//         {user && (
//           <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl p-6 shadow-xl border border-indigo-100">
//             <h2 className="text-2xl font-semibold text-indigo-700 mb-3">🔗 My Network</h2>
//             <div className="flex items-center justify-around text-lg font-medium text-slate-700">
//               <div className="text-center cursor-pointer hover:underline" onClick={() => openModal('followers')}>
//                 <p className="text-indigo-600 text-2xl font-bold">{user.followers?.length || 0}</p>
//                 <p>Followers</p>
//               </div>
//               <div className="text-center cursor-pointer hover:underline" onClick={() => openModal('following')}>
//                 <p className="text-indigo-600 text-2xl font-bold">{user.following?.length || 0}</p>
//                 <p>Following</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 🛠️ Skills Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-6 space-y-8 border border-indigo-100"
//         >
//           {/* Teach Skills */}
//           <div>
//             <h2 className="text-xl font-bold text-indigo-700 mb-2">💡 Skills You Can Teach</h2>
//             {skillsOffered.map((item, index) => (
//               <div key={index} className="flex gap-3 mb-2 items-center">
//                 <input
//                   type="text"
//                   placeholder="Skill"
//                   className="w-2/3 border px-4 py-2 rounded-md focus:outline-indigo-400"
//                   value={item.skill}
//                   onChange={(e) => handleChange('offered', index, 'skill', e.target.value)}
//                   required
//                 />
//                 <select
//                   className="w-1/3 border px-2 py-2 rounded-md focus:outline-indigo-400"
//                   value={item.level}
//                   onChange={(e) => handleChange('offered', index, 'level', e.target.value)}
//                 >
//                   <option>Beginner</option>
//                   <option>Intermediate</option>
//                   <option>Expert</option>
//                 </select>
//                 <button
//                   type="button"
//                   onClick={() => deleteSkillRow('offered', index)}
//                   className="text-red-500 text-xl font-bold"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//             <button type="button" className="text-sm text-indigo-600 underline hover:text-indigo-800" onClick={() => addSkillRow('offered')}>
//               + Add Another Skill
//             </button>
//           </div>

//           {/* Learn Skills */}
//           <div>
//             <h2 className="text-xl font-bold text-indigo-700 mb-2">🔍 Skills You Want to Learn</h2>
//             {skillsWanted.map((item, index) => (
//               <div key={index} className="flex gap-3 mb-2 items-center">
//                 <input
//                   type="text"
//                   placeholder="Skill"
//                   className="w-2/3 border px-4 py-2 rounded-md focus:outline-indigo-400"
//                   value={item.skill}
//                   onChange={(e) => handleChange('wanted', index, 'skill', e.target.value)}
//                   required
//                 />
//                 <select
//                   className="w-1/3 border px-2 py-2 rounded-md focus:outline-indigo-400"
//                   value={item.level}
//                   onChange={(e) => handleChange('wanted', index, 'level', e.target.value)}
//                 >
//                   <option>Beginner</option>
//                   <option>Intermediate</option>
//                   <option>Expert</option>
//                 </select>
//                 <button
//                   type="button"
//                   onClick={() => deleteSkillRow('wanted', index)}
//                   className="text-red-500 text-xl font-bold"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//             <button type="button" className="text-sm text-indigo-600 underline hover:text-indigo-800" onClick={() => addSkillRow('wanted')}>
//               + Add Another Skill
//             </button>
//           </div>

//           <div className="text-right">
//             <button
//               type="submit"
//               className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition font-semibold"
//             >
//               Save Skills
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Modal: Followers/Following */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl relative">
//             <h2 className="text-xl font-semibold text-indigo-700 mb-4">
//               {modalType === 'followers' ? '👥 Your Followers' : '➡️ You’re Following'}
//             </h2>
//             <button
//               onClick={closeModal}
//               className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
//             >
//               ×
//             </button>

//             <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
//               {(modalType === 'followers' ? user.followers : user.following)?.map((u, idx) => (
//                 <li key={idx} className="border-b pb-2 flex justify-between items-center">
//                   <div>
//                     <Link
//                       to={`/users/${u._id}/profile`}
//                       className="font-medium text-indigo-600 hover:underline"
//                       onClick={closeModal}
//                     >
//                       {u.name}
//                     </Link>
//                     <p className="text-sm text-slate-500">{u.email}</p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Stars from '../assets/stars.svg';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [skillsOffered, setSkillsOffered] = useState([{ skill: '', level: 'Beginner' }]);
  const [skillsWanted, setSkillsWanted] = useState([{ skill: '', level: 'Beginner' }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [aboutMe, setAboutMe] = useState('');
const [education, setEducation] = useState([{ degree: '', institute: '', year: '' }]);

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
        setAboutMe(data.aboutMe || '');
        if (data.education?.length) setEducation(data.education);

      } catch (err) {
        toast.error('Failed to fetch profile');
        console.error(err);
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

  const deleteSkillRow = (type, index) => {
    const updated = [...(type === 'offered' ? skillsOffered : skillsWanted)];
    updated.splice(index, 1);
    type === 'offered' ? setSkillsOffered(updated) : setSkillsWanted(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = [...skillsOffered, ...skillsWanted].every(item => item.skill.trim() !== '');
    if (!isValid) {
      toast.error('Please fill all skill names before saving');
      return;
    }

    try {
      await API.put(
        '/users/skills',
        { skillsOffered, skillsWanted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ Skills updated successfully!');
    } catch (err) {
      toast.error('❌ Failed to update skills');
      console.error(err);
    }
  };
  const handleProfileInfoSubmit = async (e) => {
  e.preventDefault();

  try {
    await API.put(
      '/users/profile-info',
      { aboutMe, education },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success('🎉 Profile info updated!');
  } catch (err) {
    toast.error('❌ Failed to update profile info');
    console.error(err);
  }
};


  const handleImageUpload = async (file) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await API.put(
          '/users/profile-image',
          { image: reader.result },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(data);
        toast.success('Profile image updated!');
      } catch {
        toast.error('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };
const handleEducationChange = (index, field, value) => {
  const updated = [...education];
  updated[index][field] = value;
  setEducation(updated);
};

const addEducationRow = () => {
  setEducation([...education, { degree: '', institute: '', year: '' }]);
};

const deleteEducationRow = (index) => {
  const updated = [...education];
  updated.splice(index, 1);
  setEducation(updated);
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

        {/* 👤 Profile */}
        {user && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-indigo-100">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">👤 Profile</h2>

            {/* Profile Photo Upload */}
            <div className="mb-4 text-center">
              <img
                src={user?.profileImage || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.name}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto shadow-md border"
              />
              <div className="mt-2 space-x-2 flex justify-center flex-wrap">
                {/* File Upload */}
                <label className="text-sm cursor-pointer text-blue-600 hover:underline">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                  />
                </label>

                {/* Avatar Picker */}
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Choose Avatar
                </button>
              </div>
            </div>

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

        {/* 🔗 Network */}
        {user && (
          <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl p-6 shadow-xl border border-indigo-100">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">🔗 My Network</h2>
            <div className="flex items-center justify-around text-lg font-medium text-slate-700">
              <div className="text-center cursor-pointer hover:underline" onClick={() => setModalType('followers') || setIsModalOpen(true)}>
                <p className="text-indigo-600 text-2xl font-bold">{user.followers?.length || 0}</p>
                <p>Followers</p>
              </div>
              <div className="text-center cursor-pointer hover:underline" onClick={() => setModalType('following') || setIsModalOpen(true)}>
                <p className="text-indigo-600 text-2xl font-bold">{user.following?.length || 0}</p>
                <p>Following</p>
              </div>
            </div>
          </div>
        )}

<form
  onSubmit={handleProfileInfoSubmit}
  className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-indigo-100 space-y-6"
>
  <h2 className="text-2xl font-semibold text-indigo-700">📝 About Me & Education</h2>

  {/* 🧠 About Me */}
  <div>
    <label className="block text-slate-700 font-medium mb-2">About Me</label>
    <textarea
      rows={4}
      value={aboutMe}
      onChange={(e) => setAboutMe(e.target.value)}
      placeholder="Write a short bio about your skills, goals or interests..."
      className="w-full border px-4 py-2 rounded-md focus:outline-indigo-400"
    />
  </div>

  {/* 🎓 Education */}
  <div>
    <label className="block text-slate-700 font-medium mb-2">Education</label>
    {education.map((edu, index) => (
      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-center">
        <input
          type="text"
          placeholder="Degree"
          className="border px-3 py-2 rounded-md focus:outline-indigo-400"
          value={edu.degree}
          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
        />
        <input
          type="text"
          placeholder="Institute"
          className="border px-3 py-2 rounded-md focus:outline-indigo-400"
          value={edu.institute}
          onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Year"
            className="border px-3 py-2 rounded-md w-full focus:outline-indigo-400"
            value={edu.year}
            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
          />
          <button
            type="button"
            onClick={() => deleteEducationRow(index)}
            className="text-red-500 text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>
    ))}
    <button
      type="button"
      onClick={addEducationRow}
      className="text-sm text-indigo-600 hover:underline"
    >
      + Add More
    </button>
  </div>

  {/* Save Button */}
  <div className="text-right">
    <button
      type="submit"
      className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition font-semibold"
    >
      Save Profile Info
    </button>
  </div>
</form>

        {/* 🛠️ Skills Form */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-6 space-y-8 border border-indigo-100">
          {/* Teach */}
          <div>
            <h2 className="text-xl font-bold text-indigo-700 mb-2">💡 Skills You Can Teach</h2>
            {skillsOffered.map((item, index) => (
              <div key={index} className="flex gap-3 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Skill"
                  className="w-2/3 border px-4 py-2 rounded-md focus:outline-indigo-400"
                  value={item.skill}
                  onChange={(e) => handleChange('offered', index, 'skill', e.target.value)}
                  required
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
                <button
                  type="button"
                  onClick={() => deleteSkillRow('offered', index)}
                  className="text-red-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="text-sm text-indigo-600 underline hover:text-indigo-800" onClick={() => addSkillRow('offered')}>
              + Add Another Skill
            </button>
          </div>

          {/* Learn */}
          <div>
            <h2 className="text-xl font-bold text-indigo-700 mb-2">🔍 Skills You Want to Learn</h2>
            {skillsWanted.map((item, index) => (
              <div key={index} className="flex gap-3 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Skill"
                  className="w-2/3 border px-4 py-2 rounded-md focus:outline-indigo-400"
                  value={item.skill}
                  onChange={(e) => handleChange('wanted', index, 'skill', e.target.value)}
                  required
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
                <button
                  type="button"
                  onClick={() => deleteSkillRow('wanted', index)}
                  className="text-red-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="text-sm text-indigo-600 underline hover:text-indigo-800" onClick={() => addSkillRow('wanted')}>
              + Add Another Skill
            </button>
          </div>

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

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700 text-center">Choose an Avatar</h3>
            <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {Array.from({ length: 12 }).map((_, idx) => {
                const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=Avatar${idx}`;
                return (
                  <img
                    key={idx}
                    src={avatarUrl}
                    alt="avatar"
                    onClick={async () => {
                      try {
                        const { data } = await API.put(
                          '/users/profile-image',
                          { image: avatarUrl },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setUser(data);
                        toast.success('Avatar selected!');
                        setShowAvatarPicker(false);
                      } catch {
                        toast.error('Failed to select avatar');
                      }
                    }}
                    className="w-16 h-16 rounded-full cursor-pointer border hover:ring-2 hover:ring-indigo-400 transition"
                  />
                );
              })}
            </div>
            <button
              className="mt-4 block mx-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              onClick={() => setShowAvatarPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Followers/Following Modal */}
      {isModalOpen && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl relative">
      <h2 className="text-xl font-semibold text-indigo-700 mb-4">
        {modalType === 'followers' ? '👥 Your Followers' : '➡️ You’re Following'}
      </h2>
      <button
        onClick={() => setIsModalOpen(false)}
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
                onClick={() => setIsModalOpen(false)}
              >
                {u.name}
              </Link>
              <p className="text-sm text-slate-500">{u.email}</p>
            </div>

            {/* Unfollow Button only if modalType is 'following' */}
            {modalType === 'following' && (
              <button
                onClick={async () => {
                  try {
                    await API.delete(`/users/unfollow/${u._id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const updatedFollowing = user.following.filter(f => f._id !== u._id);
                    setUser(prev => ({ ...prev, following: updatedFollowing }));
                    toast.success(`Unfollowed ${u.name}`);
                  } catch {
                    toast.error('Failed to unfollow');
                  }
                }}
                className="text-sm text-red-500 hover:underline font-medium"
              >
                Unfollow
              </button>
            )}
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
