// const Session = require('../models/sessionModel');
// const User = require('../models/User');

// // Optional: Email Notification Setup (requires nodemailer + SMTP config)
// // const sendEmail = require('../utils/sendEmail');

// exports.createSession = async (req, res) => {
//   const { recipient, date, time, duration, description,meetLink ,meetingId, meetingPassword} = req.body;

//   try {
//     const session = await Session.create({
//       requester: req.user._id,
//       recipient,
//       date,
//       time,
//       duration,
//       description,
//       meetLink,
//       meetingId,
//       meetingPassword,
//     });

//     res.status(201).json(session);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to create session' });
//   }
// };

// exports.getMySessions = async (req, res) => {
//   try {
//     const sessions = await Session.find({
//       $or: [{ requester: req.user._id }, { recipient: req.user._id }],
//     })
//       .populate('requester', 'name email')
//       .populate('recipient', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(sessions);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch sessions' });
//   }
// };

// // 🔄 Badge Updater Helper
// const updateBadge = async (userId) => {
//   const user = await User.findById(userId);
//   let badge = 'Beginner';

//   if (user.points >= 100) badge = 'Expert';
//   else if (user.points >= 50) badge = 'Mentor';
//   else if (user.points >= 20) badge = 'Contributor';

//   user.badge = badge;
//   await user.save();
// };

// exports.updateSessionStatus = async (req, res) => {
//   const { status } = req.body;

//   try {
//     const session = await Session.findById(req.params.id);

//     if (!session) return res.status(404).json({ message: 'Session not found' });

//     if (String(session.recipient) !== String(req.user._id)) {
//       return res.status(403).json({ message: 'Not authorized to update this session' });
//     }

//     session.status = status;

//     // 🔼 Add Points and Badges
//     if (status === 'accepted') {
//       const teacherId = session.requester;
//       const learnerId = session.recipient;

//       await User.findByIdAndUpdate(teacherId, { $inc: { points: 10 } });
//       await User.findByIdAndUpdate(learnerId, { $inc: { points: 5 } });

//       await updateBadge(teacherId);
//       await updateBadge(learnerId);

//       // 📧 Optional Email Notification
//       // const teacher = await User.findById(teacherId);
//       // const learner = await User.findById(learnerId);
//       // await sendEmail(teacher.email, 'Session Accepted', `Your session has been accepted by ${learner.name}`);
//     }

//     await session.save();

//     res.json({ message: 'Session updated', session });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to update session' });
//   }
// };
// // exports.submitFeedback = async (req, res) => {
// //   const { sessionId, role, rating, comment } = req.body;

// //   try {
// //     const session = await Session.findById(sessionId);

// //     if (!session) return res.status(404).json({ message: 'Session not found' });

// //     if (role === 'requester' && String(session.requester) === String(req.user._id)) {
// //       session.requesterFeedback = { rating, comment };
// //     } else if (role === 'recipient' && String(session.recipient) === String(req.user._id)) {
// //       session.recipientFeedback = { rating, comment };
// //     } else {
// //       return res.status(403).json({ message: 'Unauthorized to submit feedback' });
// //     }

// //     await session.save();
// //     res.json({ message: 'Feedback submitted', session });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: 'Failed to submit feedback' });
// //   }
// // };

// exports.submitFeedback = async (req, res) => {
//   const { sessionId, role, rating, comment } = req.body;

//   try {
//     const session = await Session.findById(sessionId);

//     if (!session) return res.status(404).json({ message: 'Session not found' });

//     // Check ownership and set feedback
//     if (role === 'requester' && String(session.requester) === String(req.user._id)) {
//       session.requesterFeedback = { rating, comment };
//     } else if (role === 'recipient' && String(session.recipient) === String(req.user._id)) {
//       session.recipientFeedback = { rating, comment };
//     } else {
//       return res.status(403).json({ message: 'Unauthorized to submit feedback' });
//     }

//     // If both feedbacks exist, mark session as done
//     if (session.requesterFeedback.rating && session.recipientFeedback.rating) {
//       session.status = 'done';
//     }

//     await session.save();
//     res.json({ message: 'Feedback submitted', session });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to submit feedback' });
//   }
// };
const Session = require('../models/sessionModel');
const User = require('../models/User');

exports.createSession = async (req, res) => {
  const { recipient, date, time, duration, description, meetLink, meetingId, meetingPassword } = req.body;

  try {
    const session = await Session.create({
      requester: req.user._id,
      recipient,
      date,
      time,
      duration,
      description,
      meetLink,
      meetingId,
      meetingPassword
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
      $or: [{ requester: req.user._id }, { recipient: req.user._id }]
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
  const { status } = req.body;

  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const userId = req.user._id.toString();
    if (
      userId !== session.recipient.toString() &&
      userId !== session.requester.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    session.status = status;

    if (status === 'accepted') {
      await User.findByIdAndUpdate(session.requester, { $inc: { points: 10 } });
      await User.findByIdAndUpdate(session.recipient, { $inc: { points: 5 } });
      await updateBadge(session.requester);
      await updateBadge(session.recipient);
    }

    await session.save();
    res.json({ message: 'Session status updated', session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update session status' });
  }
};

exports.submitFeedback = async (req, res) => {
  const { sessionId, role, rating, comment } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const userId = req.user._id.toString();
    if (role === 'requester' && userId === session.requester.toString()) {
      session.requesterFeedback = { rating, comment };
    } else if (role === 'recipient' && userId === session.recipient.toString()) {
      session.recipientFeedback = { rating, comment };
    } else {
      return res.status(403).json({ message: 'Unauthorized to submit feedback' });
    }

    // Automatically mark as 'done' if both feedbacks are given
    if (
      session.requesterFeedback?.rating &&
      session.recipientFeedback?.rating &&
      session.status !== 'done'
    ) {
      session.status = 'done';
    }

    await session.save();
    res.json({ message: 'Feedback submitted', session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};
// DELETE /api/sessions/:id
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Only requester can delete
    if (String(session.requester) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to delete this session' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete session' });
  }
};
