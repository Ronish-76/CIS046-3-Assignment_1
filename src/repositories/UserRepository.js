const User = require('../models/User');

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  async findByDisplayName(displayName) {
    const escaped = displayName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return User.findOne({ displayName: { $regex: new RegExp(`^${escaped}$`, 'i') } });
  }

  async findById(id) {
    return User.findById(id).select('-passwordHash -salt');
  }

  async create({ email, displayName, passwordHash, salt, role = 'player' }) {
    const user = new User({
      email,
      displayName,
      passwordHash,
      salt,
      role
    });
    return user.save();
  }

  async updateStats(userId, { points, isCorrect, currentStreak }) {
    const update = {
      $inc: { totalScore: points }
    };

    if (isCorrect) {
      update.$inc.totalPuzzlesSolved = 1;
    }

    const user = await User.findById(userId);
    if (user && currentStreak > (user.bestStreak || 0)) {
      update.$set = { bestStreak: currentStreak };
    }

    return User.findByIdAndUpdate(userId, update, { new: true });
  }

  async getAllUsers() {
    return User.find().select('-passwordHash -salt').sort({ createdAt: -1 });
  }

  async updateRole(userId, newRole) {
    return User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select('-passwordHash -salt');
  }

  async deleteUser(userId) {
    return User.findByIdAndDelete(userId);
  }

  async countTotal() {
    return User.countDocuments();
  }
}

module.exports = new UserRepository();

