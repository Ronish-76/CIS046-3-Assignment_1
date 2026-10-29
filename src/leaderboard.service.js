/**
 * Leaderboard Service
 * Provides persistent, file-based high score storage so players compete
 * across sessions and page refreshes — no external database needed.
 *
 * Demonstrates:
 * - Persistent server-side state (beyond session scope)
 * - File I/O for lightweight data persistence
 * - Sorted ranking across multiple named virtual identities
 */

const fs   = require('fs');
const path = require('path');

// Store leaderboard.json inside the project's /data folder
const DATA_DIR  = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard.json');

// ────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────

/**
 * Ensure /data directory and leaderboard.json exist.
 */
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ scores: [] }, null, 2), 'utf8');
  }
}

/**
 * Read all scores from disk.
 * @returns {{ scores: Array }} parsed JSON object
 */
function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { scores: [] };
  }
}

/**
 * Persist scores array back to disk.
 * @param {{ scores: Array }} data
 */
function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

/**
 * Submit (or update) a player's score on the leaderboard.
 * If the player already has an entry, we keep the HIGHER score.
 *
 * @param {string} username
 * @param {string} role        - 'player' | 'admin'
 * @param {number} score       - total points earned this session
 * @param {number} played      - puzzles attempted this session
 * @param {number} streak      - best streak this session
 * @returns {{ rank: number, entry: object }}
 */
function submitScore(username, role, score, played, streak) {
  if (!username || score === undefined) {
    throw new Error('Username and score are required to submit to the leaderboard.');
  }

  const data = readData();

  // Find existing entry for this username (case-insensitive)
  const existingIdx = data.scores.findIndex(
    (s) => s.username.toLowerCase() === username.toLowerCase()
  );

  const now = new Date().toISOString();

  if (existingIdx !== -1) {
    const existing = data.scores[existingIdx];
    // Keep personal best score; update other fields if this session was better
    if (score >= existing.score) {
      data.scores[existingIdx] = {
        username: username,
        role,
        score,
        played,
        bestStreak: Math.max(existing.bestStreak || 0, streak),
        lastPlayed: now,
        firstPlayed: existing.firstPlayed || now,
        gamesSubmitted: (existing.gamesSubmitted || 0) + 1
      };
    } else {
      // Score is lower — still update lastPlayed and totalGames
      data.scores[existingIdx].lastPlayed    = now;
      data.scores[existingIdx].bestStreak    = Math.max(existing.bestStreak || 0, streak);
      data.scores[existingIdx].gamesSubmitted = (existing.gamesSubmitted || 0) + 1;
    }
  } else {
    // New player entry
    data.scores.push({
      username,
      role,
      score,
      played,
      bestStreak: streak,
      lastPlayed: now,
      firstPlayed: now,
      gamesSubmitted: 1
    });
  }

  // Sort descending by score, then by bestStreak as tiebreaker
  data.scores.sort((a, b) => b.score - a.score || b.bestStreak - a.bestStreak);

  writeData(data);

  // Return this player's rank (1-based)
  const rank = data.scores.findIndex(
    (s) => s.username.toLowerCase() === username.toLowerCase()
  ) + 1;

  return { rank, entry: data.scores[rank - 1] };
}

/**
 * Return the top N players on the leaderboard.
 * @param {number} limit - defaults to 10
 * @returns {Array}
 */
function getTopScores(limit = 10) {
  const data = readData();
  return data.scores.slice(0, limit).map((entry, idx) => ({
    rank: idx + 1,
    ...entry
  }));
}

/**
 * Get a specific player's leaderboard entry and rank.
 * @param {string} username
 * @returns {{ rank: number, entry: object } | null}
 */
function getPlayerRank(username) {
  if (!username) return null;
  const data = readData();
  const idx  = data.scores.findIndex(
    (s) => s.username.toLowerCase() === username.toLowerCase()
  );
  if (idx === -1) return null;
  return { rank: idx + 1, entry: data.scores[idx] };
}

/**
 * Clear all leaderboard data (admin / demo helper).
 */
function clearLeaderboard() {
  writeData({ scores: [] });
}

module.exports = {
  submitScore,
  getTopScores,
  getPlayerRank,
  clearLeaderboard
};

