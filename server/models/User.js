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
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // incoming requests

  skillsOffered: [
  {
    skill: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Beginner'
    }
  }
],
points: { type: Number, default: 0 },
  badge: {
    type: String,
    enum: ['Beginner', 'Contributor', 'Mentor', 'Expert'],
    default: 'Beginner',
  },
skillsWanted: [
  {
    skill: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Beginner'
    }
  }
],

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
