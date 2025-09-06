const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check all users
    const users = await User.find({}, '-password').lean();
    console.log('All users in database:');
    users.forEach(user => {
      console.log(`ID: ${user._id}, Email: ${user.email}, Name: ${user.name}`);
    });

    // Ask for specific email to check
    const emailToCheck = process.argv[2];
    if (emailToCheck) {
      const user = await User.findOne({ email: emailToCheck.toLowerCase() });
      if (user) {
        console.log('\nUser details:');
        console.log(`ID: ${user._id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`Password hash exists: ${!!user.password}`);
        console.log(`Password hash length: ${user.password ? user.password.length : 0}`);
        console.log(`Password hash starts with: ${user.password ? user.password.substring(0, 10) + '...' : 'N/A'}`);
      } else {
        console.log(`\nNo user found with email: ${emailToCheck}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkUser();