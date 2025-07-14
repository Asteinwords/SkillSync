const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // e.g., 2025-07-05
    time: { type: String, required: true }, // e.g., 15:00
    duration: { type: String, required: true }, // e.g., 1h
    description: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
     meetLink: { type: String }, 
     meetingId: { type: String }, // ✅ new
  meetingPassword: { type: String },
    requesterFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String
    },
    recipientFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String
    },
    status: {
  type: String,
  enum: ['pending', 'accepted', 'rejected', 'done'], // ✅ add 'done' here
  default: 'pending'
},

}, {
    timestamps: true,
});

module.exports = mongoose.model('Session', sessionSchema);
