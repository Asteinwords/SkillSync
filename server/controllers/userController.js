const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route POST /api/users/register
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route POST /api/users/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route PUT /api/users/skills
exports.updateSkills = async (req, res) => {
  const userId = req.user._id;
  const { skillsOffered, skillsWanted } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { skillsOffered, skillsWanted },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update skills' });
  }
};
// @route GET /api/users/matches
exports.getSkillMatches = async (req, res) => {
  const currentUser = req.user;

  try {
    const users = await User.find({ _id: { $ne: currentUser._id } });

    const matchedUsers = users.filter((user) => {
      const currentOffers = currentUser.skillsOffered.map(s => s.skill.toLowerCase());
      const currentWants = currentUser.skillsWanted.map(s => s.skill.toLowerCase());
      const userOffers = user.skillsOffered.map(s => s.skill.toLowerCase());
      const userWants = user.skillsWanted.map(s => s.skill.toLowerCase());

      const theyCanTeach = currentWants.some(skill => userOffers.includes(skill));
      const youCanTeach = currentOffers.some(skill => userWants.includes(skill));

      return theyCanTeach && youCanTeach;
    });

    res.json(matchedUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error finding matches' });
  }
};
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('followers', 'name email')
      .populate('following', 'name email');

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

exports.getTopUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email points badge')
      .sort({ points: -1 })
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};
const Session = require('../models/sessionModel');

// exports.getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const sessions = await Session.find({ recipient: user._id, 'requesterFeedback.rating': { $exists: true } })
//       .populate('requester', 'name email')
//       .sort({ createdAt: -1 });

//     const feedbacks = sessions.map(s => ({
//       from: s.requester.name,
//       rating: s.requesterFeedback.rating,
//       comment: s.requesterFeedback.comment,
//     }));

//     const avgRating = feedbacks.length
//       ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
//       : null;

//     res.json({ user, feedbacks, avgRating });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to load profile' });
//   }
// };
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sessionsAsRecipient = await Session.find({
      recipient: user._id,
      'requesterFeedback.rating': { $exists: true },
    }).populate('requester', 'name email');

    const sessionsAsRequester = await Session.find({
      requester: user._id,
      'recipientFeedback.rating': { $exists: true },
    }).populate('recipient', 'name email');

    const feedbacks = [
      ...sessionsAsRecipient.map((s) => ({
        from: s.requester.name,
        rating: s.requesterFeedback.rating,
        comment: s.requesterFeedback.comment,
      })),
      ...sessionsAsRequester.map((s) => ({
        from: s.recipient.name,
        rating: s.recipientFeedback.rating,
        comment: s.recipientFeedback.comment,
      })),
    ];

    const avgRating =
      feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : null;

    res.json({ user, feedbacks, avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};
exports.sendFollowRequest = async (req, res) => {
  const { targetId } = req.body;
  const senderId = req.user._id;

  console.log("Follow request from:", senderId, "to:", targetId);

  try {
    if (senderId.toString() === targetId) {
      return res.status(400).json({ message: "Can't follow yourself" });
    }

    const target = await User.findById(targetId);
    const sender = await User.findById(senderId);

    if (!target || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      target.followRequests.includes(senderId) ||
      target.followers.includes(senderId)
    ) {
      return res.status(400).json({ message: "Already sent or following" });
    }

    target.followRequests.push(senderId);
    await target.save();

    res.json({ message: "Follow request sent" });
  } catch (error) {
    console.error("Error sending follow request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptFollowRequest = async (req, res) => {
  const { senderId } = req.body;

  const user = await User.findById(req.user._id);
  const sender = await User.findById(senderId);

  if (!user || !sender) return res.status(404).json({ message: 'User not found' });

  // Ensure request exists
  if (!user.followRequests.includes(senderId))
    return res.status(400).json({ message: 'No such follow request' });

  // Add each other
  user.followers.push(senderId);
  user.following.push(senderId);
  sender.followers.push(user._id);
  sender.following.push(user._id);

  // Remove request
  user.followRequests = user.followRequests.filter(id => id.toString() !== senderId);

  await user.save();
  await sender.save();

  res.json({ message: 'Follow request accepted' });
};


exports.searchUsers = async (req, res) => {
  const { skill, type = 'offered', level, badge } = req.query;
  const currentUserId = req.user._id;

  try {
    const filter = { _id: { $ne: currentUserId } };

    if (badge) {
      filter.badge = badge;
    }

    if (skill) {
      const skillPath = type === 'wanted' ? 'skillsWanted' : 'skillsOffered';
      filter[`${skillPath}.skill`] = { $regex: skill, $options: 'i' };
      if (level) {
        filter[`${skillPath}.level`] = level;
      }
    }

    console.log('🔍 Search Filter:', JSON.stringify(filter, null, 2));

    const users = await User.find(filter).select('name badge skillsOffered skillsWanted');

    console.log('✅ Matched Users:', users.map(u => u.name));

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getMutualFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'name email');

    const mutuals = user.following.filter(f =>
      user.followers.includes(f._id)
    );

    res.json(mutuals);
  } catch (err) {
    console.error('❌ Error fetching mutual followers:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

