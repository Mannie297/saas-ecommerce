import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get user details
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 7 characters): ');

    // Validate input
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password.length < 7) {
      throw new Error('Password must be at least 7 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with this email');
      if (existingUser.role === 'admin') {
        console.log('User is already an admin');
      } else {
        const makeAdmin = await question('Make this user an admin? (y/n): ');
        if (makeAdmin.toLowerCase() === 'y') {
          existingUser.role = 'admin';
          await existingUser.save();
          console.log('User has been made an admin');
        }
      }
    } else {
      // Create new admin user
      const user = new User({
        name,
        email,
        password,
        role: 'admin'
      });

      await user.save();
      console.log('Admin user created successfully:', {
        name: user.name,
        email: user.email,
        role: user.role
      });
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    await mongoose.disconnect();
    rl.close();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
createAdminUser(); 