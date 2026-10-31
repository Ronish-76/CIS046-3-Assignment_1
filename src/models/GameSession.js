const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
    index: true
  },
  timeTakenMs: {
    type: Number,
    required: true,
    min: 0
  },
  isCorrect: {
    type: Boolean,
    required: true,
    index: true
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  userAnswer: {
    type: Number
  },
  expectedSolution: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);

