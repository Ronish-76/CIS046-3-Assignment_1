const User = require('../models/User');
const userRepository = require('../repositories/UserRepository');

class AuthService {
  async register(email, displayName, password, role = 'player') {
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    const existingName = await userRepository.findByDisplayName(displayName);
    if (existingName) {
      throw new Error(`The display name "${displayName}" is already claimed.`);
    }

    const salt = User.generateSalt();
    const passwordHash = User.hashPassword(password, salt);

    const user = await userRepository.create({
      email,
      displayName,
      passwordHash,
      salt,
      role: role === 'admin' ? 'admin' : 'player'
    });

    return {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = user.verifyPassword(password);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    return {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };
  }

  async getUserById(id) {
    return userRepository.findById(id);
  }
}

module.exports = new AuthService();

