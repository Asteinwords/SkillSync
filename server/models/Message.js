const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: String,
  from: String,
  to: String,
  message: String,
  time: Date,
});

module.exports = mongoose.model('Message', messageSchema);
