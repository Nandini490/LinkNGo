require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Determine port from environment variables or default to 5001
const PORT = process.env.PORT || 5001;

let server;

// Start the server only after connecting to the database
connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  
  // 1. Stop accepting new requests
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      
      // 2 & 3. Close the MongoDB connection and exit
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
