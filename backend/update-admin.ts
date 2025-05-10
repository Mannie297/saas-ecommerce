import mongoose from 'mongoose';
import User from './src/models/User';

const MONGODB_URI = 'mongodb://localhost:27017/saas';

async function updateAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      { role: 'admin' },
      { new: true }
    );

    console.log('User updated:', result);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

updateAdmin(); 