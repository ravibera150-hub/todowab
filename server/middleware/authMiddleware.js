/**
 * =========================================================================
 * Authentication Middleware (middleware/authMiddleware.js)
 * =========================================================================
 * Protects routes by verifying the JSON Web Token (JWT) sent in the HTTP request.
 * 
 * VIVA EXPLANATION:
 * - JWT is a stateless authentication mechanism.
 * - When a user logs in, the server generates a signed JWT containing the user ID.
 * - The client stores this token in localStorage and attaches it to the 'Authorization'
 *   header as "Bearer <token>" for all subsequent protected API requests.
 * - This middleware intercepts the request, extracts the token, verifies the signature
 *   using JWT_SECRET, and attaches the decoded user object to 'req.user'.
 * - If the token is missing or invalid/expired, it responds with HTTP 401 Unauthorized.
 */

const jwt = require('jsonwebtoken');
const db = require('../data/dbAdapter');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and begins with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // 2. Extract token from header string (e.g., "Bearer eyJhbGciOi...")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token signature and expiration
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'wad_super_secret_jwt_key_2026_academic_demo'
      );

      // 4. Fetch the user from database without password and attach to request
      req.user = await db.findUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      // 5. Proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }
};

module.exports = { protect };
