import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Test user credentials
    const testUser = {
      email: 'admin@example.com',
      password: 'admin123'
    };

    // Find or create user
    console.log('\n1. Finding or creating test user...');
    let user = await User.findOne({ email: testUser.email });
    
    if (!user) {
      console.log('Creating test admin user...');
      user = new User({
        name: 'Admin User',
        email: testUser.email,
        password: testUser.password,
        role: 'admin'
      });
      await user.save();
      console.log('Test admin user created:', {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      });
    } else {
      console.log('Existing user found:', {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      });
    }

    // Test password comparison
    console.log('\n2. Testing password comparison...');
    const isMatch = await user.comparePassword(testUser.password);
    console.log('Password match:', isMatch);

    // Test token generation
    console.log('\n3. Testing token generation...');
    const token = await user.generateAuthToken();
    console.log('Token generated:', !!token);
    if (token) {
      console.log('Token length:', token.length);
    }

    // Test full login flow
    console.log('\n4. Testing full login flow...');
    const loginUser = await User.findOne({ email: testUser.email });
    if (loginUser) {
      const passwordMatch = await loginUser.comparePassword(testUser.password);
      if (passwordMatch) {
        const authToken = await loginUser.generateAuthToken();
        console.log('Login successful:', {
          userId: loginUser._id,
          role: loginUser.role,
          tokenGenerated: !!authToken
        });
      } else {
        console.log('Login failed: Password does not match');
      }
    } else {
      console.log('Login failed: User not found');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the test
testLogin(); 