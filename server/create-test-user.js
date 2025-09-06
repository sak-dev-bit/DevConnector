const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    let existingUser = await User.findOne({ email: 'testuser@devconnector.com' });
    if (existingUser) {
      console.log('Test user already exists, deleting...');
      await User.findByIdAndDelete(existingUser._id);
    }

    // Create new test user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const testUser = new User({
      name: 'Test User',
      email: 'testuser@devconnector.com',
      password: hashedPassword
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: testuser@devconnector.com');
    console.log('🔑 Password: password123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser();