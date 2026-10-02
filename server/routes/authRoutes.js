/**
 * =========================================================================
 * Auth Routes (routes/authRoutes.js)
 * =========================================================================
 * REST endpoints for user authentication.
 * 
 * Endpoints:
 * - POST /api/auth/signup  -> Register new account
 * - POST /api/auth/login   -> Authenticate existing account & return JWT
 * - GET  /api/auth/profile -> Get logged-in user details (Protected)
 */

const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (require valid JWT)
router.get('/profile', protect, getProfile);

module.exports = router;
