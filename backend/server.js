require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Determine port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server only after connecting to the database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
