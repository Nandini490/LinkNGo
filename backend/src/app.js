const express = require('express');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const journeyRoutes = require('./routes/journey.routes');

const app = express();

// Basic middleware for JSON parsing (even though health endpoint doesn't strictly need it, it's foundational)
app.use(express.json());

// Enable basic CORS for local development testing
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  next();
});

// Register API routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/journeys', journeyRoutes);

// 404 Route for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;
