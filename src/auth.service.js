/**
 * Auth Service — MongoDB / Mongoose implementation
 * Register/Login using email + password.
 * Passwords hashed with HMAC-SHA256 + unique salt (Node built-in crypto).
 */

const crypto = require('crypto');
const User = require('./models/User');

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Register a new account.
 * @param {string} email
 * @param {string} displayName
 * @param {string} password
 * @param {string} role
 * @returns {Promise<{ email, displayName, role }>}
 */
async function register(email, displayName, password, role = 'player') {
  const trimEmail = (email || '').trim().toLowerCase();
  const trimName  = (displayName || '').trim();

  if (!trimEmail || !isValidEmail(trimEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (trimName.length < 2 || trimName.length > 30) {
    throw new Error('Display name must be between 2 and 30 characters.');
  }
  if (!/^[a-zA-Z0-9_ ]+$/.test(trimName)) {
    throw new Error('Display name can only contain letters, numbers, spaces and underscores.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  // Check email collision
  const existingEmail = await User.findOne({ email: trimEmail });
  if (existingEmail) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  // Check display name collision (case-insensitive)
  const existingName = await User.findOne({
    displayName: { $regex: new RegExp(`^${trimName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  });
  if (existingName) {
    throw new Error(`The display name "${trimName}" is already taken. Please choose another.`);
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const assignedRole = (role === 'admin') ? 'admin' : 'player';

  const newUser = new User({
    email: trimEmail,
    displayName: trimName,
    role: assignedRole,
    passwordHash,
    salt
  });

  await newUser.save();

  return { email: newUser.email, displayName: newUser.displayName, role: newUser.role };
}

/**
 * Authenticate a user by email + password.
 * @returns {Promise<{ email, displayName, role }>}
 */
async function login(email, password) {
  if (!email || !password) throw new Error('Email and password are required.');

  const trimEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: trimEmail });
  if (!user) {
    throw new Error('No account found with that email address.');
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    throw new Error('Incorrect password. Please try again.');
  }

  return { email: user.email, displayName: user.displayName, role: user.role };
}

/**
 * Check whether an email is already registered.
 */
async function emailExists(email) {
  const trimEmail = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: trimEmail });
  return !!user;
}

module.exports = { register, login, emailExists };
