const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Register a new user
 * Handles the logic for validating and storing a new user in the database
 */
const registerUser = async (req, res) => {
  try {
    // Extract fields from the request body
    const { name, email, password } = req.body;

    // 1. Validate that all three required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // 2. Check whether a user with the same email already exists
    const existingUser = await User.findOne({ email });
    
    // If the email already exists, return HTTP 409 Conflict
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // 3. Hash the password before saving
    // A salt is random data added to the password before hashing to make it completely unique
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the user using the existing User model, passing the hashed password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // 4. Return a successful response containing specific fields
    // NEVER return the password
    return res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    // 5. Handle MongoDB duplicate-key errors (error code 11000) safely
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // 6. Handle any other unexpected server errors
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Login a user
 * Handles verifying email and password
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate that email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 2. Find the user by email
    const user = await User.findOne({ email });

    // 3. If user doesn't exist, return generic error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 5. If password doesn't match, return same generic error
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 6. Generate a JWT token containing the user's ID
    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 7. Return success response with token and safe user data
    return res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get current authenticated user
 * Handles returning the user's profile information
 */
const getCurrentUser = async (req, res) => {
  try {
    // 1. Get the user ID from the verified JWT token (attached by middleware)
    const userId = req.user.sub;

    // 2. Find the user in MongoDB
    const user = await User.findById(userId);

    // 3. If user doesn't exist (e.g., deleted after token issuance), return error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // 4. Return success response with safe user data (exclude password)
    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
