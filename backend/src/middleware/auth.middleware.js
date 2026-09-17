const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Protects routes by validating the JWT token from the Authorization header
 */
const protect = (req, res, next) => {
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
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach user identity to request object
    // We only attach what's in the JWT payload (the userId)
    req.user = {
      userId: decoded.userId
    };

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.'
    });
  }
};

module.exports = { protect };
