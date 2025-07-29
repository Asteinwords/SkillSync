const Session = require('../models/sessionModel');
const User = require('../models/User');

exports.createSession = async (req, res) => {
  const { recipient, date, time, endTime, duration, description, meetLink, meetingId, meetingPassword } = req.body;
  console.log(`[${new Date().toISOString()}] Creating session with data:`, { requester: req.user._id, recipient, date, time, endTime, duration });

  try {
    const session = await Session.create({
      requester: req.user._id,
      recipient,
      date,
      time,
      endTime,
      duration,
      description,
      meetLink,
      meetingId,
      meetingPassword
    });
    console.log(`[${new Date().toISOString()}] Session created successfully:`, { id: session._id, status: session.status });
    res.status(201).json(session);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error creating session:`, err.message, err.stack);
    res.status(500).json({ message: 'Failed to create session' });
  }
};

exports.getMySessions = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching sessions for user: ${req.user._id}`);
  try {
    const sessions = await Session.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    })
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });
    console.log(`[${new Date().toISOString()}] Fetched ${sessions.length} sessions:`, sessions.map(s => ({ id: s._id, status: s.status, date: s.date })));
    res.json(sessions);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching sessions:`, err.message, err.stack);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
};

const updateBadge = async (userId) => {
  console.log(`[${new Date().toISOString()}] Updating badge for user: ${userId}`);
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`[${new Date().toISOString()}] User not found: ${userId}`);
      return;
    }
    let badge = 'Beginner';
    if (user.points >= 100) badge = 'Expert';
    else if (user.points >= 50) badge = 'Mentor';
    else if (user.points >= 20) badge = 'Contributor';
    user.badge = badge;
    await user.save();
    console.log(`[${new Date().toISOString()}] Badge updated for user ${userId}: ${badge}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error updating badge for user ${userId}:`, err.message, err.stack);
  }
};

exports.updateSessionStatus = async (req, res) => {
  const { status } = req.body;
  console.log(`[${new Date().toISOString()}] Updating session status:`, { sessionId: req.params.id, status, userId: req.user._id });

  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      console.error(`[${new Date().toISOString()}] Session not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    if (userId !== session.recipient.toString() && userId !== session.requester.toString()) {
      console.error(`[${new Date().toISOString()}] Unauthorized session update attempt:`, { userId, sessionId: req.params.id });
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    if (status === 'done') {
      const requester = await User.findById(session.requester);
      const recipient = await User.findById(session.recipient);
      if (!requester || !recipient) {
        console.error(`[${new Date().toISOString()}] User(s) not found for session:`, { requester: session.requester, recipient: session.recipient });
        return res.status(404).json({ message: 'User(s) not found' });
      }
      const leaveTime = new Date().toTimeString().split(' ')[0].slice(0, 5);
      session.pastRoom = {
        hostName: requester.name,
        participantName: recipient.name,
        joinTime: session.joinTime || session.time,
        leaveTime
      };
      console.log(`[${new Date().toISOString()}] Updated pastRoom (manual):`, session.pastRoom);
    }

    session.status = status;
    console.log(`[${new Date().toISOString()}] Session status updated to: ${status}`);

    if (status === 'accepted') {
      console.log(`[${new Date().toISOString()}] Awarding points for accepted session:`, { requester: session.requester, recipient: session.recipient });
      await User.findByIdAndUpdate(session.requester, { $inc: { points: 10 } });
      await User.findByIdAndUpdate(session.recipient, { $inc: { points: 5 } });
      await updateBadge(session.requester);
      await updateBadge(session.recipient);
    }

    await session.save();
    console.log(`[${new Date().toISOString()}] Session saved:`, { id: session._id, status: session.status });
    res.json({ message: 'Session status updated', session });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error updating session status:`, err.message, err.stack);
    res.status(500).json({ message: 'Failed to update session status' });
  }
};

exports.submitFeedback = async (req, res) => {
  const { sessionId, role, rating, comment } = req.body;
  console.log(`[${new Date().toISOString()}] Submitting feedback:`, { sessionId, role, rating, comment, userId: req.user._id });

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      console.error(`[${new Date().toISOString()}] Session not found for feedback: ${sessionId}`);
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    if (role === 'requester' && userId === session.requester.toString()) {
      session.requesterFeedback = { rating, comment };
      console.log(`[${new Date().toISOString()}] Requester feedback recorded:`, session.requesterFeedback);
    } else if (role === 'recipient' && userId === session.recipient.toString()) {
      session.recipientFeedback = { rating, comment };
      console.log(`[${new Date().toISOString()}] Recipient feedback recorded:`, session.recipientFeedback);
    } else {
      console.error(`[${new Date().toISOString()}] Unauthorized feedback attempt:`, { userId, role, sessionId });
      return res.status(403).json({ message: 'Unauthorized to submit feedback' });
    }

    await session.save();
    console.log(`[${new Date().toISOString()}] Feedback saved for session: ${sessionId}`);
    res.json({ message: 'Feedback submitted', session });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error submitting feedback:`, err.message, err.stack);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

exports.deleteSession = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Deleting session:`, { sessionId: req.params.id, userId: req.user._id });
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      console.error(`[${new Date().toISOString()}] Session not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Session not found' });
    }

    if (String(session.requester) !== String(req.user._id)) {
      console.error(`[${new Date().toISOString()}] Unauthorized session deletion attempt:`, { userId: req.user._id, sessionId: req.params.id });
      return res.status(403).json({ message: 'You are not authorized to delete this session' });
    }

    await session.deleteOne();
    console.log(`[${new Date().toISOString()}] Session deleted: ${req.params.id}`);
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error deleting session:`, err.message, err.stack);
    res.status(500).json({ message: 'Failed to delete session' });
  }
};

exports.recordJoinTime = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Recording join time for session:`, { sessionId: req.params.id, userId: req.user._id });
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      console.error(`[${new Date().toISOString()}] Session not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    if (userId !== session.requester.toString() && userId !== session.recipient.toString()) {
      console.error(`[${new Date().toISOString()}] Unauthorized join attempt:`, { userId, sessionId: req.params.id });
      return res.status(403).json({ message: 'Not authorized to join this session' });
    }

    const sessionDateTime = new Date(`${session.date}T${session.time}:00+05:30`);
    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];
    const nextDay = new Date(sessionDateTime);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    console.log(`[${new Date().toISOString()}] Join time validation:`, {
      sessionId: req.params.id,
      sessionDateTime: sessionDateTime.toISOString(),
      currentTime: currentTime.toISOString(),
      currentDate,
      nextDay: nextDayStr
    });

    if (currentDate >= nextDayStr) {
      console.error(`[${new Date().toISOString()}] Meeting link expired: ${req.params.id}`);
      return res.status(400).json({ message: 'This meeting link has expired.' });
    }

    if (currentTime < sessionDateTime) {
      console.error(`[${new Date().toISOString()}] Attempted join before scheduled time: ${req.params.id}`);
      return res.status(400).json({ message: "You can't join the meeting before the scheduled time." });
    }

    session.joinTime = currentTime.toTimeString().split(' ')[0].slice(0, 5);
    await session.save();
    console.log(`[${new Date().toISOString()}] Join time recorded:`, { sessionId: req.params.id, joinTime: session.joinTime });
    res.json({ message: 'Join time recorded', session });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error recording join time:`, err.message, err.stack);
    res.status(500).json({ message: 'Failed to record join time' });
  }
};

exports.autoMarkDone = async () => {
  console.log(`[${new Date().toISOString()}] Running autoMarkDone job`);
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

    const sessions = await Session.find({
      status: 'accepted',
      date: currentDate,
      endTime: { $lte: currentTime }
    }).populate('requester', 'name').populate('recipient', 'name');

    console.log(`[${new Date().toISOString()}] Found ${sessions.length} sessions to auto-mark as done`);

    for (const session of sessions) {
      console.log(`[${new Date().toISOString()}] Processing session:`, { id: session._id, date: session.date, endTime: session.endTime });
      session.status = 'done';
      session.pastRoom = {
        hostName: session.requester.name,
        participantName: session.recipient.name,
        joinTime: session.joinTime || session.time,
        leaveTime: session.endTime
      };
      await session.save();
      console.log(`[${new Date().toISOString()}] Auto-updated pastRoom:`, { sessionId: session._id, pastRoom: session.pastRoom });
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in autoMarkDone:`, err.message, err.stack);
  }
};