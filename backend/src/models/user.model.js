const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    profilePicture: {
      type: String,
      default: null
    },
    vehicleType: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Method to safely return user object without exposing passwordHash
userSchema.methods.toSafeObject = function () {
  const userObj = this.toObject();
  
  // Transform _id to id for cleaner client-side handling if desired, 
  // but main thing is removing the passwordHash
  const safeUser = {
    id: userObj._id,
    username: userObj.username,
    email: userObj.email,
    profilePicture: userObj.profilePicture,
    vehicleType: userObj.vehicleType,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt
  };
  
  return safeUser;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
