/**
 * Health check controller
 * Handles the logic for the /api/health endpoint
 */
const checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LinkNGo backend is running'
  });
};

module.exports = {
  checkHealth
};
