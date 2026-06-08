import './config/env.config.js';
import connectDB from './config/db.js';
import User from './models/user.model.js';
import bcrypt from 'bcrypt';

async function createAdmin() {
  await connectDB();

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
    process.exit(0);
  }

  const saltRound = 10;
  const hashedPassword = bcrypt.hashSync('admin123!', saltRound);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@glacystore.com',
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`Admin created: ${admin.email} / password: admin123!`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
