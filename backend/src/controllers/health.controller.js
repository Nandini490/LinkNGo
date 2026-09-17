const mongoose = require('mongoose');

/**
 * Health check controller
 * Handles the logic for the /api/health endpoint
 */
const checkHealth = (req, res) => {
  // Check mongoose connection state
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    success: true,
    message: 'Journey Link backend is running',
    database: isConnected ? 'connected' : 'disconnected'
  });
};

module.exports = {
  checkHealth
};
