const express = require('express');
const cors = require('cors');

// Import routes
const healthRoutes = require('./routes/health.routes');

// Import middleware
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware: Parse incoming JSON requests
app.use(express.json());

// Middleware: Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Register API routes
app.use('/api', healthRoutes);

// Middleware: 404 Not Found handler for undefined routes
app.use(notFoundHandler);

// Middleware: Centralized Error handler
app.use(errorHandler);

module.exports = app;
