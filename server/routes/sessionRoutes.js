const express = require('express');
const router = express.Router();
const {
  createSession,
  getMySessions,
  updateSessionStatus,
  submitFeedback
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/', protect, getMySessions);
router.put('/status', protect, updateSessionStatus);
router.post('/feedback',protect, submitFeedback);


module.exports = router;
