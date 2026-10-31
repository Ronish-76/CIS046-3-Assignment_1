const gameEngineService = require('../services/GameEngineService');
const statsService = require('../services/StatsService');

class GameController {
  async getPuzzle(req, res) {
    try {
      const difficulty = req.query.difficulty || 'easy';
      const forceOffline = req.query.offline === 'true';

      const puzzleData = await gameEngineService.initPuzzleSession(req, difficulty, forceOffline);
      res.json({
        success: true,
        ...puzzleData
      });
    } catch (err) {
      res.status(503).json({
        success: false,
        error: 'Unable to retrieve puzzle.',
        details: err.message
      });
    }
  }

  async submitAnswer(req, res) {
    try {
      const { numericAnswer, timeElapsed } = req.body;
      const result = await gameEngineService.evaluateAnswer(req, numericAnswer, timeElapsed);
      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  resetGame(req, res) {
    const stats = gameEngineService.resetSession(req);
    res.json({
      success: true,
      message: 'Game session stats reset.',
      sessionStats: stats
    });
  }

  async getLeaderboard(req, res) {
    try {
      const difficulty = req.query.difficulty || 'all';
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

      const rankings = await statsService.getLeaderboard(difficulty, limit);
      res.json({
        success: true,
        rankings,
        difficulty
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: 'Could not fetch leaderboard.'
      });
    }
  }
}

module.exports = new GameController();

