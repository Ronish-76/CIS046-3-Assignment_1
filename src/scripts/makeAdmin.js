/**
 * Admin Role Promotion Script
 * Usage:
 *   node src/scripts/makeAdmin.js <email>
 */

const path = require('path');
const { connectDB } = require('../config/db');
const User = require('../models/User');

async function promoteToAdmin() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.log('\n❌ Usage: node src/scripts/makeAdmin.js <email>');
    console.log('👉 Example: node src/scripts/makeAdmin.js player@example.com\n');
    process.exit(1);
  }

  await connectDB();

  const email = targetEmail.trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    console.log(`\n❌ User with email "${email}" not found in database.`);
    console.log('👉 Please register this account on the website first (http://localhost:3000/login.html).\n');
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();

  console.log('====================================================');
  console.log(`✅ SUCCESS: ${user.displayName} (${user.email}) is now an ADMIN!`);
  console.log(`👉 Log out and log back in at http://localhost:3000 to access the Admin Panel.`);
  console.log('====================================================\n');

  process.exit(0);
}

promoteToAdmin();

