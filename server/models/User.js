const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Email is invalid'],
  },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastVisited: { type: Date },
  visits: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  profileImage: { type: String, default: '' },
  aboutMe: { type: String },
  education: [
    {
      degree: String,
      institute: String,
      year: String,
    },
  ],
  skillsOffered: [
    {
      skill: String,
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Expert'],
        default: 'Beginner',
      },
    },
  ],
  badge: {
    type: String,
    enum: {
      values: ['Beginner', 'Contributor', 'Mentor', 'Expert'],
      message: '{VALUE} is not a valid badge',
    },
    default: 'Beginner',
  },
  skillsWanted: [
    {
      skill: String,
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Expert'],
        default: 'Beginner',
      },
    },
  ],
  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);