const statsService = require('../services/StatsService');

class ProfileController {
  async getMetrics(req, res) {
    try {
      const userId = req.session.user.id;
      const metrics = await statsService.getUserMetrics(userId);

      res.json({
        success: true,
        metrics
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: 'Unable to calculate profile metrics.',
        details: err.message
      });
    }
  }
}

module.exports = new ProfileController();

