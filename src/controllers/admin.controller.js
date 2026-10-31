const userRepository = require('../repositories/UserRepository');
const scoreRepository = require('../repositories/ScoreRepository');
const statsService = require('../services/StatsService');
const bananaApiService = require('../services/BananaApiService');

class AdminController {
  async getUsers(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      res.json({
        success: true,
        users
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Could not fetch user registry.' });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['player', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Role must be player or admin.' });
      }

      const updated = await userRepository.updateRole(id, role);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      res.json({
        success: true,
        message: `User role updated to ${role}.`,
        user: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async deleteScore(req, res) {
    try {
      const { id } = req.params;
      const deleted = await scoreRepository.deleteSession(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Score record not found.' });
      }

      res.json({
        success: true,
        message: 'Suspicious session score purged.'
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getAdminStats(req, res) {
    try {
      const stats = await statsService.getAdminStats();
      const apiStatus = bananaApiService.getStatus();
      res.json({
        success: true,
        stats,
        apiStatus
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  toggleFailure(req, res) {
    const { simulate } = req.body;
    const current = bananaApiService.setSimulateFailure(simulate !== undefined ? simulate : !bananaApiService.simulateFailure);
    res.json({
      success: true,
      simulateFailure: current,
      message: current
        ? 'Simulated Banana API failure is now ACTIVE.'
        : 'Normal external API operation restored.'
    });
  }
}

module.exports = new AdminController();

