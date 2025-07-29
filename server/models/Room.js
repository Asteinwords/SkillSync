// const mongoose = require('mongoose');

// const roomSchema = new mongoose.Schema({
//   roomId: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//  participants: [
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     joinedAt: { type: Date, default: Date.now },
//     leftAt: { type: Date, default: null }
//   }

//   ],
//   ended: { type: Boolean, default: false },

//   isRecording: { type: Boolean, default: false },
//   recordRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
// }, { timestamps: true });

// module.exports = mongoose.model('Room', roomSchema);
// const mongoose = require('mongoose');

// const roomSchema = new mongoose.Schema({
//   roomId: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   participants: [
//     {
//       user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//       joinedAt: { type: Date, default: Date.now },
//       leftAt: { type: Date, default: null }
//     }
//   ],
//   ended: { type: Boolean, default: false },
//   isRecording: { type: Boolean, default: false },
//   recordRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   screenSharingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
// }, { timestamps: true });

// roomSchema.index({ roomId: 1 });
// roomSchema.index({ 'participants.user': 1 });

const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  roomId: { type: String, unique: true, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now },
      leftAt: { type: Date },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  totalParticipants: { type: Number, default: 1 },
});

module.exports = mongoose.model('Room', RoomSchema);

// module.exports = mongoose.model('Room', roomSchema);