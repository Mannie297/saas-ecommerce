import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  console.log('Testing MongoDB connection...');
  console.log('Connection string format check:');
  console.log('- Protocol:', mongoUri.startsWith('mongodb://') ? '✓' : '✗');
  console.log('- Host present:', mongoUri.includes('://') ? '✓' : '✗');
  console.log('- Database name present:', mongoUri.includes('/') ? '✓' : '✗');

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('\nSuccessfully connected to MongoDB');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (err) {
    const error = err as Error;
    console.error('\nConnection Error Details:');
    console.error('Error message:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\nConnection refused. Please check:');
      console.error('1. MongoDB server is running');
      console.error('2. MongoDB is listening on the correct port');
      console.error('3. No firewall is blocking the connection');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\nHostname not found. Please check:');
      console.error('1. MongoDB host address is correct');
      console.error('2. Network connectivity');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('\nConnection timed out. Please check:');
      console.error('1. Network connection');
      console.error('2. Firewall settings');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testConnection(); 