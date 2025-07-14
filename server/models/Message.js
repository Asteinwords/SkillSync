const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: String,
  from: String,
  to: String,
  message: String,
  time: Date,
     deletedBy: {
    type: [String], // Array of userIds
    default: [],
  },
});

module.exports = mongoose.model('Message', messageSchema);
