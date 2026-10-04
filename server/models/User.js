/**
 * =========================================================================
 * User Model (models/User.js)
 * =========================================================================
 * Defines the MongoDB schema for a User in the application.
 * 
 * VIVA EXPLANATION:
 * - A Mongoose Schema maps directly to a MongoDB collection and defines the
 *   shape of the documents within that collection.
 * - Password is never stored in plain text; it is hashed using bcrypt before saving.
 * - The email field is set to unique to prevent multiple registrations with the same address.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Method to remove sensitive password field when converting document to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;

