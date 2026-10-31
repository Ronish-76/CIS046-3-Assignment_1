const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  role: {
    type: String,
    enum: ['player', 'admin'],
    default: 'player'
  },
  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  totalPuzzlesSolved: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method for scrypt password hashing
userSchema.statics.hashPassword = function (password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
};

userSchema.statics.generateSalt = function () {
  return crypto.randomBytes(16).toString('hex');
};

userSchema.methods.verifyPassword = function (password) {
  const hash = crypto.scryptSync(password, this.salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(this.passwordHash, 'hex'), Buffer.from(hash, 'hex'));
};

module.exports = mongoose.model('User', userSchema);
