/**
 * Express Server for Banana Puzzle Game
 * Demonstrates:
 * 1. Distributed architecture (Client <-> Node/Express Backend <-> Banana Remote API)
 * 2. Virtual Identity (Session management, user authentication & role checks)
 * 3. Security (Solution hidden on backend, preventing inspect-element cheat)
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const bananaService = require('./banana.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management for Virtual Identity and Game State
app.use(session({
  name: 'banana_session_id',
  secret: 'banana_quiz_secret_cis046_sfe_2026',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // Prevents client-side scripts from reading cookie (security best practice)
    secure: false,  // Set true if running behind HTTPS in production
    maxAge: 1000 * 60 * 60 * 2 // 2-hour session
  }
}));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Middleware: Initialize user session defaults
 */
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = {
      username: 'Guest Explorer',
      role: 'guest',
      isLoggedIn: false
    };
  }
  if (req.session.score === undefined) {
    req.session.score = 0;
    req.session.streak = 0;
    req.session.played = 0;
    req.session.history = [];
  }
  next();
});

// ==========================================
// 1. VIRTUAL IDENTITY ROUTES (Theme: Identity & Sessions)
// ==========================================

/**
 * Get current session profile and stats
 */
app.get('/api/session', (req, res) => {
  res.json({
    user: req.session.user,
    stats: {
      score: req.session.score,
      streak: req.session.streak,
      played: req.session.played
    },
    hasActivePuzzle: req.session.currentSolution !== undefined
  });
});

/**
 * Log in / Establish Virtual Identity
 */
app.post('/api/session/login', (req, res) => {
  const { username, role } = req.body;
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }

  const assignedRole = (role === 'admin' || role === 'tutor') ? 'admin' : 'player';

  req.session.user = {
    username: username.trim(),
    role: assignedRole,
    isLoggedIn: true,
    loginTime: new Date().toISOString()
  };

  res.json({
    message: `Welcome, ${req.session.user.username}!`,
    user: req.session.user,
    stats: {
      score: req.session.score,
      streak: req.session.streak,
      played: req.session.played
    }
  });
});

/**
 * Log out / Clear Virtual Identity
 */
app.post('/api/session/logout', (req, res) => {
  req.session.user = {
    username: 'Guest Explorer',
    role: 'guest',
    isLoggedIn: false
  };
  req.session.score = 0;
  req.session.streak = 0;
  req.session.played = 0;
  req.session.currentSolution = undefined;
  req.session.currentQuestion = undefined;

  res.json({ message: 'Logged out successfully', user: req.session.user });
});

// ==========================================
// 2. PUZZLE INTEROPERABILITY ROUTES (Theme: Interoperability)
// ==========================================

/**
 * Fetch a new puzzle from the Banana API
 * Crucial Security & Architecture Principle:
 * The Banana API returns { question, solution }.
 * The backend stores the solution in req.session.currentSolution
 * and ONLY sends the question image URL to the client.
 */
app.get('/api/puzzle/new', async (req, res) => {
  try {
    const forceOffline = req.query.offline === 'true';
    const puzzle = await bananaService.fetchPuzzle(forceOffline);

    // Securely retain solution in server session
    req.session.currentSolution = puzzle.solution;
    req.session.currentQuestion = puzzle.question;
    req.session.puzzleLoadedAt = Date.now();

    res.json({
      success: true,
      question: puzzle.question,
      source: puzzle.source,
      message: puzzle.message || 'Puzzle retrieved successfully',
      stats: {
        score: req.session.score,
        streak: req.session.streak,
        played: req.session.played
      }
    });
  } catch (err) {
    console.error('Error fetching Banana puzzle:', err.message);
    res.status(503).json({
      success: false,
      error: 'External Banana API service is unavailable',
      details: err.message,
      canRetry: true
    });
  }
});

/**
 * Submit and validate player answer (Theme: Event-Driven & Distributed Validation)
 */
app.post('/api/puzzle/answer', (req, res) => {
  const { answer } = req.body;

  if (req.session.currentSolution === undefined) {
    return res.status(400).json({
      success: false,
      error: 'No active puzzle found. Please load a new puzzle first.'
    });
  }

  if (answer === undefined || answer === null || String(answer).trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid answer (single number 0-9).'
    });
  }

  const numericAnswer = parseInt(answer, 10);
  if (isNaN(numericAnswer)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input. Please enter a valid integer.'
    });
  }

  const expectedSolution = req.session.currentSolution;
  const isCorrect = numericAnswer === expectedSolution;

  req.session.played += 1;

  if (isCorrect) {
    req.session.score += 10;
    req.session.streak += 1;
  } else {
    req.session.streak = 0;
  }

  // Clear current solution so same puzzle cannot be submitted repeatedly
  req.session.currentSolution = undefined;

  res.json({
    success: true,
    correct: isCorrect,
    userAnswer: numericAnswer,
    solution: expectedSolution,
    feedback: isCorrect
      ? '🎉 Correct! Well done! (+10 pts)'
      : `❌ Incorrect. The correct answer was ${expectedSolution}.`,
    stats: {
      score: req.session.score,
      streak: req.session.streak,
      played: req.session.played
    }
  });
});

/**
 * Reset game session statistics
 */
app.post('/api/session/reset', (req, res) => {
  req.session.score = 0;
  req.session.streak = 0;
  req.session.played = 0;
  req.session.currentSolution = undefined;
  req.session.currentQuestion = undefined;

  res.json({
    message: 'Game session reset',
    stats: {
      score: 0,
      streak: 0,
      played: 0
    }
  });
});

// ==========================================
// 3. ADMIN / DEMONSTRATION TOOLS (Theme: Testing & Error Scenarios)
// ==========================================

/**
 * Toggle API failure simulation
 * Demonstrates: Step 3 "Test a failure or unavailable-service scenario"
 */
app.post('/api/admin/toggle-failure', (req, res) => {
  const { simulate } = req.body;
  const currentStatus = bananaService.setSimulateFailure(simulate);
  res.json({
    simulateApiFailure: currentStatus,
    message: currentStatus
      ? 'Simulated API failure is now ACTIVE (Banana API calls will intentionally fail to test error handling)'
      : 'Simulated API failure is DEACTIVATED (normal operation restored)'
  });
});

/**
 * Get system status and API health
 */
app.get('/api/admin/status', (req, res) => {
  res.json({
    uptime: process.uptime(),
    nodeVersion: process.version,
    apiStatus: bananaService.getApiStatus(),
    sessionUser: req.session.user
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🍌 Banana Puzzle Game Server running!`);
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`👉 Primary API: ${bananaService.PRIMARY_URL}`);
  console.log(`👉 Mirror API:  ${bananaService.MIRROR_URL}`);
  console.log(`===============================================`);
});
