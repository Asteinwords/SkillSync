// import React, { useEffect, useState } from 'react';
// import API from '../services/api';
// import { useNavigate } from 'react-router-dom';
// import { UserPlus, MessageCircle, Eye } from 'lucide-react';

// const Matches = () => {
//   const [matches, setMatches] = useState([]);
//   const [follows, setFollows] = useState({});
//   const [mutuals, setMutuals] = useState({});
//   const token = localStorage.getItem('token');
//   const senderId = localStorage.getItem('userId');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchMatches = async () => {
//       try {
//         const { data } = await API.get('/users/matches', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMatches(data);

//         const res = await API.get('/users/follow-status', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setFollows(res.data.follows);
//         setMutuals(res.data.mutuals);
//       } catch (err) {
//         console.error('Error fetching matches:', err);
//       }
//     };

//     fetchMatches();
//   }, [token]);

//   const sendFollowRequest = async (targetId) => {
//     try {
//       await API.post(
//         '/users/follow',
//         { targetId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert('Follow request sent!');
//       setFollows((prev) => ({ ...prev, [targetId]: true }));
//     } catch {
//       alert('Failed to send follow request');
//     }
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto font-sans">
//       <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">🔗 Skill Matches</h1>

//       {matches.length === 0 ? (
//         <p className="text-gray-600 text-center">No mutual matches found yet. Add more skills!</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
//           {matches.map((user) => (
//             <div
//               key={user._id}
//               className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200 hover:shadow-2xl transition-all"
//             >
//               <div className="mb-2">
//                 <h2 className="text-xl font-bold text-indigo-700">{user.name}</h2>
//                 <p className="text-sm text-gray-500">{user.email}</p>
//               </div>

//               <div className="mt-3 mb-2">
//                 <h3 className="font-semibold text-green-700 text-sm mb-1">🎓 Can Teach</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {user.skillsOffered.map((s, idx) => (
//                     <span
//                       key={idx}
//                       className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
//                     >
//                       {s.skill} ({s.level})
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="mt-3 mb-4">
//                 <h3 className="font-semibold text-red-700 text-sm mb-1">📚 Wants to Learn</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {user.skillsWanted.map((s, idx) => (
//                     <span
//                       key={idx}
//                       className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium"
//                     >
//                       {s.skill} ({s.level})
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex flex-wrap justify-between items-center gap-3 mt-5">
//                 {mutuals[user._id] ? (
//                   <button
//                     onClick={() =>
//                       navigate('/chat', {
//                         state: {
//                           senderId,
//                           receiverId: user._id,
//                           receiverName: user.name,
//                         },
//                       })
//                     }
//                     className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md transition"
//                   >
//                     <MessageCircle className="w-4 h-4" /> Chat
//                   </button>
//                 ) : follows[user._id] ? (
//                   <button
//                     disabled
//                     className="bg-yellow-400 text-black px-4 py-2 text-sm rounded-md cursor-not-allowed"
//                   >
//                     Request Sent
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => sendFollowRequest(user._id)}
//                     className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded-md transition"
//                   >
//                     <UserPlus className="w-4 h-4" /> Follow
//                   </button>
//                 )}

//                 <button
//                   onClick={() => navigate(`/users/${user._id}/profile`)}
//                   className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md transition"
//                 >
//                   <Eye className="w-4 h-4" /> Profile
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Matches;
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { UserPlus, MessageCircle, Eye } from 'lucide-react';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [follows, setFollows] = useState({});
  const [mutuals, setMutuals] = useState({});
  const [skill, setSkill] = useState('');
  const [type, setType] = useState('offered');
  const [level, setLevel] = useState('');
  const [badge, setBadge] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const senderId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data } = await API.get('/users/matches', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(data);

        const res = await API.get('/users/follow-status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollows(res.data.follows);
        setMutuals(res.data.mutuals);
      } catch (err) {
        console.error('Error fetching matches or follow status:', err);
      }
    };
    fetchMatches();
  }, [token]);

  const sendFollowRequest = async (targetId) => {
    try {
      await API.post('/users/follow', { targetId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Follow request sent!');
      setFollows((prev) => ({ ...prev, [targetId]: true }));
    } catch {
      alert('Failed to send follow request');
    }
  };

  const search = async () => {
    setError(null);
    if (!skill.trim()) return setError('Please enter a skill to search.');
    setLoading(true);
    setResults([]);

    try {
      const { data } = await API.get('/users/search', {
        params: {
          skill: skill.trim(),
          type,
          level: level || undefined,
          badge: badge || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans space-y-12">
      {/* Matches Section */}
      <section>
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">🔗 Mutual Skill Matches</h1>
        {matches.length === 0 ? (
          <p className="text-gray-600 text-center">No mutual matches found yet. Add more skills!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {matches.map((user) => (
              <div key={user._id} className="bg-white rounded-2xl shadow-xl p-5 border hover:shadow-2xl transition">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-indigo-700">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <div className="mt-3 mb-2">
                  <h3 className="font-semibold text-green-700 text-sm mb-1">🎓 Can Teach</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((s, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {s.skill} ({s.level})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 mb-4">
                  <h3 className="font-semibold text-red-700 text-sm mb-1">📚 Wants to Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((s, idx) => (
                      <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        {s.skill} ({s.level})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 gap-3">
                  {mutuals[user._id] ? (
                    <button
                      onClick={() => navigate('/chat', {
                        state: { senderId, receiverId: user._id, receiverName: user.name },
                      })}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md"
                    >
                      <MessageCircle size={16} /> Chat
                    </button>
                  ) : follows[user._id] ? (
                    <button disabled className="bg-yellow-400 text-black px-4 py-2 text-sm rounded-md cursor-not-allowed">
                      Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={() => sendFollowRequest(user._id)}
                      className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded-md"
                    >
                      <UserPlus size={16} /> Follow
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/users/${user._id}/profile`)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md"
                  >
                    <Eye size={16} /> Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Search Section */}
      <section>
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">🔍 Find Skill Partners</h2>

        <div className="bg-white shadow rounded p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Skill..."
            className="p-2 border border-gray-300 rounded"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
            <option value="offered">Offering</option>
            <option value="wanted">Looking For</option>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="p-2 border rounded">
            <option value="">Any Level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>
          <select value={badge} onChange={(e) => setBadge(e.target.value)} className="p-2 border rounded">
            <option value="">Any Badge</option>
            <option>Beginner</option>
            <option>Contributor</option>
            <option>Mentor</option>
            <option>Expert</option>
          </select>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          onClick={search}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition mb-8"
        >
          🔍 Search
        </button>

        {loading && <p className="text-center text-gray-600">Loading...</p>}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.length > 0 ? results.map((user) => (
            <li key={user._id} className="p-5 bg-white border rounded-lg shadow hover:shadow-md transition">
              <div onClick={() => navigate(`/users/${user._id}/profile`)} className="text-xl font-semibold text-indigo-700 hover:underline cursor-pointer">
                {user.name}
              </div>
              <p className="text-sm text-gray-500 mb-3">{user.email}</p>

              <div className="mb-3">
                <p className="text-sm font-medium text-green-600 mb-1">✅ Skills Offered:</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                  {user.skillsOffered?.length > 0 ? (
                    user.skillsOffered.map((s, i) => (
                      <span key={i} className="bg-green-100 px-2 py-1 rounded">{s.skill} ({s.level})</span>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-red-600 mb-1">🎯 Skills Wanted:</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                  {user.skillsWanted?.length > 0 ? (
                    user.skillsWanted.map((s, i) => (
                      <span key={i} className="bg-red-100 px-2 py-1 rounded">{s.skill} ({s.level})</span>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {mutuals[user._id] ? (
                  <button
                    onClick={() => navigate('/chat', {
                      state: { receiverId: user._id },
                      // state: { senderId, receiverId: user._id, receiverName: user.name },
                    })}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded"
                  >
                    <MessageCircle size={16} /> Chat
                  </button>
                ) : follows[user._id] ? (
                  <button disabled className="bg-yellow-300 text-black px-4 py-2 text-sm rounded cursor-not-allowed">
                    Request Sent
                  </button>
                ) : (
                  <button
                    onClick={() => sendFollowRequest(user._id)}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm rounded"
                  >
                    <UserPlus size={16} /> Follow
                  </button>
                )}

                <button
                  onClick={() => navigate(`/users/${user._id}/profile`)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded"
                >
                  <Eye size={16} /> View Profile
                </button>
              </div>
            </li>
          )) : (
            !loading && <li className="text-gray-600">No users found.</li>
          )}
        </ul>
      </section>
    </div>
  );
};

export default Matches;
