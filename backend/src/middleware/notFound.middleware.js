/**
 * 404 Not Found Middleware
 * Catch-all for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
};

module.exports = notFoundHandler;
