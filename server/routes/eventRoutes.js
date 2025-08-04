const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getEvents, createEvent } = require('../controllers/eventController');

router.get('/', protect, getEvents);
router.post('/', protect, createEvent); // Add admin middleware in production

module.exports = router;