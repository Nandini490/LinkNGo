const jwt = require('jsonwebtoken');

/**
 * Generate a JWT for a user
 * @param {string} userId - The ID of the authenticated user
 * @returns {string} The signed JWT
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

module.exports = {
  generateToken
};
