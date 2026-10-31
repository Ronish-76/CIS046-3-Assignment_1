/**
 * Leaderboard Service — MongoDB / Mongoose implementation
 * Persistent high score storage in MongoDB.
 */

const Score = require('./models/Score');

/**
 * Submit (or update) a player's score on the leaderboard.
 * Keeps personal best score.
 *
 * @param {string} username
 * @param {string} role
 * @param {number} score
 * @param {number} played
 * @param {number} streak
 * @returns {Promise<{ rank: number, entry: object }>}
 */
async function submitScore(username, role, score, played, streak) {
  if (!username || score === undefined) {
    throw new Error('Username and score are required to submit to the leaderboard.');
  }

  const cleanName = username.trim();
  const existing = await Score.findOne({
    username: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  });

  const now = new Date();

  if (existing) {
    if (score >= existing.score) {
      existing.score = score;
      existing.role = role || existing.role;
      existing.played = played;
      existing.bestStreak = Math.max(existing.bestStreak || 0, streak);
      existing.lastPlayed = now;
      existing.gamesSubmitted = (existing.gamesSubmitted || 0) + 1;
    } else {
      existing.lastPlayed = now;
      existing.bestStreak = Math.max(existing.bestStreak || 0, streak);
      existing.gamesSubmitted = (existing.gamesSubmitted || 0) + 1;
    }
    await existing.save();
  } else {
    await Score.create({
      username: cleanName,
      role: role || 'player',
      score,
      played,
      bestStreak: streak,
      gamesSubmitted: 1,
      firstPlayed: now,
      lastPlayed: now
    });
  }

  // Calculate player rank
  return await getPlayerRank(cleanName);
}

/**
 * Return top N players sorted by score descending, then bestStreak descending.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getTopScores(limit = 10) {
  const topList = await Score.find()
    .sort({ score: -1, bestStreak: -1 })
    .limit(limit)
    .lean();

  return topList.map((entry, idx) => ({
    rank: idx + 1,
    ...entry
  }));
}

/**
 * Get rank and entry for a specific player.
 * @param {string} username
 * @returns {Promise<{ rank: number, entry: object } | null>}
 */
async function getPlayerRank(username) {
  if (!username) return null;

  const cleanName = username.trim();
  const target = await Score.findOne({
    username: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  }).lean();

  if (!target) return null;

  // Rank is 1 + count of players with higher score (or equal score with higher streak)
  const higherCount = await Score.countDocuments({
    $or: [
      { score: { $gt: target.score } },
      { score: target.score, bestStreak: { $gt: target.bestStreak || 0 } }
    ]
  });

  return {
    rank: higherCount + 1,
    entry: target
  };
}

/**
 * Clear all leaderboard entries (admin / demo tool).
 */
async function clearLeaderboard() {
  await Score.deleteMany({});
}

module.exports = {
  submitScore,
  getTopScores,
  getPlayerRank,
  clearLeaderboard
};
