const express = require('express');
const router = express.Router();
const {
  createSession,
  getMySessions,
  updateSessionStatus,
  submitFeedback,
  deleteSession
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getMySessions);
router.put('/:id/status', protect, updateSessionStatus);
router.post('/feedback',protect, submitFeedback);
router.delete('/:id', protect, deleteSession); // ✅ Add this line


module.exports = router;
