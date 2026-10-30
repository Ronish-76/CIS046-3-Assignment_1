/**
 * Auth Service
 * Handles user registration, login and password verification.
 * Uses Node.js built-in 'crypto' (no extra npm packages required).
 *
 * Passwords are stored as HMAC-SHA256(password, uniqueSalt) — never in plain text.
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const DATA_DIR   = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf8');
  }
}

function readData() {
  ensureUsersFile();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return { users: [] };
  }
}

function writeData(data) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/** Generate a random 32-char hex salt */
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/** HMAC-SHA256 hash using the user's unique salt */
function hashPassword(password, salt) {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

/** Find a user record by username (case-insensitive) */
function findUser(username) {
  const data = readData();
  return data.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase().trim()
  ) || null;
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 * @returns {{ username, role }} safe public user object
 */
function register(username, password, role = 'player') {
  const trimmed = (username || '').trim();

  if (trimmed.length < 2 || trimmed.length > 30) {
    throw new Error('Username must be between 2 and 30 characters.');
  }
  if (!/^[a-zA-Z0-9_ ]+$/.test(trimmed)) {
    throw new Error('Username can only contain letters, numbers, spaces and underscores.');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters.');
  }

  const existing = findUser(trimmed);
  if (existing) {
    throw new Error(`Username "${trimmed}" is already taken. Please choose another.`);
  }

  const salt         = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const assignedRole = role === 'admin' ? 'admin' : 'player';

  const data = readData();
  data.users.push({
    username: trimmed,
    role: assignedRole,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  });
  writeData(data);

  return { username: trimmed, role: assignedRole };
}

/**
 * Verify credentials and return safe user object on success.
 * @throws {Error} if credentials are invalid
 */
function login(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required.');
  }

  const user = findUser(username);
  if (!user) {
    throw new Error('Invalid username or password.');
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    throw new Error('Invalid username or password.');
  }

  return { username: user.username, role: user.role };
}

/**
 * Check whether a username is already registered.
 */
function usernameExists(username) {
  return !!findUser(username);
}

module.exports = { register, login, usernameExists };

