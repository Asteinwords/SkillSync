import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Calendar, Clock, Link as LinkIcon, Star, CheckCircle, Check, Trash2, Send } from 'lucide-react';
import Stars from '../assets/stars.svg';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
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

// Memoized session card component
const SessionCard = memo(({ session, index, myId, handleJoinMeeting, handleAcceptSession, handleMarkDone, handleDeleteSession, canMarkDone }) => {
  const role = session.requester?._id === myId ? 'requester' : 'recipient';
  const userJoinTime = role === 'requester' ? session.pastRoom?.requesterJoinTime : session.pastRoom?.recipientJoinTime;
  console.log(`[${new Date().toISOString()}] Rendering session:`, {
    sessionId: session._id,
    role,
    status: session.status,
    date: session.date,
    time: session.time,
    canMarkDone: canMarkDone(session),
    userJoinTime,
    pastRoom: session.pastRoom,
    requester: session.requester,
    recipient: session.recipient,
    handleMarkDoneDefined: !!handleMarkDone // Log to confirm prop
  });

  // Skip rendering if data is missing
  if (!session.requester || !session.recipient || !session.requester.name || !session.recipient.name) {
    console.warn(`[${new Date().toISOString()}] Skipping session due to missing requester/recipient data:`, { sessionId: session._id, requester: session.requester, recipient: session.recipient });
    return null;
  }

  // Defensive check for handleMarkDone
  if (!handleMarkDone) {
    console.error(`[${new Date().toISOString()}] handleMarkDone is not defined for session: ${session._id}`);
  }

  return (
    <motion.div
      key={session._id}
      variants={itemVariants}
      className={`flex flex-col py-4 px-6 rounded-xl mb-4 transition-all duration-300 shadow-md ${
        index === 0
          ? 'bg-gradient-to-r from-yellow-50 to-teal-50 border-l-4 border-teal-400'
          : index === 1
          ? 'bg-gradient-to-r from-blue-50 to-gray-50 border-l-4 border-blue-400'
          : index === 2
          ? 'bg-gradient-to-r from-purple-50 to-teal-50 border-l-4 border-purple-400'
          : 'bg-white/90 hover:bg-teal-50/50 border-l-4 border-teal-200'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-teal-800 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center text-teal-600 font-bold">
            {(role === 'requester' ? session.recipient.name[0] : session.requester.name[0]) || '?'}
          </span>
          With: {role === 'requester' ? session.recipient.name : session.requester.name}
        </p>
        <span className="text-sm bg-teal-100 text-teal-600 px-3 py-1 rounded-full font-medium">
          {session.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" /> {session.date}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" /> {session.time} - {session.endTime}
        </p>
      </div>

      {session.meetLink && session.status !== 'done' && (
        <button
          onClick={() => handleJoinMeeting(session)}
          className="mt-3 inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-medium"
        >
          <LinkIcon className="w-4 h-4" />
          Join Google Meet
        </button>
      )}

      {session.meetingId && (
        <p className="text-sm mt-2 flex items-center gap-2">
          <span className="text-teal-600">🔑</span> Meeting ID: <span className="font-semibold">{session.meetingId}</span>
        </p>
      )}
      {session.meetingPassword && (
        <p className="text-sm mt-1 flex items-center gap-2">
          <span className="text-teal-600">🔒</span> Password: <span className="font-semibold">{session.meetingPassword}</span>
        </p>
      )}

      {userJoinTime && (
        <p className="text-sm mt-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" /> Joined at: <span className="font-semibold">{userJoinTime}</span>
        </p>
      )}

      {role === 'recipient' && session.status === 'pending' && (
        <motion.button
          onClick={() => handleAcceptSession(session._id)}
          className="text-teal-600 text-sm mt-3 hover:text-teal-800 transition flex items-center gap-2 font-medium"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Check className="w-4 h-4" />
          Accept Session
        </motion.button>
      )}

      {canMarkDone(session) && handleMarkDone && (
        <motion.button
          onClick={() => handleMarkDone(session._id)}
          className="text-green-600 text-sm mt-3 hover:text-green-800 transition flex items-center gap-2 font-medium"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle className="w-4 h-4" />
          Mark as Done
        </motion.button>
      )}

      {role === 'requester' && session.status !== 'done' && (
        <motion.button
          onClick={() => handleDeleteSession(session._id)}
          className="text-red-600 text-sm mt-3 hover:text-red-800 transition flex items-center gap-2 font-medium"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Trash2 className="w-4 h-4" />
          Delete Session
        </motion.button>
      )}
    </motion.div>
  );
});

// Memoized past room card component
const PastRoomCard = memo(({ session, index, myId, handleFeedbackSubmit, feedbackForm, setFeedbackForm }) => {
  const role = session.requester?._id === myId ? 'requester' : 'recipient';
  const feedback = role === 'requester' ? session.requesterFeedback : session.recipientFeedback;
  const userJoinTime = role === 'requester' ? session.pastRoom?.requesterJoinTime : session.pastRoom?.recipientJoinTime;
  const userLeaveTime = role === 'requester' ? session.pastRoom?.requesterLeaveTime : session.pastRoom?.recipientLeaveTime;
  console.log(`[${new Date().toISOString()}] Rendering past room:`, {
    sessionId: session._id,
    role,
    hasFeedback: !!feedback,
    pastRoom: session.pastRoom,
    userJoinTime,
    userLeaveTime,
    hostName: session.pastRoom?.hostName,
    participantName: session.pastRoom?.participantName
  });

  // Skip rendering if pastRoom or required fields are missing
  if (!session.pastRoom || !session.pastRoom.hostName || !session.pastRoom.participantName) {
    console.warn(`[${new Date().toISOString()}] Skipping past room due to missing data:`, { sessionId: session._id, pastRoom: session.pastRoom });
    return null;
  }

  return (
    <motion.div
      key={session._id}
      variants={itemVariants}
      className="flex flex-col py-4 px-6 rounded-xl mb-4 bg-gradient-to-r from-teal-50 to-blue-50 shadow-md border-l-4 border-teal-400 transition-all duration-300"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-teal-800 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center text-teal-600 font-bold">
            {session.pastRoom.hostName[0] || '?'}
          </span>
          Host: {session.pastRoom.hostName} | Participant: {session.pastRoom.participantName}
        </p>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Your Join: {userJoinTime || 'Not joined'} | Your Leave: {userLeaveTime || 'Not marked'}
      </p>
      {feedback && feedback.rating ? (
        <p className="mt-4 text-teal-700 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          You rated: {feedback.rating} - "{feedback.comment}"
        </p>
      ) : (
        <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3">
          <motion.select
            value={feedbackForm.sessionId === session._id ? feedbackForm.rating : ''}
            onChange={(e) =>
              setFeedbackForm({
                sessionId: session._id,
                role,
                rating: e.target.value,
                comment: feedbackForm.sessionId === session._id ? feedbackForm.comment : '',
              })
            }
            className="border border-teal-200/50 bg-white/90 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
            required
            variants={itemVariants}
          >
            <option value="">Rate this session</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
            ))}
          </motion.select>

          <motion.textarea
            placeholder="Write your feedback..."
            className="border border-teal-200/50 bg-white/90 px-3 py-2 rounded-lg w-full resize-none h-20 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
            value={feedbackForm.sessionId === session._id ? feedbackForm.comment : ''}
            onChange={(e) =>
              setFeedbackForm((prev) => ({
                ...prev,
                sessionId: session._id,
                role,
                comment: e.target.value,
              }))
            }
            variants={itemVariants}
          />

          <motion.button
            type="submit"
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition flex items-center gap-2 shadow-sm"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Star className="w-5 h-5" />
            Submit Feedback
          </motion.button>
        </form>
      )}
    </motion.div>
  );
});

const ScheduleSession = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    recipient: '',
    date: '',
    time: '',
    endTime: '',
    duration: '',
    description: '',
    meetLink: '',
    meetingId: '',
    meetingPassword: '',
  });
  const [sessions, setSessions] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ sessionId: '', role: '', rating: '', comment: '' });
  const [currentTime, setCurrentTime] = useState(new Date());

  const token = localStorage.getItem('token');
  const myId = localStorage.getItem('userId');

  // Update current time every second for real-time checks
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] Starting current time interval`);
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      console.log(`[${now.toISOString()}] Updated current time: ${now.toTimeString()}`);
    }, 1000);
    return () => {
      console.log(`[${new Date().toISOString()}] Clearing current time interval`);
      clearInterval(interval);
    };
  }, []);

  const fetchUsersAndSessions = async () => {
    console.log(`[${new Date().toISOString()}] Fetching users and sessions for userId: ${myId}`);
    try {
      const usersRes = await API.get('/users/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Fetched ${usersRes.data.length} users:`, usersRes.data.map(u => ({ id: u._id, name: u.name, email: u.email })));
      setUsers(usersRes.data.filter(u => u._id !== myId));
      console.log(`[${new Date().toISOString()}] Filtered users (excluding self): ${usersRes.data.filter(u => u._id !== myId).length}`);

      const sessionsRes = await API.get('/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Fetched ${sessionsRes.data.length} sessions:`, sessionsRes.data.map(s => ({ id: s._id, status: s.status, date: s.date, time: s.time, pastRoom: s.pastRoom, requester: s.requester, recipient: s.recipient })));
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error fetching users/sessions:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] Initializing fetchUsersAndSessions interval`);
    fetchUsersAndSessions();
    const interval = setInterval(() => {
      console.log(`[${new Date().toISOString()}] Refreshing users and sessions`);
      fetchUsersAndSessions();
    }, 10000);
    return () => {
      console.log(`[${new Date().toISOString()}] Clearing fetchUsersAndSessions interval`);
      clearInterval(interval);
    };
  }, [token, myId]);

  const handleChange = (e) => {
    console.log(`[${new Date().toISOString()}] Form input changed: ${e.target.name}=${e.target.value}`);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`[${new Date().toISOString()}] Submitting session form:`, form);
    try {
      const response = await API.post('/sessions', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Session created successfully:`, response.data);
      toast.success('Session request sent!');
      setForm({
        recipient: '',
        date: '',
        time: '',
        endTime: '',
        duration: '',
        description: '',
        meetLink: '',
        meetingId: '',
        meetingPassword: '',
      });
      console.log(`[${new Date().toISOString()}] Form reset after submission`);
      fetchUsersAndSessions();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error scheduling session:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to schedule session');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    console.log(`[${new Date().toISOString()}] Submitting feedback:`, feedbackForm);
    try {
      const response = await API.post('/sessions/feedback', feedbackForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Feedback submitted successfully:`, response.data);
      toast.success('Feedback submitted!');
      setFeedbackForm({ sessionId: '', role: '', rating: '', comment: '' });
      console.log(`[${new Date().toISOString()}] Feedback form reset`);
      fetchUsersAndSessions();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error submitting feedback:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to submit feedback');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    console.log(`[${new Date().toISOString()}] Attempting to delete session: ${sessionId}`);
    const confirmDelete = window.confirm('Are you sure you want to delete this session?');
    if (!confirmDelete) {
      console.log(`[${new Date().toISOString()}] Session deletion cancelled: ${sessionId}`);
      return;
    }

    try {
      const response = await API.delete(`/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Session deleted successfully:`, response.data);
      toast.success('Session deleted successfully');
      fetchUsersAndSessions();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error deleting session:`, err.response?.data || err.message, err.stack);
      toast.error('Failed to delete session');
    }
  };

  const handleAcceptSession = async (sessionId) => {
    console.log(`[${new Date().toISOString()}] Attempting to accept session: ${sessionId}, userId: ${myId}`);
    try {
      const response = await API.put(`/sessions/${sessionId}/status`, { status: 'accepted', userId: myId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Session accepted successfully:`, response.data);
      toast.success('Session accepted!');
      await fetchUsersAndSessions();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error accepting session: ${sessionId}`, err.response?.data || err.message, err.stack);
      toast.error('Failed to accept session');
    }
  };

  const handleJoinMeeting = async (session) => {
    console.log(`[${new Date().toISOString()}] Attempting to join meeting:`, {
      sessionId: session._id,
      date: session.date,
      time: session.time,
      meetLink: session.meetLink
    });
    const sessionDateTime = new Date(`${session.date}T${session.time}:00+05:30`);
    const currentDate = currentTime.toISOString().split('T')[0];
    const nextDay = new Date(sessionDateTime);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    console.log(`[${new Date().toISOString()}] Join meeting validation:`, {
      sessionId: session._id,
      sessionDateTime: sessionDateTime.toISOString(),
      currentTime: currentTime.toISOString(),
      currentDate,
      sessionDate: session.date,
      nextDay: nextDayStr
    });

    if (currentDate >= nextDayStr) {
      console.log(`[${new Date().toISOString()}] Meeting link expired for session: ${session._id}`);
      toast.error('This meeting link has expired.');
      return;
    }

    if (currentTime < sessionDateTime) {
      console.log(`[${new Date().toISOString()}] Attempted to join before scheduled time for session: ${session._id}`);
      toast.error("You can't join the meeting before the scheduled time.");
      return;
    }

    try {
      const response = await API.put(`/sessions/${session._id}/join`, { userId: myId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Join time recorded for session: ${session._id}`, response.data);
      window.open(session.meetLink, '_blank', 'noopener,noreferrer');
      toast.success('Joined meeting');
      await fetchUsersAndSessions();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error recording join time for session: ${session._id}`, err.response?.data || err.message, err.stack);
      toast.error('Failed to record join time');
    }
  };

  const handleMarkDone = async (sessionId) => {
    console.log(`[${new Date().toISOString()}] Attempting to mark session as done: ${sessionId}, userId: ${myId}`);
    try {
      const response = await API.put(`/sessions/${sessionId}/status`, { status: 'done', userId: myId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[${new Date().toISOString()}] Session marked as done:`, response.data);
      toast.success('Session marked as done');
      await fetchUsersAndSessions();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error marking session as done: ${sessionId}`, err.response?.data || err.message, err.stack);
      toast.error('Failed to mark session as done');
    }
  };

  const canMarkDone = (session) => {
    const sessionDateTime = new Date(`${session.date}T${session.time}:00+05:30`);
    const currentDate = currentTime.toISOString().split('T')[0];
    const isAfterScheduledTime = currentTime >= sessionDateTime;
    const isAcceptedOrPending = session.status === 'accepted' || session.status === 'pending';

    console.log(`[${new Date().toISOString()}] canMarkDone check for session:`, {
      sessionId: session._id,
      sessionDate: session.date,
      sessionTime: session.time,
      sessionDateTime: sessionDateTime.toISOString(),
      currentDate,
      currentTime: currentTime.toISOString(),
      isAfterScheduledTime,
      isAcceptedOrPending,
      result: isAcceptedOrPending && isAfterScheduledTime
    });

    return isAcceptedOrPending && isAfterScheduledTime;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-900 px-4 sm:px-6 py-16 font-sans overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <img
          src={Stars}
          alt="Stars"
          className="w-full h-full object-cover opacity-20 pointer-events-none animate-pulse"
        />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-12 z-10">
        {/* Schedule Form */}
        <motion.div
          className="bg-white/80 rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-200/50"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-6 flex items-center justify-center gap-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="w-6 h-6 text-teal-400 animate-bounce" />
            Schedule a Session
          </motion.h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <motion.select
              name="recipient"
              value={form.recipient}
              onChange={handleChange}
              required
              className="col-span-1 md:col-span-2 border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
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
              className="border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.input
              type="text"
              name="duration"
              placeholder="e.g., 1h"
              value={form.duration}
              onChange={handleChange}
              required
              className="border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.input
              type="url"
              name="meetLink"
              placeholder="Google Meet link (optional)"
              value={form.meetLink}
              onChange={handleChange}
              className="border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.input
              type="text"
              name="meetingId"
              placeholder="Meeting ID (optional)"
              value={form.meetingId}
              onChange={handleChange}
              className="border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.input
              type="text"
              name="meetingPassword"
              placeholder="Meeting Password (optional)"
              value={form.meetingPassword}
              onChange={handleChange}
              className="border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.textarea
              name="description"
              placeholder="Describe the session (topics, goals, etc.)"
              value={form.description}
              onChange={handleChange}
              className="col-span-1 md:col-span-2 border border-blue-200/50 bg-white/90 px-4 py-3 rounded-lg shadow-sm resize-none h-28 focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              variants={itemVariants}
            />
            <motion.button
              type="submit"
              className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-teal-600 transition flex items-center justify-center gap-2 shadow-md"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Send className="w-5 h-5" />
              Send Request
            </motion.button>
          </form>
        </motion.div>

        {/* Past Rooms Section */}
        <motion.div
          className="bg-white/80 rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-200/50"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-6 flex items-center justify-center gap-2 sticky top-0 bg-white/90 z-10 py-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="w-6 h-6 text-teal-400 animate-bounce" />
            Past Rooms
          </motion.h2>
          <motion.div
            className="max-h-[400px] md:max-h-[500px] overflow-y-auto scroll-smooth will-change-scroll"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {sessions.filter(s => s.status === 'done' && s.pastRoom).map((s, index) => (
                <PastRoomCard
                  key={s._id}
                  session={s}
                  index={index}
                  myId={myId}
                  handleFeedbackSubmit={handleFeedbackSubmit}
                  feedbackForm={feedbackForm}
                  setFeedbackForm={setFeedbackForm}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Scheduled Sessions List */}
        <motion.div
          className="bg-white/80 rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-200/50"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-6 flex items-center justify-center gap-2 sticky top-0 bg-white/90 z-10 py-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="w-6 h-6 text-teal-400 animate-bounce" />
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
            <motion.div
              className="max-h-[400px] md:max-h-[500px] overflow-y-auto scroll-smooth will-change-scroll"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {sessions.map((s, index) => (
                  <SessionCard
                    key={s._id}
                    session={s}
                    index={index}
                    myId={myId}
                    handleJoinMeeting={handleJoinMeeting}
                    handleAcceptSession={handleAcceptSession}
                    handleMarkDone={handleMarkDone}
                    handleDeleteSession={handleDeleteSession}
                    canMarkDone={canMarkDone}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ScheduleSession;