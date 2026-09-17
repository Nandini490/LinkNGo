/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error stack in development for debugging
  console.error(err.stack);

  // Return a consistent JSON structure to the client without exposing the stack trace
  res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
};

module.exports = errorHandler;
