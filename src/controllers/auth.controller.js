const authService = require('../services/AuthService');

class AuthController {
  async register(req, res) {
    try {
      const { email, displayName, password } = req.body;
      const user = await authService.register(email, displayName, password);

      req.session.user = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      };

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        user: req.session.user
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);

      req.session.user = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      };

      res.json({
        success: true,
        message: 'Signed in successfully.',
        user: req.session.user
      });
    } catch (err) {
      res.status(401).json({ success: false, error: err.message });
    }
  }

  async logout(req, res) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Could not log out.' });
      }
      res.clearCookie('banana_sid');
      res.json({ success: true, message: 'Logged out successfully.' });
    });
  }

  async getCurrentUser(req, res) {
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    res.json({
      success: true,
      user: req.session.user,
      sessionStats: {
        score: req.session.score || 0,
        streak: req.session.streak || 0,
        played: req.session.played || 0
      }
    });
  }
}

module.exports = new AuthController();

