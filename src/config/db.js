const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Auto-load .env file if present
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const getMongoUri = () => {
  return process.env.MONGODB_URI || 'mongodb://localhost:27017/banana_puzzle_game';
};

async function connectDB() {
  const uri = getMongoUri();

  if (uri.includes('<db_password>') || uri.includes('<password>')) {
    console.error('\n⚠️  CONFIG ERROR: Please update <db_password> in your .env file with your actual MongoDB Atlas password.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    const masked = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`✅ MongoDB Connection Pool Active → ${masked}`);
  } catch (err) {
    console.error('\n❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost. Attempting reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully.');
  });
}

module.exports = { connectDB, getMongoUri };

