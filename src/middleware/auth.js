const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const { sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return sendError(
        res,
        401,
        'AUTHENTICATION_ERROR',
        'Not authorized to access this route. Please login.'
      );
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return sendError(
          res,
          401,
          'AUTHENTICATION_ERROR',
          'User no longer exists'
        );
      }

      if (!user.isActive) {
        return sendError(
          res,
          401,
          'AUTHENTICATION_ERROR',
          'Your account has been deactivated'
        );
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return sendError(
        res,
        401,
        'AUTHENTICATION_ERROR',
        'Invalid or expired token'
      );
    }
  } catch (error) {
    logger.error(`Authentication middleware error: ${error.message}`);
    return sendError(
      res,
      500,
      'SERVER_ERROR',
      'Error authenticating user'
    );
  }
};

/**
 * Optional authentication - Doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but don't fail - just continue without user
        logger.warn(`Optional auth token invalid: ${error.message}`);
      }
    }

    next();
  } catch (error) {
    logger.error(`Optional authentication error: ${error.message}`);
    next();
  }
};

module.exports = { protect, optionalAuth };
