const Session = require('../models/sessionModel');
const User = require('../models/User');

// Optional: Email Notification Setup (requires nodemailer + SMTP config)
// const sendEmail = require('../utils/sendEmail');

exports.createSession = async (req, res) => {
  const { recipient, date, time, duration, description,meetLink } = req.body;

  try {
    const session = await Session.create({
      requester: req.user._id,
      recipient,
      date,
      time,
      duration,
      description,
      meetLink,
    });

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create session' });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    })
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
};

// 🔄 Badge Updater Helper
const updateBadge = async (userId) => {
  const user = await User.findById(userId);
  let badge = 'Beginner';

  if (user.points >= 100) badge = 'Expert';
  else if (user.points >= 50) badge = 'Mentor';
  else if (user.points >= 20) badge = 'Contributor';

  user.badge = badge;
  await user.save();
};

exports.updateSessionStatus = async (req, res) => {
  const { sessionId, status } = req.body;

  try {
    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (String(session.recipient) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    session.status = status;

    // 🔼 Add Points and Badges
    if (status === 'accepted') {
      const teacherId = session.requester;
      const learnerId = session.recipient;

      await User.findByIdAndUpdate(teacherId, { $inc: { points: 10 } });
      await User.findByIdAndUpdate(learnerId, { $inc: { points: 5 } });

      await updateBadge(teacherId);
      await updateBadge(learnerId);

      // 📧 Optional Email Notification
      // const teacher = await User.findById(teacherId);
      // const learner = await User.findById(learnerId);
      // await sendEmail(teacher.email, 'Session Accepted', `Your session has been accepted by ${learner.name}`);
    }

    await session.save();

    res.json({ message: 'Session updated', session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update session' });
  }
};
exports.submitFeedback = async (req, res) => {
  const { sessionId, role, rating, comment } = req.body;

  try {
    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (role === 'requester' && String(session.requester) === String(req.user._id)) {
      session.requesterFeedback = { rating, comment };
    } else if (role === 'recipient' && String(session.recipient) === String(req.user._id)) {
      session.recipientFeedback = { rating, comment };
    } else {
      return res.status(403).json({ message: 'Unauthorized to submit feedback' });
    }

    await session.save();
    res.json({ message: 'Feedback submitted', session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

