const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // e.g., 2025-07-29
  time: { type: String, required: true }, // e.g., 20:00
  endTime: { type: String, required: true }, // e.g., 21:00
  duration: { type: String, required: true }, // e.g., 1h
  description: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'done'], default: 'pending' },
  meetLink: { type: String },
  meetingId: { type: String },
  meetingPassword: { type: String },
  pastRoom: {
    hostName: { type: String },
    participantName: { type: String },
    requesterJoinTime: { type: String },
    requesterLeaveTime: { type: String },
    recipientJoinTime: { type: String },
    recipientLeaveTime: { type: String }
  },
  requesterFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  },
  recipientFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Session', sessionSchema);