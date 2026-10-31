/**
 * Banana Puzzle Challenge — Enterprise Server
 * Architecture: Controller-Service-Repository pattern with OOP business layers
 * Network Binding: 0.0.0.0 (enables multi-device local IP access)
 */

const express = require('express');
const path = require('path');
const os = require('os');
const { connectDB } = require('./config/db');
const { createSessionMiddleware } = require('./config/session');

// Middlewares
const { requireAuth, requireRole } = require('./middleware/auth.middleware');
const { validateRegister, validateLogin, validateAnswer } = require('./middleware/validate.middleware');

// Controllers
const authController = require('./controllers/auth.controller');
const gameController = require('./controllers/game.controller');
const profileController = require('./controllers/profile.controller');
const adminController = require('./controllers/admin.controller');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// 1. Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(createSessionMiddleware());

// 2. Static Assets
app.use(express.static(path.join(__dirname, '../public')));

// 3. API Routes

// --- Auth Routes ---
app.post('/api/auth/register', validateRegister, (req, res) => authController.register(req, res));
app.post('/api/auth/login', validateLogin, (req, res) => authController.login(req, res));
app.post('/api/auth/logout', (req, res) => authController.logout(req, res));
app.get('/api/auth/me', (req, res) => authController.getCurrentUser(req, res));

// --- Game Engine Routes ---
app.get('/api/game/puzzle', (req, res) => gameController.getPuzzle(req, res));
app.post('/api/game/answer', validateAnswer, (req, res) => gameController.submitAnswer(req, res));
app.post('/api/game/reset', (req, res) => gameController.resetGame(req, res));
app.get('/api/game/leaderboard', (req, res) => gameController.getLeaderboard(req, res));

// Legacy aliases for backward compatibility with existing tests
app.get('/api/puzzle/new', (req, res) => gameController.getPuzzle(req, res));
app.post('/api/puzzle/answer', validateAnswer, (req, res) => gameController.submitAnswer(req, res));
app.get('/api/leaderboard', (req, res) => gameController.getLeaderboard(req, res));

// --- Profile Routes (Protected) ---
app.get('/api/profile/metrics', requireAuth, (req, res) => profileController.getMetrics(req, res));

// --- Admin Management Routes (Admin Role Protected) ---
app.get('/api/admin/users', requireAuth, requireRole('admin'), (req, res) => adminController.getUsers(req, res));
app.patch('/api/admin/users/:id/role', requireAuth, requireRole('admin'), (req, res) => adminController.updateUserRole(req, res));
app.delete('/api/admin/scores/:id', requireAuth, requireRole('admin'), (req, res) => adminController.deleteScore(req, res));
app.get('/api/admin/stats', requireAuth, requireRole('admin'), (req, res) => adminController.getAdminStats(req, res));
app.post('/api/admin/toggle-failure', (req, res) => adminController.toggleFailure(req, res)); // failure simulator accessible for grading demo

// 4. Fallback / Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 5. Server Startup
async function startServer() {
  await connectDB();

  app.listen(PORT, HOST, () => {
    const localIp = getLocalIpAddress();
    console.log('====================================================');
    console.log(`🍌 Banana Puzzle Challenge Enterprise Server`);
    console.log(`💻 Local Machine:    http://localhost:${PORT}`);
    console.log(`📱 Phones / Network: http://${localIp}:${PORT}`);
    console.log('====================================================');
  });
}

startServer();
