const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllPosts,
  createPost,
  addReaction,
  bookmarkPost,
  addComment,
  votePoll,
  getMedia,
  getTrendingSkills,
  getBookmarkedPosts,
  deletePost,
} = require('../controllers/postController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/posts', protect, getAllPosts);
router.post('/posts', protect, upload.single('media'), createPost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/reaction', protect, addReaction);
router.post('/posts/:id/bookmark', protect, bookmarkPost);
router.post('/posts/:id/comment', protect, addComment);
router.post('/posts/:id/poll-vote', protect, votePoll);
router.get('/media/:id', getMedia);
router.get('/trending-skills', protect, getTrendingSkills);
router.get('/bookmarks', protect, getBookmarkedPosts);

module.exports = router;