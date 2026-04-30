import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import Post from './src/models/post.model.js';
import Product from './src/models/product.model.js';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed data from JSON file
const seedData = async () => {
  try {
    // Read seed data
    const seedDataPath = path.resolve('../seed-data.json');
    const rawData = fs.readFileSync(seedDataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Clear existing data
    await Post.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing posts and products');
    
    // Insert posts
    if (data.posts && data.posts.length > 0) {
      const posts = await Post.insertMany(data.posts);
      console.log(`Inserted ${posts.length} posts`);
    }
    
    // Insert products
    if (data.products && data.products.length > 0) {
      const products = await Product.insertMany(data.products);
      console.log(`Inserted ${products.length} products`);
    }
    
    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

// Run seeding
const startSeeding = async () => {
  await connectDB();
  await seedData();
};

startSeeding();