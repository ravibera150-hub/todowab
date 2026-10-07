/**
 * =========================================================================
 * Authentication Controller (controllers/authController.js)
 * =========================================================================
 * Handles user registration, user login, and user profile retrieval.
 * 
 * VIVA EXPLANATION:
 * - bcryptjs is used to hash passwords with salt rounds (10 rounds). Salting
 *   adds random data to the password before hashing to protect against rainbow
 *   table attacks.
 * - jsonwebtoken (JWT) generates a signed token containing { id: user._id },
 *   signed using process.env.JWT_SECRET and expiring as configured (e.g., 7 days).
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/dbAdapter');
const { sendOtpEmail } = require('../utils/sendEmail');

/**
 * Helper function to generate a signed JSON Web Token (JWT)
 * @param {string} id - The unique user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'wad_super_secret_jwt_key_2026_academic_demo',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // 2. Check if user with given email already exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // 3. Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save new user
    const user = await db.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // 5. Generate JWT token
    const token = generateToken(user._id);

    // 6. Return response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // 2. Check if user exists
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Verify password using bcrypt.compare()
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id);

    // 5. Send response
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Protected by authMiddleware)
 */
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Forgot / Reset password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.updateUserPassword(user._id, hashedPassword);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: error.message,
    });
  }
};

/**
 * @desc    Device-isolated Demo Login
 * @route   POST /api/auth/demo
 * @access  Public
 */
const demoLogin = async (req, res) => {
  try {
    const { deviceId } = req.body;
    const cleanDeviceId = deviceId
      ? String(deviceId).toLowerCase().trim().replace(/[^a-z0-9]/g, '')
      : Math.random().toString(36).substring(2, 8);
    
    const demoEmail = `demo_${cleanDeviceId}@wad.edu`;
    const demoName = `Demo User`;

    let user = await db.findUserByEmail(demoEmail);
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('demo_wad_pass_2026', salt);

      user = await db.createUser({
        name: demoName,
        email: demoEmail,
        password: hashedPassword,
      });

      // Seed initial starter tasks for this fresh device-isolated demo session!
      const todayStr = new Date().toISOString().split('T')[0];
      await db.createTask({
        userId: user._id,
        title: '👋 Welcome to your private TaskFlow Demo!',
        description: 'This demo workspace is isolated for your device. Tasks created here will not appear on other devices.',
        category: 'Personal',
        priority: 'High',
        date: todayStr,
        isCompleted: false,
      });
      await db.createTask({
        userId: user._id,
        title: '✅ Try completing a task',
        description: 'Click the checkbox on the left to mark tasks as completed.',
        category: 'Work',
        priority: 'Medium',
        date: todayStr,
        isCompleted: true,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in to device-isolated demo account',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Demo Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during demo login',
      error: error.message,
    });
  }
};

/**
 * @desc    Send OTP code for password reset
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a registered email address',
      });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await db.saveUserOtp(email, otp, 10); // OTP valid for 10 minutes

    // Send real email with OTP to user's email address
    await sendOtpEmail({ toEmail: email, otpCode: otp });

    return res.status(200).json({
      success: true,
      message: 'A 6-digit OTP verification code has been sent to your email address.',
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating OTP',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify OTP code & Reset Password
 * @route   POST /api/auth/verify-otp-reset
 * @access  Public
 */
const verifyOtpReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP code, and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await db.verifyAndResetUserPassword(email, otp, hashedPassword);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified and password reset successfully! You can now sign in.',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error resetting password with OTP',
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  forgotPassword,
  sendOtp,
  verifyOtpReset,
  demoLogin,
};

