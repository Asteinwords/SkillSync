import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { Calendar, Clock, Link as LinkIcon, Star } from 'lucide-react';
import Stars from '../assets/stars.svg';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-6 py-16 font-sans overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <img
          src={Stars}
          alt="Stars"
          className="w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
        />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-12 z-10">
        {/* Schedule Form */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-300/50"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 mb-6 flex items-center justify-center gap-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="w-6 h-6 text-yellow-400 animate-bounce" />
            Schedule a Session
          </motion.h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.select
              name="recipient"
              value={form.recipient}
              onChange={handleChange}
              required
              className="col-span-1 md:col-span-2 border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            >
              <option value="">Select a user to learn from / teach</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </motion.select>

            <motion.input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            />
            <motion.input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            />
            <motion.input
              type="text"
              name="duration"
              placeholder="e.g., 1h"
              value={form.duration}
              onChange={handleChange}
              required
              className="border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            />
            <motion.input
              type="url"
              name="meetLink"
              placeholder="Google Meet link (optional)"
              value={form.meetLink}
              onChange={handleChange}
              className="border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            />
            <motion.input
              type="text"
              name="meetingId"
              placeholder="Meeting ID (optional)"
              value={form.meetingId}
              onChange={handleChange}
              className="border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            />
            <motion.input
              type="text"
              name="meetingPassword"
              placeholder="Meeting Password (optional)"
              value={form.meetingPassword}
              onChange={handleChange}
              className="border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            />
            <motion.textarea
              name="description"
              placeholder="Describe the session (topics, goals, etc.)"
              value={form.description}
              onChange={handleChange}
              className="col-span-1 md:col-span-2 border border-blue-300/50 bg-white/80 px-4 py-3 rounded-lg shadow-sm resize-none h-28 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              variants={itemVariants}
            />
            <motion.button
              type="submit"
              className="col-span-1 md:col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <span>📤 Send Request</span>
            </motion.button>
          </form>
        </motion.div>

        {/* Scheduled Sessions List */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-300/50"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 mb-6 flex items-center justify-center gap-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="w-6 h-6 text-yellow-400 animate-bounce" />
            Your Sessions
          </motion.h2>

          {sessions.length === 0 ? (
            <motion.p
              className="text-center text-gray-600 text-lg"
              variants={itemVariants}
            >
              No sessions scheduled yet.
            </motion.p>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {sessions.map((s, index) => {
                const role = s.requester._id === myId ? 'requester' : 'recipient';
                const feedback = role === 'requester' ? s.requesterFeedback : s.recipientFeedback;

                return (
                  <motion.div
                    key={s._id}
                    variants={itemVariants}
                    className={`flex flex-col py-4 px-6 rounded-2xl mb-4 transition-all duration-300 ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 shadow-lg border-l-4 border-yellow-400'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-100 to-gray-50 shadow-md border-l-4 border-gray-400'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-100 to-orange-50 shadow-md border-l-4 border-orange-400'
                        : 'bg-white/50 hover:bg-blue-50 hover:shadow-md border-l-4 border-blue-200'
                    }`}
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-blue-800">
                        With: {role === 'requester' ? s.recipient.name : s.requester.name}
                      </p>
                      <span className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                        {s.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-700">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-600" /> {s.date}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" /> {s.time}
                      </p>
                    </div>

                    {s.meetLink && (
                      <a
                        href={s.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Join Google Meet
                      </a>
                    )}

                    {s.meetingId && (
                      <p className="text-sm mt-2">
                        🔑 Meeting ID: <span className="font-semibold">{s.meetingId}</span>
                      </p>
                    )}
                    {s.meetingPassword && (
                      <p className="text-sm">
                        🔒 Password: <span className="font-semibold">{s.meetingPassword}</span>
                      </p>
                    )}

                    {feedback && feedback.rating ? (
                      <p className="mt-4 text-green-700 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        You rated: {feedback.rating} - "{feedback.comment}"
                      </p>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3">
                        <motion.select
                          value={feedbackForm.sessionId === s._id ? feedbackForm.rating : ''}
                          onChange={(e) =>
                            setFeedbackForm({
                              sessionId: s._id,
                              role,
                              rating: e.target.value,
                              comment: '',
                            })
                          }
                          className="border border-blue-300/50 bg-white/80 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                          required
                          variants={itemVariants}
                        >
                          <option value="">Rate this session</option>
                          {[1, 2, 3, 4, 5].map((r) => (
                            <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                          ))}
                        </motion.select>

                        <motion.textarea
                          placeholder="Write feedback"
                          className="border border-blue-300/50 bg-white/80 px-3 py-2 rounded-lg w-full resize-none h-20 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                          value={feedbackForm.sessionId === s._id ? feedbackForm.comment : ''}
                          onChange={(e) =>
                            setFeedbackForm((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          variants={itemVariants}
                        />

                        <motion.button
                          type="submit"
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Star className="w-4 h-4" />
                          Submit Feedback
                        </motion.button>
                      </form>
                    )}

                    {role === 'requester' && (
                      <motion.button
                        onClick={() => handleDeleteSession(s._id)}
                        className="text-red-600 text-sm mt-3 hover:text-red-800 transition"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        🗑️ Delete this session
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ScheduleSession;