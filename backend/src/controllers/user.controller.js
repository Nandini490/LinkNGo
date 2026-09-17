const User = require('../models/user.model');

/**
 * Update current user profile
 * PATCH /api/users/me
 */
const updateMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, profilePicture, vehicleType } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Explicitly select allowed fields to update. 
    // We do NOT use Object.assign(user, req.body) to avoid users modifying email, passwordHash, etc.
    if (username !== undefined) {
      if (username.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 2 characters long'
        });
      }
      user.username = username.trim();
    }
    
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }
    
    if (vehicleType !== undefined) {
      user.vehicleType = vehicleType;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateMe
};
