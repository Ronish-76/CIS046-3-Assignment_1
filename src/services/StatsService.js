const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');
const User = require('../models/User');

class StatsService {
  /**
   * MongoDB aggregation pipeline for user metrics:
   * Accuracy = (Correct Attempts / Total Attempts) * 100
   * Average Time = (Sum(timeTakenMs) / (Total Attempts * 1000)) seconds
   */
  async getUserMetrics(userId) {
    const objectId = new mongoose.Types.ObjectId(userId);

    const [summary] = await GameSession.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          totalPoints: { $sum: '$pointsAwarded' },
          totalTimeMs: { $sum: '$timeTakenMs' },
          fastestTimeMs: { $min: { $cond: ['$isCorrect', '$timeTakenMs', 9999999] } }
        }
      },
      {
        $project: {
          totalAttempts: 1,
          correctAttempts: 1,
          totalPoints: 1,
          accuracy: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              { $multiply: [{ $divide: ['$correctAttempts', '$totalAttempts'] }, 100] },
              0
            ]
          },
          avgTimeSeconds: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              { $divide: [{ $divide: ['$totalTimeMs', '$totalAttempts'] }, 1000] },
              0
            ]
          },
          fastestTimeSeconds: {
            $cond: [
              { $lt: ['$fastestTimeMs', 9999999] },
              { $divide: ['$fastestTimeMs', 1000] },
              0
            ]
          }
        }
      }
    ]);

    // Breakdown by difficulty
    const difficultyBreakdown = await GameSession.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: '$difficulty',
          attempts: { $sum: 1 },
          solved: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          totalPoints: { $sum: '$pointsAwarded' },
          avgTimeMs: { $avg: '$timeTakenMs' }
        }
      }
    ]);

    // Recent attempts log
    const recentSessions = await GameSession.find({ userId: objectId })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const user = await User.findById(objectId).select('displayName email role totalScore totalPuzzlesSolved bestStreak createdAt');

    return {
      user,
      summary: summary || {
        totalAttempts: 0,
        correctAttempts: 0,
        totalPoints: 0,
        accuracy: 0,
        avgTimeSeconds: 0,
        fastestTimeSeconds: 0
      },
      difficultyBreakdown,
      recentSessions
    };
  }

  /**
   * Leaderboard aggregation with optional difficulty filtering
   */
  async getLeaderboard(difficulty = 'all', limit = 20) {
    const match = {};
    if (difficulty && difficulty !== 'all') {
      match.difficulty = difficulty;
    }

    const leaderboard = await GameSession.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$pointsAwarded' },
          totalAttempts: { $sum: 1 },
          solvedCount: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          avgTimeMs: { $avg: '$timeTakenMs' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          displayName: '$user.displayName',
          role: '$user.role',
          totalPoints: 1,
          solvedCount: 1,
          totalAttempts: 1,
          bestStreak: '$user.bestStreak',
          accuracy: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              { $multiply: [{ $divide: ['$solvedCount', '$totalAttempts'] }, 100] },
              0
            ]
          },
          avgTimeSeconds: { $divide: ['$avgTimeMs', 1000] }
        }
      },
      { $sort: { totalPoints: -1, solvedCount: -1, accuracy: -1 } },
      { $limit: limit }
    ]);

    return leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
      accuracy: Number(entry.accuracy.toFixed(1)),
      avgTimeSeconds: Number(entry.avgTimeSeconds.toFixed(2))
    }));
  }

  /**
   * System-wide statistics for the admin dashboard
   */
  async getAdminStats() {
    const totalUsers = await User.countDocuments();
    const totalSessions = await GameSession.countDocuments();
    const [pointsAgg] = await GameSession.aggregate([
      { $group: { _id: null, totalPointsAwarded: { $sum: '$pointsAwarded' } } }
    ]);

    const recentGlobalSessions = await GameSession.find()
      .populate('userId', 'displayName email role')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return {
      totalUsers,
      totalSessions,
      totalPointsAwarded: pointsAgg ? pointsAgg.totalPointsAwarded : 0,
      recentGlobalSessions
    };
  }
}

module.exports = new StatsService();

