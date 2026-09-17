const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT tokens
 * Expects header: Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // 2. Check if header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // 3. Extract the token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed token.'
      });
    }

    // 4. Verify the token using the secret
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the user identity to the request object
    // The payload from Phase 5.6 was { sub: user._id }
    req.user = decodedToken;

    // 6. Pass control to the next middleware/controller
    next();
  } catch (error) {
    // Catch invalid or expired tokens
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = {
  authenticateToken
};
