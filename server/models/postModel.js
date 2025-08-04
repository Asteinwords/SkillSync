const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: {
    url: String,
    type: String,
  },
  theme: {
    type: String,
    enum: ['Announcements', 'Tips', 'Events', 'Challenges', 'Mentors Wanted', 'Learning Requests'],
    default: 'Tips',
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  reactions: {
    like: { type: Number, default: 0 },
    celebrate: { type: Number, default: 0 },
    insightful: { type: Number, default: 0 },
  },
  comments: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  pollOptions: [{ type: String }],
  pollResults: [{ type: Number }],
  pollVotes: { type: Map, of: Number },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);