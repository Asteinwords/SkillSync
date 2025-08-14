const Event = require('../models/eventModel');

exports.getEvents = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/events - Fetching events`);
    const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(10);
    res.json(events);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching events:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    if (!title || !description || !date || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    console.log(`[${new Date().toISOString()}] POST /api/events - Creating event: ${title}`);
    const event = new Event({ title, description, date, type });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error creating event:`, err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};