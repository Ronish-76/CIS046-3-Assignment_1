const bananaApiService = require('./BananaApiService');
const scoreRepository = require('../repositories/ScoreRepository');
const userRepository = require('../repositories/UserRepository');

class GameEngineService {
  async initPuzzleSession(req, difficulty = 'easy', forceOffline = false) {
    const rules = bananaApiService.getDifficultyRules(difficulty);
    const puzzle = await bananaApiService.fetchPuzzle(forceOffline);

    // Securely cache the solution and timestamp on the server session
    req.session.currentPuzzle = {
      solution: puzzle.solution,
      startedAt: Date.now(),
      difficulty: rules.difficulty,
      timeLimitSeconds: rules.timeLimitSeconds,
      basePoints: rules.basePoints,
      streakMultiplierEnabled: rules.streakMultiplierEnabled
    };

    // Initialize session counters if not present
    if (req.session.score === undefined) req.session.score = 0;
    if (req.session.streak === undefined) req.session.streak = 0;
    if (req.session.played === undefined) req.session.played = 0;

    // Return to client WITHOUT solution
    return {
      question: puzzle.question,
      difficulty: rules.difficulty,
      timeLimitSeconds: rules.timeLimitSeconds,
      basePoints: rules.basePoints,
      source: puzzle.source,
      message: puzzle.message,
      sessionStats: {
        score: req.session.score,
        streak: req.session.streak,
        played: req.session.played
      }
    };
  }

  async evaluateAnswer(req, numericAnswer, clientReportedTimeMs = 0) {
    const puzzle = req.session.currentPuzzle;

    if (!puzzle || puzzle.solution === undefined) {
      throw new Error('No active puzzle found. Please request a new puzzle first.');
    }

    const now = Date.now();
    const serverTimeTakenMs = now - puzzle.startedAt;
    // Use server-side time with small buffer (1200ms) for latency
    const timeTakenMs = Math.max(serverTimeTakenMs, clientReportedTimeMs || 0);

    const isExplicitTimeout = (numericAnswer === 999);
    const timeLimitMs = (puzzle.timeLimitSeconds * 1000) + 1200; // 1.2s network grace
    const isTimedOut = isExplicitTimeout || (serverTimeTakenMs > timeLimitMs);

    const expectedSolution = puzzle.solution;
    let isCorrect = (!isTimedOut && numericAnswer === expectedSolution);

    req.session.played = (req.session.played || 0) + 1;

    let pointsAwarded = 0;
    let streakBonus = 0;

    if (isCorrect) {
      req.session.streak = (req.session.streak || 0) + 1;

      if (puzzle.streakMultiplierEnabled && req.session.streak > 1) {
        streakBonus = Math.min((req.session.streak - 1) * 5, 25); // cap bonus at +25
      }

      pointsAwarded = puzzle.basePoints + streakBonus;
      req.session.score = (req.session.score || 0) + pointsAwarded;
    } else {
      req.session.streak = 0;
    }

    // Clear active puzzle
    req.session.currentPuzzle = null;

    // Persist attempt to MongoDB if user is authenticated
    let sessionRecord = null;
    const userId = req.session.user ? req.session.user.id : null;

    if (userId) {
      sessionRecord = await scoreRepository.recordAttempt({
        userId,
        difficulty: puzzle.difficulty,
        timeTakenMs,
        isCorrect,
        pointsAwarded,
        userAnswer: numericAnswer,
        expectedSolution
      });

      await userRepository.updateStats(userId, {
        points: pointsAwarded,
        isCorrect,
        currentStreak: req.session.streak
      });
    }

    return {
      correct: isCorrect,
      isTimedOut,
      userAnswer: numericAnswer,
      solution: expectedSolution,
      pointsAwarded,
      streakBonus,
      timeTakenMs,
      feedback: isCorrect
        ? `Correct! +${pointsAwarded} pts${streakBonus > 0 ? ` (Includes +${streakBonus} streak bonus)` : ''}`
        : (isTimedOut ? 'Time Expired! No points awarded.' : `Incorrect. The correct answer was ${expectedSolution}.`),
      sessionStats: {
        score: req.session.score,
        streak: req.session.streak,
        played: req.session.played
      }
    };
  }

  resetSession(req) {
    req.session.score = 0;
    req.session.streak = 0;
    req.session.played = 0;
    req.session.currentPuzzle = null;

    return {
      score: 0,
      streak: 0,
      played: 0
    };
  }
}

module.exports = new GameEngineService();

