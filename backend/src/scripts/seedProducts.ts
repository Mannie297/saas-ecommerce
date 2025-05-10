import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import { products } from '../data/products';

// Load environment variables
dotenv.config();

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Add connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri, options);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${insertedProducts.length} products`);

    // Log the product IDs for reference
    console.log('Product IDs:');
    insertedProducts.forEach(product => {
      console.log(`${product.name}: ${product._id}`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedProducts(); 