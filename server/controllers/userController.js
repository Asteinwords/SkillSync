
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Session = require('../models/sessionModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

// Ensure .env is loaded
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Debug log to verify module loading
console.log('userController loaded');

// Debug SMTP credentials
console.log('SMTP Credentials:', {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? '[REDACTED]' : undefined,
  from: process.env.EMAIL_FROM,
});

// Set up Nodemailer transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error(`[${new Date().toISOString()}] Transporter verification failed:`, {
      error: error.message,
      code: error.code,
      command: error.command,
    });
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// Helper to send email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
    console.log(`[${new Date().toISOString()}] Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Email sending failed:`, {
      error: error.message,
      code: error.code,
      command: error.command,
      to,
      subject,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Helper to generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// @route POST /api/users/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate input
    if (!email || !password) {
      console.log(`[${new Date().toISOString()}] Missing email or password:`, { email, password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    console.log(`[${new Date().toISOString()}] Looking up user with email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[${new Date().toISOString()}] User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log(`[${new Date().toISOString()}] Verifying password for user: ${email}`);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`[${new Date().toISOString()}] Invalid password for user: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[${new Date().toISOString()}] Generated OTP for ${email}: ${otp}`);
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log(`[${new Date().toISOString()}] OTP saved for user: ${email}`);

    // Send OTP email
    await sendEmail(user.email, 'SkillSync Login OTP', `Your one-time password (OTP) for login is: ${otp}. It expires in 10 minutes.`);
    console.log(`[${new Date().toISOString()}] OTP email sent to: ${email}`);

    res.json({ success: true, message: 'OTP sent to your email', userId: user._id });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Login error:`, {
      error: err.message,
      stack: err.stack,
      email,
    });
    res.status(500).json({ message: `Login failed: ${err.message}` });
  }
};

// @route POST /api/users/register
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'User registered successfully. Please login.' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Register error:`, err);
    res.status(500).json({ message: `Registration failed: ${err.message}` });
  }
};

// @route POST /api/users/verify-otp
exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      refreshToken,
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Verify OTP error:`, err);
    res.status(500).json({ message: `OTP verification failed: ${err.message}` });
  }
};

// @route POST /api/users/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(user.email, 'SkillSync Password Reset', `You requested a password reset. Click the link to reset your password: ${resetUrl}. It expires in 10 minutes.`);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Forgot password error:`, err);
    res.status(500).json({ message: `Password reset failed: ${err.message}` });
  }
};

// @route POST /api/users/reset-password/:token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Reset password error:`, err);
    res.status(500).json({ message: `Password reset failed: ${err.message}` });
  }
};

// @route POST /api/users/refresh
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newToken = generateToken(user._id);
    res.json({ token: newToken });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Refresh token error:`, err);
    res.status(401).json({ message: `Invalid refresh token: ${err.message}` });
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
    console.error(`[${new Date().toISOString()}] Update skills error:`, err);
    res.status(500).json({ message: `Failed to update skills: ${err.message}` });
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
    console.error(`[${new Date().toISOString()}] Get skill matches error:`, err);
    res.status(500).json({ message: `Error finding matches: ${err.message}` });
  }
};

// @route GET /api/users/all
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Get all users error:`, err);
    res.status(500).json({ message: `Failed to fetch users: ${err.message}` });
  }
};

// @route GET /api/users/me
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('followers', 'name email profileImage')
      .populate('following', 'name email profileImage');
    res.json(user);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Get profile error:`, err);
    res.status(500).json({ message: `Failed to fetch profile: ${err.message}` });
  }
};

// @route GET /api/users/top-users
exports.getTopUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email points badge profileImage')
      .sort({ points: -1 })
      .limit(10);
    res.json(users);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Get top users error:`, err);
    res.status(500).json({ message: `Failed to fetch leaderboard: ${err.message}` });
  }
};

// @route GET /api/users/:id/profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const sessionsAsRecipient = await Session.find({
      recipient: user._id,
      'requesterFeedback.rating': { $exists: true },
    }).populate('requester', 'name email profileImage');
    const sessionsAsRequester = await Session.find({
      requester: user._id,
      'recipientFeedback.rating': { $exists: true },
    }).populate('recipient', 'name email profileImage');
    const feedbacks = [
      ...sessionsAsRecipient.map((s) => ({
        from: s.requester.name,
        profileImage: s.requester.profileImage,
        rating: s.requesterFeedback.rating,
        comment: s.requesterFeedback.comment,
      })),
      ...sessionsAsRequester.map((s) => ({
        from: s.recipient.name,
        profileImage: s.recipient.profileImage,
        rating: s.recipientFeedback.rating,
        comment: s.recipientFeedback.comment,
      })),
    ];
    const avgRating = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : null;
    res.json({ user, feedbacks, avgRating, streak: user.streak, points: user.points, lastVisited: user.lastVisited });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Get user profile error:`, err);
    res.status(500).json({ message: `Failed to load profile: ${err.message}` });
  }
};

// @route POST /api/users/update-visit/:id
exports.updateVisit = async (req, res) => {
  try {
    const viewerId = req.user._id;
    const targetId = req.params.id;
    if (viewerId.toString() === targetId) {
      return res.json({ message: 'No visit increment for self-view' });
    }
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.visits += 1;
    await user.save();
    res.json({ visits: user.visits });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Update visit error:`, err);
    res.status(500).json({ message: `Failed to update visit count: ${err.message}` });
  }
};

// @route POST /api/users/follow
exports.sendFollowRequest = async (req, res) => {
  const { targetId } = req.body;
  const senderId = req.user._id;
  try {
    if (senderId.toString() === targetId) {
      return res.status(400).json({ message: "Can't follow yourself" });
    }
    const target = await User.findById(targetId);
    const sender = await User.findById(senderId);
    if (!target || !sender) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.followRequests.includes(senderId) || target.followers.includes(senderId)) {
      return res.status(400).json({ message: "Already sent or following" });
    }
    target.followRequests.push(senderId);
    await target.save();
    res.json({ message: "Follow request sent" });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Send follow request error:`, err);
    res.status(500).json({ message: `Failed to send follow request: ${err.message}` });
  }
};

// @route POST /api/users/accept-follow
exports.acceptFollowRequest = async (req, res) => {
  const { senderId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const sender = await User.findById(senderId);
    if (!user || !sender) return res.status(404).json({ message: 'User not found' });
    if (!user.followRequests.includes(senderId)) {
      return res.status(400).json({ message: 'No such follow request' });
    }
    user.followRequests = user.followRequests.filter(id => id.toString() !== senderId);
    if (!user.following.includes(senderId)) {
      user.following.push(senderId);
    }
    if (!user.followers.includes(senderId)) {
      user.followers.push(senderId);
    }
    if (!sender.following.includes(user._id)) {
      sender.following.push(user._id);
    }
    if (!sender.followers.includes(user._id)) {
      sender.followers.push(user._id);
    }
    await user.save();
    await sender.save();
    res.json({ message: 'Follow request accepted' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Accept follow request error:`, err);
    res.status(500).json({ message: `Failed to accept follow request: ${err.message}` });
  }
};

// @route GET /api/users/search
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
    const users = await User.find(filter).select('name badge skillsOffered skillsWanted');
    res.json(users);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Search users error:`, err);
    res.status(500).json({ message: `Search failed: ${err.message}` });
  }
};

// @route PUT /api/users/profile-image
exports.updateProfileImage = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: req.body.image },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Update profile image error:`, err);
    res.status(500).json({ message: `Failed to update profile image: ${err.message}` });
  }
};

// @route PUT /api/users/profile-info
exports.updateProfileInfo = async (req, res) => {
  try {
    const { aboutMe, education } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { aboutMe, education },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Update profile info error:`, err);
    res.status(500).json({ message: `Failed to update profile info: ${err.message}` });
  }
};
// @route POST /api/users/update-streak
exports.updateStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Initialize visitHistory if undefined
    if (!user.visitHistory) {
      user.visitHistory = [];
    }

    // Add today's date to visitHistory if not already present
    const todayStr = today.toISOString().split('T')[0];
    if (!user.visitHistory.some(date => date.toISOString().split('T')[0] === todayStr)) {
      user.visitHistory.push(today);
      user.points = (user.points || 0) + 2; // Add 2 points for new activity
    }

    // Calculate streaks
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const sortedDates = user.visitHistory
      .map(date => new Date(date).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a); // Sort in descending order (most recent first)

    let currentStreak = 0;
    let maxStreak = 0;
    let currentRun = 1;

    // Calculate CURRENT and MAX streaks
    if (sortedDates.length > 0 && sortedDates[0] === today.getTime()) {
      currentStreak = 1; // Start with today
      let prevDate = sortedDates[0];
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i];
        if (prevDate - currentDate === oneDayInMs) {
          currentRun++;
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentRun);
          currentRun = 1;
          if (currentStreak > 0) break; // Stop counting current streak after a break
        }
        prevDate = currentDate;
      }
      maxStreak = Math.max(maxStreak, currentRun);
    }

    // TOTAL is the number of unique active days
    const totalDays = sortedDates.length;

    // Update user
    user.streak = currentStreak;
    user.lastVisited = today;
    await user.save();

    res.json({
      streak: currentStreak,
      maxStreak,
      totalDays,
      visitHistory: sortedDates.map(date => new Date(date).toISOString().split('T')[0]),
      points: user.points,
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Update streak error:`, err);
    res.status(500).json({ message: `Failed to update streak: ${err.message}` });
  }
};
// @route DELETE /api/users/delete
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      console.log(`[${new Date().toISOString()}] User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    await Session.deleteMany({
      $or: [{ requester: userId }, { recipient: userId }],
    });
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    await User.updateMany(
      { followRequests: userId },
      { $pull: { followRequests: userId } }
    );
    await User.deleteOne({ _id: userId });
    console.log(`[${new Date().toISOString()}] User deleted: ${userId}`);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Delete user error:`, err);
    res.status(500).json({ message: `Failed to delete user: ${err.message}` });
  }
};
