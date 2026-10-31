const GameSession = require('../models/GameSession');

class ScoreRepository {
  async recordAttempt({ userId, difficulty, timeTakenMs, isCorrect, pointsAwarded, userAnswer, expectedSolution }) {
    const session = new GameSession({
      userId,
      difficulty,
      timeTakenMs,
      isCorrect,
      pointsAwarded,
      userAnswer,
      expectedSolution
    });
    return session.save();
  }

  async getUserSessions(userId, limit = 20) {
    return GameSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getAllSessions(limit = 100) {
    return GameSession.find()
      .populate('userId', 'displayName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async deleteSession(sessionId) {
    return GameSession.findByIdAndDelete(sessionId);
  }

  async deleteByUserId(userId) {
    return GameSession.deleteMany({ userId });
  }

  async countTotal() {
    return GameSession.countDocuments();
  }
}

module.exports = new ScoreRepository();

