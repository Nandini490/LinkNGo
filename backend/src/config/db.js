const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Connect to MongoDB Atlas
    await mongoose.connect(uri);
    
    console.log('MongoDB connection established successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Exit process with failure code if database connection fails
    // This is important because the app cannot function without the database
    process.exit(1);
  }
};

module.exports = connectDB;
