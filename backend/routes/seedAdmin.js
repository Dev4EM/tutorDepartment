require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ workEmail: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = new User({
      prefix: 'Mr.',
      firstName: 'Admin',
      lastName: 'User',
      workEmail: adminEmail,
      password: hashedPassword,
      userType: 'admin',
      employmentStatus: 'Active',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

seedAdmin();
