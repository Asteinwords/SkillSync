const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateSkills,
  getSkillMatches,
  getAllUsers,
  getProfile,
  getTopUsers,
  getUserProfile,
  sendFollowRequest,
  acceptFollowRequest,
  searchUsers,
} = require('../controllers/userController');
const { getMutualFollowers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Welcome, authenticated user!', user: req.user });
});

router.put('/skills', protect, updateSkills);
router.get('/all', protect, getAllUsers);
router.get('/matches', protect, getSkillMatches);
router.get('/top-users', getTopUsers);
router.get('/me', protect, getProfile);
router.get('/:id/profile', getUserProfile);
router.post('/follow', protect, sendFollowRequest);
router.post('/accept-follow', protect, acceptFollowRequest);

// 🔄 Get pending follow requests for the logged-in user
router.get('/follow-requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('followRequests', 'name email');
    res.json(user.followRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch follow requests' });
  }
});

// ✅ Follow status (whether you're following, and mutual follows)
router.get('/follow-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const users = await User.find({ _id: { $ne: req.user._id } });

    const follows = {};
    const mutuals = {};

    for (let u of users) {
      const id = u._id.toString();
      const isFollowing = user.following.includes(u._id);
      const isMutual = isFollowing && user.followers.includes(u._id);
      follows[id] = isFollowing;
      mutuals[id] = isMutual;
    }

    res.json({ follows, mutuals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch follow status' });
  }
});

router.get('/search', protect, searchUsers);

router.get('/mutual-followers', protect, getMutualFollowers);


module.exports = router;
