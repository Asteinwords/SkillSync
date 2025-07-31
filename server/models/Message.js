const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
  deletedBy: { type: [String], default: [] },
  unreadBy: { type: [String], default: [] },
});

module.exports = mongoose.model('Message', messageSchema);