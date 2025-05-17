const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully!');
    
    // Test User model
    const User = require('./models/User');
    console.log('User model loaded successfully');
    
    // Count users
    const userCount = await User.countDocuments();
    console.log(`Database contains ${userCount} users`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testConnection();
