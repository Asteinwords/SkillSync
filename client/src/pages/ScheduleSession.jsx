// import React, { useState, useEffect } from 'react';
// import API from '../services/api';
// import { Calendar, Clock, Link as LinkIcon, Star } from 'lucide-react';

// const ScheduleSession = () => {
//   const [users, setUsers] = useState([]);
//   const [form, setForm] = useState({
//     recipient: '',
//     date: '',
//     time: '',
//     duration: '',
//     description: '',
//     meetLink: '',
//     meetingId: '',
//     meetingPassword: '',
//   });
//   const [sessions, setSessions] = useState([]);
//   const [feedbackForm, setFeedbackForm] = useState({ sessionId: '', role: '', rating: '', comment: '' });

//   const token = localStorage.getItem('token');
//   const myId = localStorage.getItem('userId');

//   useEffect(() => {
//     const fetchUsersAndSessions = async () => {
//       try {
//         const usersRes = await API.get('/users/all', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(usersRes.data.filter(u => u._id !== myId));

//         const sessionsRes = await API.get('/sessions', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setSessions(sessionsRes.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchUsersAndSessions();
//   }, [token, myId]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await API.post('/sessions', form, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert('Session request sent!');
//       setForm({
//         recipient: '',
//         date: '',
//         time: '',
//         duration: '',
//         description: '',
//         meetLink: '',
//       });
//       const { data } = await API.get('/sessions', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSessions(data);
//     } catch (err) {
//       alert('Failed to schedule session');
//     }
//   };

//   const handleFeedbackSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await API.post('/sessions/feedback', feedbackForm, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       await API.put(`/sessions/${feedbackForm.sessionId}/status`, { status: 'done' }, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//       alert('Feedback submitted!');
//       setFeedbackForm({ sessionId: '', role: '', rating: '', comment: '' });
//       const { data } = await API.get('/sessions', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSessions(data);
//     } catch (err) {
//       alert('Failed to submit feedback');
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-12 font-sans">
//       {/* Schedule Form */}
//       <div className="bg-white rounded-xl shadow-lg p-8">
//         <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">📅 Schedule a Session</h2>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <select
//             name="recipient"
//             value={form.recipient}
//             onChange={handleChange}
//             required
//             className="col-span-1 md:col-span-2 border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//           >
//             <option value="">Select a user to learn from / teach</option>
//             {users.map((u) => (
//               <option key={u._id} value={u._id}>
//                 {u.name} ({u.email})
//               </option>
//             ))}
//           </select>

//           <input
//             type="date"
//             name="date"
//             value={form.date}
//             onChange={handleChange}
//             required
//             className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//           />

//           <input
//             type="time"
//             name="time"
//             value={form.time}
//             onChange={handleChange}
//             required
//             className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//           />

//           <input
//             type="text"
//             name="duration"
//             placeholder="e.g., 1h"
//             value={form.duration}
//             onChange={handleChange}
//             required
//             className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//           />

//           <input
//             type="url"
//             name="meetLink"
//             placeholder="Google Meet link (optional)"
//             value={form.meetLink}
//             onChange={handleChange}
//             className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//           />
//           <input
//   type="text"
//   name="meetingId"
//   placeholder="Meeting ID (optional)"
//   value={form.meetingId}
//   onChange={handleChange}
//   className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
// />

// <input
//   type="text"
//   name="meetingPassword"
//   placeholder="Meeting Password (optional)"
//   value={form.meetingPassword}
//   onChange={handleChange}
//   className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
// />


//           <textarea
//             name="description"
//             placeholder="Describe the session (topics, goals, etc.)"
//             value={form.description}
//             onChange={handleChange}
//             className="col-span-1 md:col-span-2 border border-gray-300 px-4 py-3 rounded-lg shadow-sm resize-none h-28 focus:ring-2 focus:ring-blue-400"
//           />

//           <button className="col-span-1 md:col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
//             📤 Send Request
//           </button>
//         </form>
//       </div>

//       {/* Scheduled Sessions List */}
//       <div className="bg-white rounded-xl shadow-lg p-8">
//         <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">📖 Your Sessions</h2>

//         {sessions.length === 0 ? (
//           <p className="text-gray-500 text-center">No sessions scheduled yet.</p>
//         ) : (
//           sessions.map((s) => {
//             const role = s.requester._id === myId ? 'requester' : 'recipient';
//             const feedback = role === 'requester' ? s.requesterFeedback : s.recipientFeedback;

//             return (
//               <div
//                 key={s._id}
//                 className="bg-gray-50 rounded-xl border border-gray-200 shadow p-5 mb-6 transition hover:shadow-md"
//               >
//                 <div className="flex justify-between items-center">
//                   <p className="font-semibold text-blue-800">
//                     With: {role === 'requester' ? s.recipient.name : s.requester.name}
//                   </p>
//                   <span className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
//                     {s.status}
//                   </span>
//                 </div>

//                 <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-700">
//                   <p className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {s.date}</p>
//                   <p className="flex items-center gap-1"><Clock className="w-4 h-4" /> {s.time}</p>
//                 </div>

//                 {s.meetLink && (
//                   <a
//                     href={s.meetLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
//                   >
//                     <LinkIcon className="w-4 h-4" />
//                     Join Google Meet
//                   </a>
//                 )}

//                 {feedback && feedback.rating ? (
//                   <p className="mt-4 text-green-700">
//                     ⭐ You rated: {feedback.rating} - "{feedback.comment}"
//                   </p>
//                 ) : (
//                   <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-2">
//                     <select
//                       value={feedbackForm.sessionId === s._id ? feedbackForm.rating : ''}
//                       onChange={(e) =>
//                         setFeedbackForm({
//                           sessionId: s._id,
//                           role,
//                           rating: e.target.value,
//                           comment: '',
//                         })
//                       }
//                       className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-yellow-400"
//                       required
//                     >
//                       <option value="">Rate this session</option>
//                       {[1, 2, 3, 4, 5].map((r) => (
//                         <option key={r} value={r}>{r} Star</option>
//                       ))}
//                     </select>

//                     <textarea
//                       placeholder="Write feedback"
//                       className="border px-3 py-2 rounded w-full resize-none h-20 focus:ring-2 focus:ring-yellow-400"
//                       value={feedbackForm.sessionId === s._id ? feedbackForm.comment : ''}
//                       onChange={(e) =>
//                         setFeedbackForm((prev) => ({
//                           ...prev,
//                           comment: e.target.value,
//                         }))
//                       }
//                     />

//                     <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
//                       Submit Feedback
//                     </button>
//                   </form>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default ScheduleSession;
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar, Clock, Link as LinkIcon } from 'lucide-react';

const ScheduleSession = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    recipient: '',
    date: '',
    time: '',
    duration: '',
    description: '',
    meetLink: '',
    meetingId: '',
    meetingPassword: '',
  });
  const [sessions, setSessions] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ sessionId: '', role: '', rating: '', comment: '' });

  const token = localStorage.getItem('token');
  const myId = localStorage.getItem('userId');

  const fetchUsersAndSessions = async () => {
    try {
      const usersRes = await API.get('/users/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersRes.data.filter(u => u._id !== myId));

      const sessionsRes = await API.get('/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsersAndSessions();
  }, [token, myId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/sessions', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Session request sent!');
      setForm({
        recipient: '',
        date: '',
        time: '',
        duration: '',
        description: '',
        meetLink: '',
        meetingId: '',
        meetingPassword: '',
      });
      fetchUsersAndSessions();
    } catch (err) {
      alert('Failed to schedule session');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/sessions/feedback', feedbackForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Automatically mark session as 'done'
      await API.put(`/sessions/${feedbackForm.sessionId}/status`, { status: 'done' }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Feedback submitted!');
      setFeedbackForm({ sessionId: '', role: '', rating: '', comment: '' });
      fetchUsersAndSessions();
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this session?');
    if (!confirmDelete) return;

    try {
      await API.delete(`/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Session deleted successfully');
      fetchUsersAndSessions();
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 font-sans">
      {/* Schedule Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">📅 Schedule a Session</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <select
            name="recipient"
            value={form.recipient}
            onChange={handleChange}
            required
            className="col-span-1 md:col-span-2 border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a user to learn from / teach</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          <input type="date" name="date" value={form.date} onChange={handleChange} required className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
          <input type="time" name="time" value={form.time} onChange={handleChange} required className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="duration" placeholder="e.g., 1h" value={form.duration} onChange={handleChange} required className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
          <input type="url" name="meetLink" placeholder="Google Meet link (optional)" value={form.meetLink} onChange={handleChange} className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="meetingId" placeholder="Meeting ID (optional)" value={form.meetingId} onChange={handleChange} className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="meetingPassword" placeholder="Meeting Password (optional)" value={form.meetingPassword} onChange={handleChange} className="border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />

          <textarea name="description" placeholder="Describe the session (topics, goals, etc.)" value={form.description} onChange={handleChange} className="col-span-1 md:col-span-2 border border-gray-300 px-4 py-3 rounded-lg shadow-sm resize-none h-28 focus:ring-2 focus:ring-blue-400" />

          <button className="col-span-1 md:col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            📤 Send Request
          </button>
        </form>
      </div>

      {/* Scheduled Sessions List */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">📖 Your Sessions</h2>

        {sessions.length === 0 ? (
          <p className="text-gray-500 text-center">No sessions scheduled yet.</p>
        ) : (
          sessions.map((s) => {
            const role = s.requester._id === myId ? 'requester' : 'recipient';
            const feedback = role === 'requester' ? s.requesterFeedback : s.recipientFeedback;

            return (
              <div key={s._id} className="bg-gray-50 rounded-xl border border-gray-200 shadow p-5 mb-6 transition hover:shadow-md">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-blue-800">
                    With: {role === 'requester' ? s.recipient.name : s.requester.name}
                  </p>
                  <span className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                    {s.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-700">
                  <p className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {s.date}</p>
                  <p className="flex items-center gap-1"><Clock className="w-4 h-4" /> {s.time}</p>
                </div>

                {s.meetLink && (
                  <a href={s.meetLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
                    <LinkIcon className="w-4 h-4" />
                    Join Google Meet
                  </a>
                )}

                {s.meetingId && <p className="text-sm mt-2">🔑 Meeting ID: <b>{s.meetingId}</b></p>}
                {s.meetingPassword && <p className="text-sm">🔒 Password: <b>{s.meetingPassword}</b></p>}

                {feedback && feedback.rating ? (
                  <p className="mt-4 text-green-700">
                    ⭐ You rated: {feedback.rating} - "{feedback.comment}"
                  </p>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-2">
                    <select
                      value={feedbackForm.sessionId === s._id ? feedbackForm.rating : ''}
                      onChange={(e) =>
                        setFeedbackForm({
                          sessionId: s._id,
                          role,
                          rating: e.target.value,
                          comment: '',
                        })
                      }
                      className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-yellow-400"
                      required
                    >
                      <option value="">Rate this session</option>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>{r} Star</option>
                      ))}
                    </select>

                    <textarea
                      placeholder="Write feedback"
                      className="border px-3 py-2 rounded w-full resize-none h-20 focus:ring-2 focus:ring-yellow-400"
                      value={feedbackForm.sessionId === s._id ? feedbackForm.comment : ''}
                      onChange={(e) =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                    />

                    <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                      Submit Feedback
                    </button>
                  </form>
                )}

                {role === 'requester' && (
                  <button
                    onClick={() => handleDeleteSession(s._id)}
                    className="text-red-600 text-sm mt-2 hover:underline"
                  >
                    🗑️ Delete this session
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScheduleSession;
