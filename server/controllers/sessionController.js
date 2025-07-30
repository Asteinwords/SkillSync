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
      meetingPassword,
      pastRoom: { // Initialize pastRoom during creation
        hostName: (await User.findById(req.user._id)).name,
        participantName: (await User.findById(recipient)).name,
        requesterJoinTime: null,
        requesterLeaveTime: null,
        recipientJoinTime: null,
        recipientLeaveTime: null
      }
    });
    console.log(`[${new Date().toISOString()}] Session created successfully:`, { id: session._id, status: session.status, pastRoom: session.pastRoom });
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
    console.log(`[${new Date().toISOString()}] Fetched ${sessions.length} sessions:`, sessions.map(s => ({ id: s._id, status: s.status, date: s.date, pastRoom: s.pastRoom })));
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
  const { status, userId } = req.body;
  console.log(`[${new Date().toISOString()}] Updating session status:`, { sessionId: req.params.id, status, userId });

  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      console.error(`[${new Date().toISOString()}] Session not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Session not found' });
    }

    const requesterId = session.requester.toString();
    const recipientId = session.recipient.toString();
    if (userId !== requesterId && userId !== recipientId) {
      console.error(`[${new Date().toISOString()}] Unauthorized session update attempt:`, { userId, sessionId: req.params.id });
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    if (status === 'accepted' && userId !== recipientId) {
      console.error(`[${new Date().toISOString()}] Only recipient can accept session:`, { userId, sessionId: req.params.id });
      return res.status(403).json({ message: 'Only the recipient can accept this session' });
    }

    if (status === 'done') {
      const requester = await User.findById(session.requester);
      const recipient = await User.findById(session.recipient);
      if (!requester || !recipient) {
        console.error(`[${new Date().toISOString()}] User(s) not found for session:`, { requester: session.requester, recipient: session.recipient });
        return res.status(404).json({ message: 'User(s) not found' });
      }
      const currentTime = new Date().toTimeString().split(' ')[0].slice(0, 5);
      if (!session.pastRoom) {
        session.pastRoom = {
          hostName: requester.name,
          participantName: recipient.name,
          requesterJoinTime: null,
          requesterLeaveTime: null,
          recipientJoinTime: null,
          recipientLeaveTime: null
        };
      }
      if (userId === requesterId) {
        session.pastRoom.requesterLeaveTime = currentTime;
      } else {
        session.pastRoom.recipientLeaveTime = currentTime;
      }
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
    console.log(`[${new Date().toISOString()}] Session saved:`, { id: session._id, status: session.status, pastRoom: session.pastRoom });
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
  const { userId } = req.body;
  console.log(`[${new Date().toISOString()}] Recording join time for session:`, { sessionId: req.params.id, userId });
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      console.error(`[${new Date().toISOString()}] Session not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Session not found' });
    }

    const requesterId = session.requester.toString();
    const recipientId = session.recipient.toString();
    if (userId !== requesterId && userId !== recipientId) {
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

    const joinTime = currentTime.toTimeString().split(' ')[0].slice(0, 5);
    if (!session.pastRoom) {
      const requester = await User.findById(session.requester);
      const recipient = await User.findById(session.recipient);
      session.pastRoom = {
        hostName: requester.name,
        participantName: recipient.name,
        requesterJoinTime: null,
        requesterLeaveTime: null,
        recipientJoinTime: null,
        recipientLeaveTime: null
      };
    }
    if (userId === requesterId) {
      session.pastRoom.requesterJoinTime = joinTime;
    } else {
      session.pastRoom.recipientJoinTime = joinTime;
    }
    await session.save();
    console.log(`[${new Date().toISOString()}] Join time recorded:`, { sessionId: req.params.id, userId, joinTime, pastRoom: session.pastRoom });
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
      status: { $in: ['accepted', 'pending'] },
      date: currentDate,
      endTime: { $lte: currentTime }
    }).populate('requester', 'name').populate('recipient', 'name');

    console.log(`[${new Date().toISOString()}] Found ${sessions.length} sessions to auto-mark as done`);

    for (const session of sessions) {
      console.log(`[${new Date().toISOString()}] Processing session:`, { id: session._id, date: session.date, endTime: session.endTime });
      session.status = 'done';
      if (!session.pastRoom) {
        session.pastRoom = {
          hostName: session.requester.name,
          participantName: session.recipient.name,
          requesterJoinTime: null,
          requesterLeaveTime: session.endTime,
          recipientJoinTime: null,
          recipientLeaveTime: session.endTime
        };
      } else {
        session.pastRoom.requesterLeaveTime = session.pastRoom.requesterLeaveTime || session.endTime;
        session.pastRoom.recipientLeaveTime = session.pastRoom.recipientLeaveTime || session.endTime;
      }
      await session.save();
      console.log(`[${new Date().toISOString()}] Auto-updated pastRoom:`, { sessionId: session._id, pastRoom: session.pastRoom });
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in autoMarkDone:`, err.message, err.stack);
  }
};