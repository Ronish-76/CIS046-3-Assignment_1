const session = require('express-session');
const { getMongoUri } = require('./db');

let MongoStore;
try {
  MongoStore = require('connect-mongo');
} catch (err) {
  // connect-mongo not yet installed; fallback gracefully
  MongoStore = null;
}

function createSessionMiddleware() {
  const sessionConfig = {
    name: 'banana_sid',
    secret: process.env.SESSION_SECRET || 'banana_enterprise_secret_cis046_secure_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if served behind HTTPS reverse proxy
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 // 24-hour persistent session
    }
  };

  if (MongoStore && typeof MongoStore.create === 'function') {
    sessionConfig.store = MongoStore.create({
      mongoUrl: getMongoUri(),
      collectionName: 'sessions',
      ttl: 60 * 60 * 24, // 1 day
      autoRemove: 'native'
    });
    console.log('📦 Session Store: MongoDB (connect-mongo)');
  } else {
    console.log('📦 Session Store: In-memory (Install connect-mongo for persistent sessions)');
  }

  return session(sessionConfig);
}

module.exports = { createSessionMiddleware };

